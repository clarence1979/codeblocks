"""Run every lesson and quick example from a file:// copy (as if opened from a USB stick)."""
import asyncio, sys, pathlib, re
from playwright.async_api import async_playwright

FILE = pathlib.Path(__file__).with_name('codecraft.html').resolve().as_uri()
OUT = pathlib.Path(__file__).parent
results = []

def check(name, ok, detail=''):
    results.append((name, ok))
    print(('PASS ' if ok else 'FAIL ') + name + (f' - {detail}' if detail else ''), flush=True)

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        ctx = await browser.new_context(viewport={'width': 1600, 'height': 1000})
        external = []
        async def route(r):
            u = r.request.url
            if u.startswith(('file:', 'data:', 'blob:')):
                return await r.continue_()
            external.append(u)
            await r.abort()
        await ctx.route('**/*', route)
        page = await ctx.new_page()
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        await page.goto(FILE)
        await page.click('text=Start Learning!')
        await page.wait_for_function("() => !document.querySelector('button[title^=\"Python is still loading\"]')", timeout=60000)
        check('file:// copy loads Python', True)

        lessons = await page.locator('button:has(span.text-sm)').filter(has_text=re.compile(r'^\d+\. ')).all()
        names = [await b.inner_text() for b in lessons]
        for i, name in enumerate(names):
            btn = page.locator('button', has_text=name.strip()).first
            await btn.click()
            await page.wait_for_timeout(150)
            await page.click('button:has-text("Run Code")')
            await page.wait_for_selector('[role=log] >> text=/Code execution complete!|Your code stopped early|^Error/', timeout=60000)
            log = await page.locator('[role=log]').inner_text()
            ok = 'Code execution complete!' in log and 'Error' not in log
            blocks = await page.locator('text=/^Blocks: /').inner_text()
            check(f'lesson {name.strip()}', ok, blocks if ok else log[-300:].replace('\n', ' | '))

        await page.click('button:has-text("Quick Examples")')
        ex = await page.locator('div.max-h-40 button').all()
        titles = [await b.inner_text() for b in ex]
        for t in titles:
            await page.locator('div.max-h-40 button', has_text=t.split('\n')[0]).first.click()
            await page.wait_for_timeout(150)
            await page.click('button:has-text("Run Code")')
            await page.wait_for_selector('[role=log] >> text=/Code execution complete!|Your code stopped early|^Error/', timeout=60000)
            log = await page.locator('[role=log]').inner_text()
            ok = 'Code execution complete!' in log and 'Error' not in log
            blocks = await page.locator('text=/^Blocks: /').inner_text()
            check(f'example {t.splitlines()[0]}', ok, blocks if ok else log[-300:].replace('\n', ' | '))
            if 'House' in t:
                await page.click('button:has-text("Fit view")')
                await page.wait_for_timeout(400)
                await page.screenshot(path=str(OUT / 'shot_house.png'))

        # Fullscreen in and out keeps the world
        await page.click('button[aria-label="Fullscreen 3D View"]')
        await page.wait_for_timeout(500)
        b1 = await page.locator('text=/^Blocks: /').inner_text()
        await page.screenshot(path=str(OUT / 'shot_fullscreen.png'))
        await page.click('button:has-text("Exit Fullscreen")')
        await page.wait_for_timeout(500)
        b2 = await page.locator('text=/^Blocks: /').inner_text()
        check('fullscreen in/out keeps blocks', b1 == b2, b1)
        external = [u for u in external if 'paypalobjects' not in u]
        check('no network use from file:// (except PayPal button image)', not external, ', '.join(external[:3]))
        check('no page errors', not errors, ' | '.join(errors[:3]))
        await browser.close()
    failed = [r for r in results if not r[1]]
    print(f'\n{len(results) - len(failed)}/{len(results)} passed')

asyncio.run(main())
