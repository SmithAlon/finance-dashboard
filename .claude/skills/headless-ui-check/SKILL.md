---
name: headless-ui-check
description: Visually and behaviourally verify a web UI change by driving it in headless Chrome (screenshots in dark, light and phone widths; click through tabs and forms; catch console errors and horizontal overflow). Use whenever you have changed markup, styles or client-side scripts in a web project and need to see the result, or the user asks to test, screenshot, "check it in the browser", or confirm a UI refactor works, even if they don't mention Chrome. Works without installing Playwright or Puppeteer.
---

# Headless UI check

A build passing says nothing about whether the page looks right or the script runs. Look at it.

## Steps

1. **Build and serve over HTTP.** Do not open `dist/index.html` as `file://`: frameworks like Astro emit absolute asset paths (`/_astro/...`), so the CSS silently fails to load and you will "review" an unstyled page. Serve it (`npx astro preview --port 4399`, `npx vite preview`, `python3 -m http.server -d dist`), run it in the background, and poll `curl -s localhost:PORT` until it answers.
2. **Run the script**, bundled at `scripts/shoot.mjs` (Node 22+, Chrome or Chromium on PATH, no npm packages):
   ```bash
   node <skill>/scripts/shoot.mjs --url http://localhost:4399/ \
     --out <scratch>/shots/page --profile <scratch>/shots/profile \
     --scenarios "dark:dark:1100,light:light:1100,mobile:dark:390"
   ```
   A scenario is `name:colorScheme:width[:#hash]`. Each one emulates the colour scheme, sets the viewport (under 500px counts as a phone), reloads, and saves a full-page PNG. It prints the horizontal overflow in px (anything above 0 on the phone width is a bug) and any uncaught exceptions or `console.error` calls, and exits non-zero if there were any.
3. **Read the screenshots** with the Read tool. Check the states a reviewer would care about, not only the landing view: every tab, an empty state, a focused input, a hover-free default.
4. **Interact when behaviour changed.** Pass `--run steps.js`: a file containing one JS expression evaluated in the page before each shot (`window.__scenario` holds the scenario name). Dispatch real events: set `.value`, then `dispatchEvent(new Event('input', {bubbles: true}))`, or listeners on `input` will not fire. Return the numbers you care about as a string and compare them with what you computed by hand. See `steps.example.js`.
5. **Clean up.** Kill the preview server (`pkill -f "port 4399"`), and keep the profile directory in the scratchpad, not the project.

## Gotchas

- Always give each run its own `--profile` directory when a previous Chrome may still be alive; a locked profile makes Chrome exit silently.
- localStorage persists inside a profile. A form that remembers edits will show last run's edits; use a fresh profile for a clean state, or deliberately reuse one to test persistence across reload.
- Tool commands that background a server and then `pkill` it can report exit code 144 even when the check passed. Trust the script's own output, not that code.
- If the project has no TypeScript installed (`npx tsc` prompts to install), skip type checking rather than letting a prompt hang; the build plus this check is still meaningful. Likewise `astro check` can hang; run it with `timeout`.
