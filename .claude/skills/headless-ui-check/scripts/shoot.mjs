#!/usr/bin/env node
// Drive a page in headless Chrome over the DevTools protocol: screenshots per scenario,
// optional page-side JS to interact first, console-error report, horizontal-overflow check.
// Needs Node 22+ (global WebSocket/fetch) and google-chrome / chromium on PATH. No npm deps.
//
// node shoot.mjs --url http://localhost:4399/ --out /tmp/shots/page --profile /tmp/shots/profile \
//   --scenarios "dark:dark:1100,light:light:1100,mobile:dark:390" [--run steps.js] [--port 9333]
//
// scenario = name:colorScheme(dark|light):width[:#hash]
// --run    = file of JS evaluated in the page before each shot; the scenario name is `window.__scenario`
import { spawn } from 'node:child_process';
import fs from 'node:fs';

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const url = arg('url'), out = arg('out'), profile = arg('profile');
if (!url || !out || !profile) { console.error('need --url --out --profile'); process.exit(2); }
const port = arg('port', '9333');
const scenarios = arg('scenarios', 'dark:dark:1100').split(',').map((s) => {
  const [name, scheme, width, hash = ''] = s.split(':');
  return { name, scheme, width: +width, hash };
});
const runJs = arg('run') && fs.readFileSync(arg('run'), 'utf8');

const bin = ['google-chrome', 'chromium', 'chromium-browser'].find((b) =>
  (process.env.PATH ?? '').split(':').some((d) => fs.existsSync(`${d}/${b}`)));
if (!bin) { console.error('no chrome/chromium on PATH'); process.exit(2); }

const chrome = spawn(bin, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, 'about:blank'], { stdio: 'ignore' });
const done = (code) => { chrome.kill(); process.exit(code); };

let targets;
for (let i = 0; i < 40 && !targets; i++) {
  await new Promise((r) => setTimeout(r, 250));
  try { targets = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).filter((t) => t.type === 'page'); } catch {}
}
if (!targets?.length) { console.error('chrome did not start'); done(2); }

const ws = new WebSocket(targets[0].webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0; const pending = {}; const problems = [];
ws.onmessage = (m) => {
  const d = JSON.parse(m.data);
  if (d.id) pending[d.id](d);
  if (d.method === 'Runtime.exceptionThrown') problems.push(d.params.exceptionDetails.exception?.description ?? 'exception');
  if (d.method === 'Runtime.consoleAPICalled' && d.params.type === 'error') problems.push('console.error: ' + d.params.args.map((a) => a.value ?? a.description).join(' '));
};
const send = (method, params = {}) => new Promise((r) => { pending[++id] = r; ws.send(JSON.stringify({ id, method, params })); });
const evaluate = async (expression) => (await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })).result.result?.value;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

await send('Runtime.enable'); await send('Page.enable');
fs.mkdirSync(out.replace(/\/[^/]*$/, '') || '.', { recursive: true });

for (const s of scenarios) {
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: s.scheme }] });
  await send('Emulation.setDeviceMetricsOverride', { width: s.width, height: 1000, deviceScaleFactor: 1, mobile: s.width < 500 });
  await send('Page.navigate', { url: url + s.hash });
  await wait(1500);
  if (runJs) { await evaluate(`window.__scenario=${JSON.stringify(s.name)}`); console.log(`${s.name} run ->`, await evaluate(runJs)); await wait(300); }
  const overflow = await evaluate('document.documentElement.scrollWidth - document.documentElement.clientWidth');
  const file = `${out}-${s.name}.png`;
  fs.writeFileSync(file, Buffer.from((await send('Page.captureScreenshot', { captureBeyondViewport: true })).result.data, 'base64'));
  console.log(`${s.name}: ${file}  horizontal-overflow=${overflow}px`);
}
console.log(problems.length ? 'PAGE ERRORS:\n' + problems.join('\n') : 'page errors: none');
done(problems.length ? 1 : 0);
