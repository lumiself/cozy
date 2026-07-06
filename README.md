# cozy 🌙

An intimate little game for long distance couples.

No accounts, no backend, no app store — just a wheel and your phone's camera.

## How it works

1. Both of you open the site on your own phone (it doesn't need to be the same device or even the same moment).
2. One of you spins the wheel. It lands on a prompt.
3. Screenshot the result and send it to your partner over text/iMessage/whatever you already use.
4. Your partner replies with a photo or video doing what the wheel said.
5. Swap — now it's their turn to spin and send you a screenshot back.

Tap **✎ edit prompts** to write your own list of prompts (saved only on your device via `localStorage`, one per line, at least 2 required). Tap **reset to defaults** inside that editor to restore the built-in set.

## Running locally

It's a static site with no build step:

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploying to GitHub Pages

1. Push this repo to GitHub.
2. In the repo, go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to `Deploy from a branch`, pick the `main` branch and `/ (root)` folder.
4. Save — GitHub will publish the site at `https://<username>.github.io/<repo>/`.

## Stack

Vanilla HTML/CSS/JS. No dependencies, no build tools — just three files: `index.html`, `style.css`, `script.js`.
