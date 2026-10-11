# TUTIM classic: modernized v1

This is the original v1 application with modern dependencies and its original UI. The separate v2 project remains independent.

## Source structure

```text
client/src/
  main.jsx        Starts React
  App.jsx         Navigation, routes, access guards
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

Open PowerShell in this folder (`tutor_information_management`), then run:

```powershell
docker start tutim-db
docker compose up --build -d
```

Open **http://localhost:3001** for the frontend. The API is at **http://localhost:3000**, and its health check is **http://localhost:3000/health**.

The root `.env` selects the existing `tutim` database and contains the JWT secret. `.env.example` documents the settings for another checkout. No seed or password reset runs at startup.

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

The API and browser tests create uniquely named `tutim_v1_test_*` / `tutim_v1_browser_*` databases and remove only those databases. Set `TEST_MONGO_BASE` to the MongoDB server URL without a database name when needed. Browser tests start their own API and frontend on ports 4000 and 4001.

These checks can also run inside the client Docker container:

```powershell
docker compose exec client npm test
docker compose exec client npx playwright install --with-deps chromium --only-shell
docker compose exec client npm run test:browser
```

See [MODERNIZATION.md](MODERNIZATION.md) for the dependency changes, source map, and validation.
