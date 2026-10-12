# TUTIM modernization and UI integration

## Static demo for GitHub Pages

`npm run build:pages` selects Vite's `demo` mode. Both interfaces use a shared, read-only adapter with fictional profiles and reviews. All account access and mutations are rejected locally before any network request. Hash routing supports direct links and refreshes under `/tutim/`; switching interfaces preserves equivalent routes and query filters.

The Pages workflow publishes only `client/dist`. Course artwork is copied from an explicit list of bundled illustrations. No runtime profile uploads, environment files, server code, credentials, or database exports are deployed. Normal development and `npm run build` continue to use the existing API. Static browser tests start only a file server and verify both interfaces, filters, images, deep links, and the absence of API or external requests.

## Original modernization and recovery

The first modernization retained the existing v1 pages, colors, text, route URLs, and images. Those screens remain available through the Legacy UI switch. UI widgets now use maintained components and some default spacing differs slightly from Material UI 4. The existing MongoDB collections and account password hashes are retained. V2 source was not edited.

Before editing, a source backup including the earlier local changes was created in the sibling `tutim_v1_backups` folder: `tutim-v1-before-modernization-20261010-234852.zip`, with a SHA-256 manifest. It excludes dependency folders and Git history. This is a source backup; the modernization does not migrate or seed the current database.

## Dependency changes

| Area                    | Previous v1                                 | Current v1                                       |
| ----------------------- | ------------------------------------------- | ------------------------------------------------ |
| Runtime                 | Docker Node with legacy compatibility flags | Node 24                                          |
| React                   | React 17, ReactDOM.render                   | React 19.3, createRoot                           |
| Build                   | Create React App / react-scripts 4          | Vite 8.3                                         |
| UI                      | Material UI 4, JSS                          | MUI 9.5, Emotion                                 |
| Routing                 | React Router 5                              | React Router 7.18                                |
| State                   | Redux 4, manual thunk configuration         | Redux Toolkit 2.13, React Redux 9.3              |
| Forms                   | Formik 2.2, Yup 0.32                        | Formik 2.4, Yup 1.7                              |
| API                     | Express 4                                   | Express 5.3                                      |
| Database client         | Mongoose 5                                  | Mongoose 9.11                                    |
| Authentication          | Older Passport/JWT/plugin                   | Passport 0.7, JWT 9, passport-local-mongoose 9.2 |
| Uploads                 | Multer 1                                    | Multer 2.4, byte/type/size checks                |
| Dependency installation | Separate inconsistent trees                 | npm workspaces, one pinned lockfile, npm ci      |

Unused date libraries, Redux form state, image/base64 packages, session stores, Jade, and unsupported React widgets were removed from the dependency manifests. No SKIP_PREFLIGHT_CHECK or OpenSSL legacy flag is needed.

ESLint 10 restores static checks after removing CRA. `npm run check` runs lint, the production build, and the API/request tests.

The migration follows the official [Express 5 guide](https://expressjs.com/en/guide/migrating-5/), [Mongoose 9 guide](https://mongoosejs.com/docs/migrating_to_9.html), and [MUI Grid guide](https://mui.com/material-ui/migration/upgrade-to-grid-v2/).

## Compact structure (October 11, 2026)

The original application now uses `client / server / shared`. No additional source backup was created for this restructuring, as requested. V2 source and the existing database were not refactored or seeded.

```text
client/
  src/
    main.jsx          React startup and global CSS imports
    App.jsx           Providers, routes, access guards, navigation
    pages.jsx         Public, profile, course, connection, and admin pages
    components.jsx    Header/footer, reusable widgets, theme, style helper
    forms.jsx         Authentication, onboarding, profile and course editors
    store.js          Redux state, actions, API requests, asset URLs
    styles.css        Original global styles
server/
  app.js              Express middleware and route mounting
  bin/www             Database connection and server startup
  models/             Existing MongoDB schemas and password compatibility
  routes/             API endpoints and shared handler helpers
shared/
  options.json        Subjects, grades, districts, editable profile fields
```

The frontend source now contains exactly seven files rather than the prior 62 source/style files. Code remains ordinary editable React source. Original colors, page content, URLs, role permissions, assets, database collections, and password hashing are retained. Keeping the original UI means `pages.jsx` still contains more markup than the redesigned v2; compact organization does not mean replacing the existing screens.

### Find the former components

| Former source                                             | Current location                                                                                |
| --------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `components/MainComponent.jsx` and `App.jsx`              | `App.jsx`: route table, `Protected`, `Navigation`                                               |
| `components/admin/AdminView.jsx`                          | `pages.jsx`: `AdminPage`                                                                        |
| Student/teacher admin lists                               | `pages.jsx`: `AdminAccountList`, role-specific wrappers                                         |
| `HomeComponent`, `Courses`, address search, course detail | `pages.jsx`: `HomePage`, `CoursesPage`, `AddressPage`, `CourseDetailPage`                       |
| Teacher/student directories                               | `pages.jsx`: `TeacherDirectory`, `StudentDirectory`                                             |
| Own and public profile screens                            | `pages.jsx`: `TeacherProfile`, `StudentProfile`, `PublicTeacherProfile`, `PublicStudentProfile` |
| Registered teacher/student lists                          | `pages.jsx`: shared `ConnectionsPage` with role wrappers                                        |
| Introduction dialogs                                      | `forms.jsx`: shared `ProfileIntroEditor` with role-specific validation                          |
| Course create/edit dialogs                                | `forms.jsx`: shared `CourseEditor`                                                              |
| Requirement dialogs                                       | `forms.jsx`: `StudentDetailEditor`, `TeacherDetailEditor`, shared selectors                     |
| Sign-in/sign-up/onboarding/comment dialog                 | `forms.jsx`: `SignIn`, `SignUp`, `SetupProfile`, `ReviewForm`                                   |
| Small `src/shared` widget files                           | `components.jsx`: uploader, selector, infinite scroll, rating                                   |
| Redux action/reducer files and API helper                 | `store.js`: shared `listReducer`, authentication/profile state, backend actions                 |

Repeated list loading/error handling, course forms, introduction forms, connection lists, selectors, and identical styles were consolidated. The shared profile field list is used by both frontend options/state and backend field whitelisting. Profile requirement selectors now persist additions and clearing correctly. The header receives its authentication forms from `App.jsx`, avoiding circular imports between forms and components.

Docker, the npm workspace lockfile, environment-file lookup, image mounts, tests, lint configuration, and browser entry point all use the new paths. Build chunks separate React, UI libraries, and other vendors using the [Rolldown code-splitting configuration](https://rolldown.rs/reference/OutputOptions.codeSplitting). Pages load together as one deferred module; forms and the shell load at startup.

## Behavior corrected

Profile pages work for visitors without assuming a logged-in student/teacher. Role guards protect private profile and admin routes. Connections validate ownership and return a response. Admin toggles await the save. Rating increments use an atomic database update. Profile/course forms wait for successful writes before closing or navigating. Requests report HTTP failures rather than trying to display an error response as a list. Browser storage retains the username and token, without retaining the old plaintext password.

Uploaded images use randomized filenames and validate size, MIME type, and PNG/JPEG/GIF signature. Replacing an image retains the old asset so this refactor cannot remove a shared existing image; unused-image cleanup can be added separately.

## Authentication and TLS cleanup

Local username/password login uses Passport and JWT authentication. Existing database records were not migrated or deleted.

Unused TLS certificates and private keys were removed from the frontend's public assets and the backend's `bin` directory. The HTTP development servers did not load them. Ignore rules prevent these filenames from entering future Git changes or Docker builds. This cleanup does not erase earlier Git history or existing source backups.

## Validation

Validation uses isolated test databases and temporary upload directories. API tests cover original password hash compatibility, login/signup, profiles, uploads, ownership, connections, comments, courses, admin disabling, errors, and CORS. Browser tests exercise public routes, both admin lists, course creation/editing/deletion, student profile edits, registrations, comments, teacher routes, signup/onboarding, and mobile width.

The dependency audit reported **zero known vulnerabilities** for the installed full dependency tree on October 11, 2026. This describes the audit result at that time; it is not a guarantee about future advisories. Build, test, browser, and integrity results are recorded during the migration.

The earlier dependency modernization validated original collection checksums against its pre-migration snapshot and initialized an empty `waitinglists` collection. Subsequent validation uses isolated databases and does not write to original account or application records. Checks include lint, production build, 12 API/request/state tests, development and production browser workflows, profile-selector clearing, address search, and npm audit (zero findings).

## Integrated v2 interface

`client/src/modern/` contains the existing v2 interface, adapted to this repository's backend. `App.jsx` selects it by default and lazy-loads `LegacyApp.jsx` when requested. The UI switch is available on desktop and mobile, remembers the selection in browser storage, and maps equivalent page URLs without logging out. Each interface mounts its own state and global styles; both share the request helpers in `api.js` and the same JWT session.

The imported UI uses React Hook Form and Zod for forms, Redux Toolkit Query for cached requests, and the original v2 Material UI theme and responsive layouts. `modern/requests.js` translates requests to the existing routes and schema rather than introducing another database or server. Image files are saved with the existing multipart endpoints and 1 MB upload limit. The address page continues to search saved addresses locally.

The modern admin dashboard uses new authenticated account endpoints to set disabled state explicitly and delete an individual non-admin account with its profile, reviews, and connections. Admin accounts remain protected. Connection lists support admin viewing and removal of individual entries; existing student/teacher ownership checks remain in place. Deleted student reviews cause affected teacher ratings to be recalculated.

The source projects in sibling folders remain unchanged. No seed, password change, or data migration is needed for the integration.

Integration checks passed: lint, production build, 16 API/state/interface tests, browser workflows for both development and built frontends, and a full dependency audit with zero reported vulnerabilities. Browser coverage includes saved UI preference, style isolation, session continuity, admin actions, profile uploads, reviews, connections, onboarding, and mobile navigation. Tests use a disposable MongoDB container and isolated databases.
