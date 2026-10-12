# TUTIM: modern and legacy interfaces

The redesigned interface from `tutor_information_management_v2` is integrated here, alongside the original UI. The normal local build uses one backend, the same accounts, and the existing `tutim` database. A separate demo build runs entirely in the browser for GitHub Pages.

## GitHub Pages: frontend-only demo

The Pages build contains 12 fictional teachers, 6 fictional students, 11 courses, and example reviews. Both interfaces support browsing, filters, search, course/profile details, and remembered UI switching. No API or database is started or contacted. Sign-in, registration, editing, reviews, and connections are disabled in this read-only demo. The demo's sample data is public; never replace it with real personal records or credentials.

To publish:

1. Commit and push the changes to `main`.
2. In GitHub, open **Settings → Pages → Build and deployment → Source**, and select **GitHub Actions**. If Pages requires a public repository on your plan, review its contents before changing visibility.
3. In **Actions**, run **Deploy frontend demo to GitHub Pages** (or push another commit to `main`).
4. Open `https://levan1199.github.io/tutim/` after the workflow succeeds.

The workflow `.github/workflows/pages.yml` uses Node 24, builds and tests the demo, and publishes only `client/dist`. It does not need database passwords, a JWT secret, cloud hosting, or Docker. Backend source remains available in the repository but is not deployed. The repository name determines the deployed base path.

To preview with Node 24:

```powershell
npm ci
npm run build:pages
npm run preview:pages
# Open http://localhost:3001/tutim/
```

To preview with Docker Desktop, without starting the backend or MongoDB:

```powershell
docker run --rm -it -p 127.0.0.1:3001:3001 `
  --mount "type=bind,source=$($PWD.Path),target=/app" `
  --mount "type=volume,source=tutim-pages-modules,target=/app/node_modules" `
  -w /app node:24-bookworm-slim `
  sh -c "npm ci && npm run build:pages && npm run preview:pages"
```

Routes use hashes (for example `/tutim/#/teachers`) so copied links and refreshes work on Pages. `npm run build` still creates the normal frontend for your backend; `npm run build:pages` explicitly selects the read-only demo. Both write `client/dist`, so rebuild the desired version before previewing it. Use `npm run test:pages` after the demo build to test the static site without any backend or database.

## Switch interfaces

The modern UI opens by default. Use **Legacy UI** in its header, mobile menu, or footer to return to the original design. Use **Modern UI** in the legacy header to switch back. The browser remembers your choice across reloads, and your sign-in session is shared. Equivalent profile, course, account, and directory pages stay open when switching. Unsaved form edits are not carried between interfaces.

The v2 screens live in `client/src/modern/`. Its `requests.js` adapts the existing API to the data those screens expect. There is no second backend or database to run. Login, profile/image editing, reviews, connections, course management, and the admin dashboard all use the same records. Global styles load only for the selected UI.

## Source structure

```text
client/src/
  main.jsx        Starts React
  App.jsx         Selects the modern or legacy interface
  LegacyApp.jsx   Original navigation, routes, access guards
  modern/         Imported v2 pages, components, forms and theme
  api.js          Shared authenticated requests
  runtime.js      Demo/build paths and browser location helpers
  AppRouter.jsx   Browser routes locally, hash routes on Pages
  demoData.js     Fictional data and read-only demo requests
  uiPreference.js Saved UI preference and equivalent page URLs
  pages.jsx       Website pages (including AdminPage)
  components.jsx  Shared UI, theme, widgets
  forms.jsx       Login, onboarding, editing forms
  store.js        State and backend requests
  styles.css      Global styling
server/           Backend and uploaded images
shared/           Options and editable profile fields
```

Course editors, profile introductions, connection lists, option selectors, and list-state handlers share implementations. See [MODERNIZATION.md](MODERNIZATION.md) for a mapping from the old components to their new locations.

The root `.gitignore` covers both workspaces: dependencies, builds, local environment files, TLS files, logs, caches, and test reports. Environment templates, the root `package-lock.json`, and bundled artwork remain eligible for Git.

## Start with Docker Desktop

Open PowerShell in this folder (`tutim-publish`). For a new checkout, copy `.env.example` to `.env` and replace the JWT secret with a random value. Then run:

```powershell
docker start tutim-db
docker compose up --build -d
```

Open **http://localhost:3001** for the frontend. The API is at **http://localhost:3000**, and its health check is **http://localhost:3000/health**.

The root `.env` selects the existing `tutim` database and contains the JWT secret; keep it local. `.env.example` documents the settings for another checkout. No seed or password reset runs at startup.

Login uses local usernames and passwords. The Addresses page searches saved student addresses. Unused public TLS certificates and private keys have been removed.

```powershell
docker compose logs -f api client
docker compose down
```

The existing MongoDB container is managed separately. Uploaded images stay in `server/public` through a bind mount. After editing source, rebuild with `docker compose up --build -d`.

## Develop with Node 24

```powershell
npm ci
npm run server
# In another terminal:
npm start
```

For a locally installed MongoDB, set `MONGO_URL=mongodb://127.0.0.1:27017/tutim`. The frontend proxies `/api` and image requests to the API; it no longer hardcodes the browser's backend hostname.

## Check the migration

```powershell
npm run lint
npm run build
npm test
npx playwright install --with-deps chromium --only-shell
npm run test:browser
# Also exercise the built frontend (after npm run build):
# PowerShell: $env:BROWSER_TEST_BUILD="1"; npm run test:browser
npm audit
```

Browser tests cover both interfaces, remembered UI selection, style isolation, and signed-in switching. The API and browser tests create uniquely named `tutim_v1_test_*` / `tutim_v1_browser_*` databases and remove only those databases. Set `TEST_MONGO_BASE` to the MongoDB server URL without a database name when needed. Browser tests start their own API and frontend on ports 4000 and 4001.

These checks can also run inside the client Docker container:

```powershell
docker compose exec client npm test
docker compose exec client npx playwright install --with-deps chromium --only-shell
docker compose exec client npm run test:browser
```

See [MODERNIZATION.md](MODERNIZATION.md) for the dependency changes, source map, and validation.
