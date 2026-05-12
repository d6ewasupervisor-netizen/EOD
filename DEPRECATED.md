# ⚠️ This repo is no longer the source of truth for the EOD app

As of 2026-05-12, the EOD HTML files in this repo (`index.html`, `signin.html`,
`admin.html`) are **frozen**. The deployed copy lives at:

> `OneDrive/Documents/GitHub/the-dump-bin/EOD/index.html`

(repo: `https://github.com/d6ewasupervisor-netizen/the-dump-bin`)

Why: The Dump Bin sign-in flow now covers every app under
`the-dump-bin.com`, not just `/EOD/`. Maintaining two copies of `index.html`
that have to stay byte-for-byte identical was producing drift bugs, and the
hub repo already hosts the sibling apps (`/claims/`, `/suncare/`,
`/shirt-order/`, etc.) as plain folders.

The shared `/auth-gate.js` boot guard, `/signin.html`, and `/admin.html` are
in the hub repo. Edit them there.

## If you find yourself wanting to edit this folder

Stop. Edit `the-dump-bin/EOD/index.html` instead, commit the hub repo,
push. GitHub Pages rebuilds and the change is live.

## What was lost / preserved

- The git history at `d6ewasupervisor-netizen/EOD` is preserved on GitHub.
  Tag the last meaningful commit if you ever need to fork the EOD app out
  again.
- The Node side (this folder's `src/`, `package.json`, etc.) for the
  cover-sheet API stayed in `eod-api/` — that repo is unaffected.
