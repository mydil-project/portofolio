# AGENTS.md — Portfolio Aidil Febrian

Static portfolio + Firebase admin dashboard. **No build step, no bundler, no npm for runtime, no linter/formatter/CI configured.** Do not invent `npm test` / `npm run build` — they do not exist.

## Commands

```bash
# run locally (Firebase CANNOT work over file://)
npx serve .            # -> http://localhost:5500  and  http://localhost:5500/admin/

# syntax check every JS file (PowerShell)
Get-ChildItem -Recurse -Filter *.js -Exclude *.min.js |
  Where-Object { $_.FullName -notlike "*node_modules*" } |
  ForEach-Object { node --check $_.FullName }

# tests (jsdom + in-memory fake Firebase; only dev tooling needs npm)
cd tests
npm install            # sekali saja, butuh internet
npm test               # 4 suite: run.js, test-header.js, test-hidden.js, test-sidebar.js
npm run check          # syntax check file JS website
```

Tests live in `tests/` (the **only** place with `node_modules`; excluded from hosting by
`firebase.json`). `harness.js` stubs Firebase: `freshState()`, `seedProjects()`, the fake Firestore **throws on `undefined` / `NaN` values just like the real SDK** (otherwise a write that only fails on Firebase slips through the tests),
`enforceRules` / `denyReads` / `failReads` select which error path is exercised, and
`loadPage()` executes the real HTML + real `js/*.js` inside jsdom. Root is resolved
relative to `tests/`, so no absolute path is hardcoded.

## Architecture wiring

The public site is **one HTML file** (`index.html`). There are no other public
pages, and there should not be any added back.

- `js/data.js` is the **only** module that touches Firestore/Auth/Storage. `js/site.js` calls `Data.*`; it never calls `firebase.*` directly.
- `js/site.js` holds all page behaviour: project list (category filter + sort; **no search box** — it was removed on purpose, keep it that way unless asked), skills grid, and the project detail **modal**. It replaced the old `home.js` / `projects.js` / `project.js`.
- `js/site-config.js` → `window.SITE` + `SITE_READY` / `SITE_ADMIN_READY` flags (auto-detects `GANTI_DENGAN` placeholders).
- `js/ui.js` auto-boots on `DOMContentLoaded` (nav, lightbox, reveal, demo banner, profile fill). Admin pages must set `window.UI_NO_BOOT = true` **before** loading `ui.js`.
- Script order matters: firebase CDN SDK → `site-config` → `seed-data` → `data` → `ui` → `site`. The public page uses `defer`; admin pages are blocking on purpose.
- Firestore collections: `projects/{id}` (slug is a normal field, not the doc id), `profile/main`, `skills/{id}`, `certifications/{id}`.
- **Certifications are Firestore-driven** (`certifications/{id}`: title, issuer, credentialId, date `YYYY-MM-DD`, url, status, order). `index.html` only ships an empty `#certGrid`; `js/site.js` `renderCertifications()` paints it from `Data.listCertifications("published")`, and `js/seed-data.js` holds 6 IBM certs as the offline fallback. The admin sidebar **Sertifikasi** (`#/certifications`, `admin.js` renderCertifications/saveCertification/moveCertification) writes them, including the up/down order buttons — same renumber-everything rule as projects, via `Data.saveCertOrders()`. Render the date with an explicit `timeZone: "UTC"` or it shifts a day for visitors west of Greenwich.
- Demo data (`js/seed-data.js`) is a **safety net only**, never a content source.

## Routing model

- Section navigation is **anchor only**: `#home`, `#about`, `#projects`, `#skills`, `#contact` (plus `#certifications`, `#interest`).
- Project detail is **not** a page. Cards link to `#project/<slug>`; `js/site.js` reads the hash on load and on every `hashchange`, then opens `#projectModal`.
- Closing the modal = the hash leaves `#project/<slug>`, but via `history.replaceState(null, "", "#projects")`, **not** `location.hash = ""` (that makes the browser jump to the top of the page). `replaceState` scrolls nowhere and adds no history entry, so Back never re-opens the modal; `close()` then dispatches a synthetic `hashchange` so `markActive()` highlights Projects. Never navigate the modal with `display` toggling alone — the hash is the single source of truth so the browser Back button works and the URL is shareable.
- `markActive()` in `ui.js` ignores hashes starting with `project/` (no nav item is "active" while the modal is open) and treats an empty hash as `#home`.
- `UI.lockScroll()` / `UI.unlockScroll()` are a **counter**, not a boolean — the modal and the gallery lightbox can both be open and must not cancel each other's scroll lock.
- `tests/run.js` asserts there is no `a[href$='.html']` on the public page. That test exists to stop multi-page regressions.

## Invariants — breaking these caused real bugs

1. **Demo data must never leak to visitors.** `Data.listProjects/listSkills/getProjectBySlug` fall back to `SEED` only when Firebase is unconfigured/offline. A successful-but-empty read returns `[]`. `permission-denied` must go through `handleReadError()` → empty + `isDenied()` (dashboard shows the red rules banner) — never `fallback`.
2. **Never add `orderBy` to Firestore queries.** Sorting is client-side on purpose so the project needs **no composite index**. Adding `orderBy` breaks the public site with `failed-precondition`.
3. **Use the `serverTimestamp()` helper**, not `firebase.firestore.FieldValue.*` directly (compat static namespace is unreliable). Every write path (`saveProject`, `saveCertification`, `saveSkill`, `saveProfile`, `saveOrders`, `saveCertOrders`) must pass its object through `cleanForWrite()`, which drops `undefined` and turns `NaN` into `null` — Firestore rejects both.
4. **App name is explicit** (`initializeApp(cfg, "portfolio")`) because the compat SDK auto-creates an app named `[DEFAULT]`; reusing it throws.
5. **Storage init is isolated in try/catch.** Firebase Storage needs the Blaze plan; a Storage failure must never disable Firestore. Gate upload UI with `Data.hasStorage()`.
5b. **Manual project order lives in the `order` field** (a number, 0 = top of the public list). `sortByOrder()` sorts client-side: `order === null` sorts **last** (so pre-existing projects fall back to newest-first until the admin moves anything). The admin up/down buttons call `Data.saveOrders()` and renumber *every* project, not just the two swapped — renumbering only two lets `null` and numbers mix and the order goes unstable after a few clicks. `saveProject()` must carry `order` forward from the old doc or editing a project silently resets its position. **A brand-new project always lands on top**: `Data.saveProject()` reads the collection first (`shiftOrdersDown()`), bumps every numeric `order` by +1, then writes the new doc with `order: 0` — so no two docs share a number. `order: null` is never written for a new project, and `undefined` is fatal (Firestore rejects it: `Unsupported field value: undefined (found in field order ...)`); `null` is what `sortByOrder()` treats as "sorts last". Shift must happen **before** the new `set()` so a failed shift can't leave two projects with the same order. The public `#sortSelect` **must still default to `"manual"`** so the admin order is what visitors see until they pick another sort. The option is a *disabled placeholder* labelled **"Urutan bawaan"** (not a choice, and not the old "Urutan Dashboard" wording); `site.js` mirrors `Data.sortByOrder` in its own `urutManual()`. If the default reverts to `"new"` (date sort) the admin order is silently ignored on the public page, and if the `manual` option is deleted outright the `<select>` shows "Terbaru" while the page actually renders admin order — a lying UI. `tests/run.js` `[2]` guards both.
6. **HTML text vs href vs image are separate contracts:** `data-profile` fills text, `data-href-field` fills href only, `data-profile-img` fills `src`/`alt` only, `data-highlight` allows `*...*` spans. Never `el.textContent = value` on elements with children — it destroys `<span>↗</span>` and leaks raw URLs into button labels. The portrait photo follows the same rule: `<img data-profile-img="profileImage" hidden>` + `<span data-portrait-initials>` fallback that `applyProfile()` hides only when a photo URL exists.
7. **Both CSS files need `[hidden] { display: none !important }`.** Author class `display` beats the UA `[hidden]` rule; without it `#loader` ("Memuat dashboard..."), `#shell`, and `#projectModal` (`.modal` is `display: flex`) never hide.
8. Sticky sidebar needs `position: sticky; top: 0; align-self: start; height: 100vh` — without `align-self: start` grid stretches it and sticky does nothing. Mobile (≤760px) must reset `height: auto`.
9. Sticky 72px navbar + anchor links → `scroll-padding-top` on `html` **and** `scroll-margin-top` on `[id]`, else section headings hide under the header.
10. Images are **paths in the repo** (`assets/img/projects/...`), not Storage. Cover = one text field; gallery = one path/URL per line. Admin previews relative paths with a `../` prefix because the admin lives one directory deep.
11. **Every `<tr>` must have exactly as many `<td>` as the table has `<th>`** (and empty states must use a matching `colspan`). Both admin tables split the order arrows (`.order-cell`, column *Urutan*) from the CRUD icons (`.row-actions`, column *Aksi*); merging them into one `<td>` silently shifts every later header and leaves *Aksi* blank. `tests/run.js` `[19]` guards the cell count, the split, and that every action button shares `.btn-icon`.

## Firebase facts (do not re-derive)

- Project `portofolio-c94f9`, region `asia-southeast2`. Config already filled in `js/site-config.js`.
- Admin email `aidilfebrian01@gmail.com` is duplicated in **three** places: `js/site-config.js` (`adminEmails`), `firestore.rules`, `storage.rules`. Changing it means editing all three.
- Rules are pasted **manually** in the Firebase console; there is no CLI deploy in this repo. If rules change here, say so — the user must republish.
- `storage.rules` is optional (no Blaze plan) — image paths are used instead.
- Firebase web config is public by design; **the admin password lives only in Firebase Console** and must never be written into a file. The user once used a weak password shared in chat — never echo or store credentials.
- LinkedIn URL is still a `GANTI_DENGAN` placeholder — never guess it from the GitHub username.

## Docs to keep in sync

`PRD.md` = requirements (Indonesian). `SETUP.md` = user-facing setup + troubleshooting. `README.md` = repo overview. Behaviour changes (error handling, image strategy, demo rules) belong in `SETUP.md` — that is what the user actually reads.

## Environment quirks

- PowerShell 5.1 on Windows: `grep` is **not** available — use `Select-String` or the Grep tool. Heredocs to `node -` must be piped via `Set-Content` to a temp file.
- This folder is **not yet a git repository** (no `.git`; `.gitignore` already added). Do not commit/push unless asked; deployment target is GitHub Pages (`.nojekyll` already present).
- Images committed to `assets/img/` require a separate `git push` from project-data edits, which happen only in Firestore.