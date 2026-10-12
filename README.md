# TUTIM

A tutor and student matching app with teacher search, course browsing, profiles, reviews, connections, and an admin dashboard. Use the **Modern UI / Legacy UI** button to switch designs; the browser remembers your choice.

[Live demo](https://levan1199.github.io/tutim/) — fictional data, browsing only, with sign-in and changes disabled. The demo runs without a backend or database.

## Tech stack

React, Vite, Material UI, Redux Toolkit, Node.js, Express, and MongoDB with Mongoose.

## Structure and components

```text
client/
  src/
    main.jsx          React entry point
    App.jsx           Interface selection
    AppRouter.jsx     Browser and demo routing
    LegacyApp.jsx     Legacy navigation and routes
    pages.jsx         Directory, course, profile, and admin pages
    components.jsx    Shared UI components and widgets
    forms.jsx         Sign-in, registration, and editing forms
    store.js          State and backend requests
    styles.css        Styling
    modern/           Modern pages, components, forms, state, and theme
    api.js            Shared API request helper
    runtime.js        Build paths and browser location helpers
    demoData.js       Fictional demo records
    uiPreference.js   Saved interface choice and route mapping
server/
  app.js              Express app and API routes
  bin/www             Database connection and server startup
  routes/             API endpoints
  models/             MongoDB schemas
  public/             Artwork and uploaded images
shared/
  options.json        Shared options and profile fields
tests/                API, frontend, and browser checks
```

Both interfaces use the same backend and accounts. Reusable UI lives in `components.jsx`, editing flows in `forms.jsx`, and page layouts in `pages.jsx`, including the corresponding files under `modern/`.

## Configuration

Run commands from the project root. Copy the environment template once, then replace `JWT_SECRET` in `.env` with a long random secret:

```powershell
Copy-Item .env.example .env
```

Use the MongoDB URL for your setup:

| Setup | `MONGO_URL` in `.env` |
| --- | --- |
| App running in Docker Desktop | `mongodb://host.docker.internal:27017/tutim` |
| App running locally with Node.js | `mongodb://127.0.0.1:27017/tutim` |

Keep `.env` local; it is ignored by Git. Startup does not create sample records or reset passwords.

## Run with Docker Desktop

Start Docker Desktop. If you already have a MongoDB container named `tutim-db`, run `docker start tutim-db`. Otherwise, create one:

```powershell
docker run -d --name tutim-db -p 127.0.0.1:27017:27017 --mount type=volume,source=tutim-db-data,target=/data/db mongo:8
```

With `.env` configured for Docker, start the app:

```powershell
docker compose up --build -d
```

- Frontend: **http://localhost:3001**
- Backend: **http://localhost:3000**
- Health check: **http://localhost:3000/health**

```powershell
docker compose logs -f api client
docker compose down
```

MongoDB runs separately from Compose and stores its data in a named volume. Uploaded images stay in `server/public`. Rebuild after source changes with `docker compose up --build -d`.

## Run with Node.js

Requires **Node.js 24** and a running MongoDB instance. Configure `.env` for local Node.js, then run:

```powershell
npm ci
npm run server
```

In a second terminal at the project root:

```powershell
npm start
```

Open **http://localhost:3001**. The frontend forwards API requests to the backend on port 3000.

## Preview the frontend demo

With Node.js 24, no MongoDB or `.env` is needed:

```powershell
npm ci
npm run build:pages
npm run preview:pages
```

Open **http://localhost:3001/tutim/**. `npm run build` builds the backend-connected frontend; `npm run build:pages` builds the read-only demo.

## Checks

```powershell
npm run lint
npm run build
npm test
```

API tests require MongoDB and use isolated test databases.
