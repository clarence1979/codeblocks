"""Offline + core behaviour tests for the standalone Code Blocks page."""
import asyncio, json, sys, time, pathlib
from playwright.async_api import async_playwright

HTML = pathlib.Path(__file__).with_name('codecraft.html').read_bytes()
URL = 'https://local.test/codecraft.html'
OUT = pathlib.Path(__file__).parent

results = []


def check(name, ok, detail=''):
    results.append((name, ok, detail))
    print(('PASS ' if ok else 'FAIL ') + name + (f' - {detail}' if detail else ''), flush=True)


async def set_code(page, code):
    await page.evaluate("""(code) => {
        const ed = window.monaco?.editor?.getEditors?.()[0];
        if (ed) { ed.setValue(code); return; }
        throw new Error('no editor');
    }""", code)


async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--enable-unsafe-swiftshader', '--use-gl=swiftshader'])
        ctx = await browser.new_context(viewport={'width': 1440, 'height': 900}, accept_downloads=True)
        external = []

        async def route(r):
            u = r.request.url
            if u.startswith(URL):
                await r.fulfill(body=HTML, content_type='text/html')
            elif u.startswith('data:') or u.startswith('blob:'):
                await r.continue_()
            else:
                external.append(u)
                await r.abort()
        await ctx.route('**/*', route)
        page = await ctx.new_page()
        logs = []
        page.on('console', lambda m: logs.append(f'{m.type}: {m.text}'))
        page.on('pageerror', lambda e: logs.append(f'PAGEERROR: {e}'))
        page.on('worker', lambda w: logs.append(f'worker started {w.url[:40]}'))

        t0 = time.time()
        await page.goto(URL)
        await page.wait_for_selector('text=Welcome to Code Blocks!', timeout=30000)
        check('loads with no login screen', await page.locator('text=/log ?in|password/i').count() == 0)
        await page.click('text=Start Learning!')

        # Expose monaco for tests through the editor DOM
        await page.wait_for_selector('.monaco-editor', timeout=30000)
        check('editor loads offline', True)

        # Wait for Python ready (Run button no spinner)
        await page.wait_for_function("() => !document.querySelector('button[title^=\"Python is still loading\"]')", timeout=60000)
        check('python loads offline', True, f'{time.time()-t0:.1f}s after page load')

        # Run lesson 1 as loaded
        await page.click('button:has-text("Run Code")')
        await page.wait_for_selector('text=Code execution complete!', timeout=30000)
        count = await page.locator('text=/^Blocks: /').inner_text()
        console = await page.locator('[role=log]').inner_text()
        check('lesson 1 runs', 'complete' in console, count)
        await page.screenshot(path=str(OUT / 'shot_lesson1.png'))

        # Does monaco exist on window? Find a way to set code: use keyboard select-all + type
        async def type_code(code):
            await page.click('.monaco-editor .view-lines')
            await page.keyboard.press('Control+A')
            await page.keyboard.press('Delete')
            # Insert through the app's own insert event (no auto-indent), replacing the selection
            await page.evaluate("(t) => window.dispatchEvent(new CustomEvent('codeblocks:insert', {detail: t}))", code)

        # Error formatting
        await type_code("x = 1\nprint('hi')\nprint(y)\n")
        await page.click('button:has-text("Run Code")')
        await page.wait_for_selector('text=/Your code stopped early/', timeout=30000)
        console = await page.locator('[role=log]').inner_text()
        check('error shows student line number', 'Line 3' in console and "NameError: name 'y' is not defined" in console, console[-300:].replace('\n', ' | '))

        # Unknown material
        await type_code("from codeblocks import Game, Position\ngame = Game()\nm = game.materials\ngame.set_block(Position(0,1,0), m['steel'])\n")
        await page.click('button:has-text("Run Code")')
        await page.wait_for_selector('text=/Your code stopped early/', timeout=30000)
        console = await page.locator('[role=log]').inner_text()
        check('unknown material explained', "no material called 'steel'" in console, console[-250:].replace('\n', ' | '))

        # Clear world, then big build: 200,000 blocks
        await page.click('button:has-text("Clear World")')
        big = ("from codeblocks import Game, Position\ngame = Game()\nm = game.materials\n"
               "for x in range(100):\n    for z in range(100):\n        for y in range(1, 21):\n            game.set_block(Position(x - 50, y, z - 50), m['stone'] if y < 20 else m['grass'])\n"
               "print('done big')\n")
        await type_code(big)
        t1 = time.time()
        await page.click('button:has-text("Run Code")')
        await page.wait_for_selector('text=Code execution complete!', timeout=120000)
        dt = time.time() - t1
        console = await page.locator('[role=log]').inner_text()
        check('big build prints once at end', console.count('done big') == 1)
        count = await page.locator('text=/^Blocks: /').inner_text()
        check('200,000-block build (no 10,000 cap)', '200,000' in count, f'{count} in {dt:.1f}s')
        await page.click('button:has-text("Fit view")')
        await page.wait_for_timeout(500)
        await page.screenshot(path=str(OUT / 'shot_big.png'))

        # Responsiveness during a long run + Stop
        await type_code("from codeblocks import Game, Position\ngame = Game()\nm = game.materials\ni = 0\nwhile True:\n    i += 1\n    if i % 5000000 == 0:\n        print('still going', i)\n")
        await page.click('button:has-text("Run Code")')
        await page.wait_for_selector('button:has-text("Stop")', timeout=10000)
        await page.wait_for_timeout(1500)
        await page.screenshot(path=str(OUT / 'shot_running.png'))
        info = await page.evaluate("() => Array.from(document.querySelectorAll('button')).filter(b => /Stop/.test(b.textContent)).map(b => b.outerHTML.slice(0,200) + ' visible=' + (b.offsetParent!==null))")
        print('STOP BUTTONS', info, flush=True)
        t2 = time.time()
        await page.evaluate("() => 1")  # page responsive?
        resp = time.time() - t2
        await page.click('button:has-text("Stop")')
        await page.wait_for_selector('text=/^Stopped\\./', timeout=10000)
        check('infinite loop can be stopped, page stays responsive', resp < 0.5, f'eval took {resp*1000:.0f}ms')
        count = await page.locator('text=/^Blocks: /').inner_text()
        check('blocks kept after stop', '200,000' in count, count)

        # Run again after stop (python restarts)
        await type_code("print('after stop ok')\n")
        await page.click('button:has-text("Run Code")')
        await page.wait_for_selector('text=after stop ok', timeout=60000)
        check('runs again after stop', True)

        # Air removes blocks and collision detection off replaces
        await page.click('button:has-text("Clear World")')
        await type_code("from codeblocks import Game, Position\ngame = Game()\nm = game.materials\nfor x in range(5):\n    game.set_block(Position(x,1,0), m['brick'])\nprint(game.set_block(Position(0,1,0), m['gold']))\ngame.set_block(Position(4,1,0), m['air'])\ngame.disable_collision_detection()\nprint(game.set_block(Position(1,1,0), m['gold']))\n")
        await page.click('button:has-text("Run Code")')
        await page.wait_for_selector('text=Code execution complete!', timeout=30000)
        console = await page.locator('[role=log]').inner_text()
        count = await page.locator('text=/^Blocks: /').inner_text()
        check('collision, air removal, overwrite', 'False' in console and 'True' in console and count.endswith(' 4'), f'{count}; ' + console.replace('\n', ' | ')[-120:])

        # STL export
        await page.click('button:has-text("Export STL")')
        async with page.expect_download() as dl:
            await page.click('button:has-text("Export Selected")')
        d = await dl.value
        path = await d.path()
        data = pathlib.Path(path).read_bytes()
        import struct
        tri = struct.unpack('<I', data[80:84])[0]
        # 4 blocks in a row: exposed faces = 4*6 - 2*3 = 18 -> 36 triangles
        check('STL export is binary with hidden faces removed', tri == 36 and len(data) == 84 + 50 * tri, f'{tri} triangles, {d.suggested_filename}')

        # Materials palette insert
        await page.click('button:has-text("Materials Palette")')
        await page.click('.monaco-editor .view-lines')
        await page.keyboard.press('Control+End')
        await page.click('button[title="Insert materials[\'diamond\']"]')
        await page.wait_for_timeout(300)
        txt = await page.evaluate("() => document.querySelector('.monaco-editor .view-lines').textContent")
        note = await page.locator('text=/Added materials/').count()
        await page.screenshot(path=str(OUT / 'shot_palette.png'))
        check('palette inserts material at cursor', "materials['diamond']" in txt.replace(chr(160), ' '), f'note={note} tail={txt[-80:]!r}')

        # AI panel not on teachingtools.dev: key box shown, no key text
        form = page.locator('input#openai-key')
        check('key box shown off teachingtools.dev', await form.count() == 1)
        check('AI dot shows off', await page.locator('text=AI off').count() >= 1)

        external = [u for u in external if 'paypalobjects.com' not in u]  # optional donate button image
        check('no outside network requests (except the optional PayPal button image)', len(external) == 0, ', '.join(external[:5]))
        errs = [l for l in logs if 'PAGEERROR' in l or (l.startswith('error') and 'ERR_FAILED' not in l)]
        check('no page errors', not errs, ' || '.join(errs[:5]))
        await browser.close()

    failed = [r for r in results if not r[1]]
    print(f'\n{len(results) - len(failed)}/{len(results)} passed')
    sys.exit(1 if failed else 0)

asyncio.run(main())
