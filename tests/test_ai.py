"""AI access tests: own key, teachingtools.dev desktop pass, key bridge signed in/out."""
import asyncio, json, sys, pathlib
from playwright.async_api import async_playwright

HTML = pathlib.Path(__file__).with_name('codecraft.html').read_bytes()
OUT = pathlib.Path(__file__).parent
RELAY = 'https://yihztkqrfxgvvsovpmfu.supabase.co/functions/v1/eduai-ai'
GOOD_KEY = 'sk-test-' + 'A' * 40
PASS = 'p' * 40
results = []


def check(name, ok, detail=''):
    results.append((name, ok))
    print(('PASS ' if ok else 'FAIL ') + name + (f' - {detail}' if detail else ''), flush=True)


COMPLETION = {'choices': [{'message': {'content': "```python\nfrom codeblocks import Game, Position\n\ngame = Game()\nmaterials = game.materials\nprint('AI tower')\nfor y in range(1, 6):\n    game.set_block(Position(0, y, 0), materials['gold'])\n```"}}]}

DESKTOP = """<!doctype html><html><body style="margin:0"><iframe id=f src="https://materials.teachingtools.dev/codecraft.html" style="width:1400px;height:880px;border:0"></iframe>
<script>
window.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'REQUEST_API_VALUES') {
    e.source.postMessage({type:'API_VALUES_RESPONSE', data:{username:'mrgoh', userId:'u1', isAdmin:true, authToken:'%s'}}, e.origin);
  }
});
</script></body></html>""" % PASS

BRIDGE = """<!doctype html><script>
parent.postMessage({type:'EDUAI_BRIDGE_READY'}, '*');
window.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'EDUAI_KEYS_REQUEST') {
    e.source.postMessage(%s, e.origin);
  }
});
</script>"""


async def make_ctx(browser, bridge_signed_in=None):
    ctx = await browser.new_context(viewport={'width': 1440, 'height': 900})
    seen = []

    async def route(r):
        u = r.request.url
        h = r.request.headers
        if u.endswith('/codecraft.html'):
            return await r.fulfill(body=HTML, content_type='text/html')
        if u == 'https://teachingtools.dev/desk.html':
            return await r.fulfill(body=DESKTOP, content_type='text/html')
        if u.startswith('https://teachingtools.dev/key-bridge.html'):
            msg = {'type': 'EDUAI_KEYS', 'signedIn': False}
            if bridge_signed_in:
                msg = {'type': 'EDUAI_KEYS', 'signedIn': True, 'data': {'passOnly': True, 'username': 'student7', 'userId': 'u7', 'isAdmin': False, 'authToken': PASS}}
            return await r.fulfill(body=BRIDGE % json.dumps(msg), content_type='text/html')
        if u.startswith(RELAY):
            seen.append(('relay', u, h.get('x-session-token'), h.get('authorization')))
            if r.request.method == 'OPTIONS':
                return await r.fulfill(status=204, headers={'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*'})
            if u.endswith('/status'):
                return await r.fulfill(json={'providers': {'openai': True, 'anthropic': False, 'gemini': False}}, headers={'access-control-allow-origin': '*'})
            if u.endswith('/openai/v1/chat/completions'):
                return await r.fulfill(json=COMPLETION, headers={'access-control-allow-origin': '*'})
            return await r.fulfill(status=404, headers={'access-control-allow-origin': '*'})
        if u.startswith('https://api.openai.com/'):
            seen.append(('openai', u, None, h.get('authorization')))
            cors = {'access-control-allow-origin': '*', 'access-control-allow-headers': '*'}
            if r.request.method == 'OPTIONS':
                return await r.fulfill(status=204, headers=cors)
            ok = h.get('authorization') == f'Bearer {GOOD_KEY}'
            if not ok:
                return await r.fulfill(status=401, json={'error': {'message': 'Incorrect API key provided'}}, headers=cors)
            if u.endswith('/v1/models'):
                return await r.fulfill(json={'data': []}, headers=cors)
            if u.endswith('/v1/chat/completions'):
                return await r.fulfill(json=COMPLETION, headers=cors)
        if u.startswith('data:') or u.startswith('blob:'):
            return await r.continue_()
        return await r.abort()

    await ctx.route('**/*', route)
    return ctx, seen


async def ready_page(page):
    await page.wait_for_selector('text=Start Learning!', timeout=30000)
    await page.click('text=Start Learning!')
    await page.wait_for_selector('.monaco-editor', timeout=30000)


async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])

        # A. Own key, page not on teachingtools.dev
        ctx, seen = await make_ctx(browser)
        page = await ctx.new_page()
        await page.goto('https://school-usb.example/codecraft.html')
        await ready_page(page)
        await page.wait_for_selector('input#openai-key', timeout=15000)
        check('A: key box shown when not on teachingtools.dev', True)
        check('A: no sign-in button off teachingtools.dev', await page.locator('text=Sign in at teachingtools.dev').count() == 0)
        await page.screenshot(path=str(OUT / 'shot_ai_nokey.png'))
        await page.click('button:has-text("Generate Code")', force=True)
        note = await page.locator('text=/AI is not set up yet/').count()
        check('A: Generate explains when no key', note >= 1)
        await page.fill('input#openai-key', 'sk-wrong-' + 'B' * 30)
        await page.click('button:has-text("Use key")')
        await page.wait_for_selector('text=/did not accept that key/', timeout=10000)
        check('A: wrong key rejected with message', True)
        check('A: key field is a password field', await page.get_attribute('input#openai-key', 'type') == 'password')
        await page.fill('input#openai-key', GOOD_KEY)
        await page.click('button:has-text("Use key")')
        await page.wait_for_selector('text=AI ready', timeout=10000)
        body = await page.inner_text('body')
        html = await page.content()
        check('A: green AI ready after valid key', await page.locator('.bg-green-500').count() >= 1)
        check('A: key never shown on the page', GOOD_KEY not in body and GOOD_KEY not in html)
        await page.fill('#ai-prompt', 'a gold tower')
        await page.click('button:has-text("Generate Code")')
        await page.wait_for_selector('text=Code generated successfully!', timeout=15000)
        txt = (await page.evaluate("() => document.querySelector('.monaco-editor .view-lines').textContent")).replace('\xa0', ' ')
        check('A: AI code lands in editor without markdown fences', "print('AI tower')" in txt and '```' not in txt)
        chat = [s for s in seen if s[1].endswith('/chat/completions')]
        check('A: own key goes straight to OpenAI', chat and chat[-1][0] == 'openai' and chat[-1][3] == f'Bearer {GOOD_KEY}')
        await page.click('button:has-text("Run Code")')
        await page.wait_for_selector('text=Code execution complete!', timeout=60000)
        check('A: AI code runs', 'AI tower' in await page.locator('[role=log]').inner_text())
        await page.screenshot(path=str(OUT / 'shot_ai_own.png'))
        # reload: saved key re-validated
        await page.reload()
        await ready_page(page)
        await page.wait_for_selector('text=AI ready', timeout=15000)
        check('A: saved key works after reload', True)
        await page.click('text=Forget my key')
        await page.wait_for_selector('input#openai-key', timeout=5000)
        stored = await page.evaluate("() => localStorage.getItem('codecraft_openai_key')")
        check('A: Forget my key removes it', stored is None)
        await ctx.close()

        # B. Inside the teachingtools.dev desktop
        ctx, seen = await make_ctx(browser)
        page = await ctx.new_page()
        await page.goto('https://teachingtools.dev/desk.html')
        frame = None
        for _ in range(100):
            frame = next((f for f in page.frames if f.url.endswith('/codecraft.html')), None)
            if frame:
                break
            await page.wait_for_timeout(100)
        await frame.wait_for_selector('text=Start Learning!', timeout=30000)
        await frame.click('text=Start Learning!')
        await frame.wait_for_selector('text=AI ready', timeout=15000)
        check('B: desktop pass gives green AI ready', True)
        check('B: no key box inside the desktop', await frame.locator('input#openai-key').count() == 0)
        title = await frame.get_attribute('[role=status][title^="AI ready"]', 'title')
        check('B: status names the teachingtools.dev user', 'mrgoh' in (title or ''), title)
        await frame.fill('#ai-prompt', 'a gold tower')
        await frame.click('button:has-text("Generate Code")')
        await frame.wait_for_selector('text=Code generated successfully!', timeout=15000)
        relay = [s for s in seen if s[0] == 'relay' and s[1].endswith('/openai/v1/chat/completions')]
        direct = [s for s in seen if s[0] == 'openai']
        check('B: request goes through teachingtools.dev relay with the pass', relay and relay[-1][2] == PASS and not relay[-1][3], str(relay[-1:]))
        check('B: nothing sent straight to OpenAI', not direct)
        body = await frame.inner_text('body')
        check('B: no key text shown', 'sk-' not in body)
        await page.screenshot(path=str(OUT / 'shot_ai_desktop.png'))
        await ctx.close()

        # C. On materials.teachingtools.dev, signed out
        ctx, seen = await make_ctx(browser, bridge_signed_in=False)
        page = await ctx.new_page()
        await page.goto('https://materials.teachingtools.dev/codecraft.html')
        await ready_page(page)
        await page.wait_for_selector('text=Sign in at teachingtools.dev', timeout=15000)
        check('C: signed out on teachingtools.dev shows sign-in button and key box', await page.locator('input#openai-key').count() == 1)
        await ctx.close()

        # D. On materials.teachingtools.dev, signed in through the key bridge
        ctx, seen = await make_ctx(browser, bridge_signed_in=True)
        page = await ctx.new_page()
        await page.goto('https://materials.teachingtools.dev/codecraft.html')
        await ready_page(page)
        await page.wait_for_selector('text=AI ready', timeout=15000)
        check('D: signed in through key bridge gives green AI ready', await page.locator('input#openai-key').count() == 0)
        await ctx.close()

        # E. Phone layout
        ctx, seen = await make_ctx(browser)
        await ctx.close()
        ctx = await browser.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True)
        await ctx.route('**/*', lambda r: r.fulfill(body=HTML, content_type='text/html') if r.request.url.endswith('codecraft.html') else (r.continue_() if r.request.url.startswith(('data:', 'blob:')) else r.abort()))
        page = await ctx.new_page()
        await page.goto('https://local.test/codecraft.html')
        await page.wait_for_selector('text=Start Learning!', timeout=30000)
        await page.click('text=Start Learning!')
        await page.wait_for_timeout(1000)
        await page.screenshot(path=str(OUT / 'shot_phone_3d.png'))
        await page.click('button:has-text("Code")')
        await page.wait_for_timeout(1500)
        await page.screenshot(path=str(OUT / 'shot_phone_code.png'))
        await ctx.close()
        await browser.close()

    failed = [r for r in results if not r[1]]
    print(f'\n{len(results) - len(failed)}/{len(results)} passed')
    sys.exit(1 if failed else 0)

asyncio.run(main())
