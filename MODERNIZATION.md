# TUTIM modernization

## Compact structure

```text
client/src/
  main.jsx          React startup
  App.jsx           Interface selection
  LegacyApp.jsx     Legacy navigation, routes, and access guards
  AppRouter.jsx     Browser routing and demo hash routing
  pages.jsx         Directory, profile, course, connection, and admin pages
  components.jsx    Shared UI components, widgets, and theme
  forms.jsx         Authentication, onboarding, and editing forms
  store.js          Redux state and backend actions
  styles.css        Legacy styling
  modern/
    ModernApp.jsx   Providers and interface setup
    App.jsx         Navigation and routes
    pages.jsx       Website pages
    components.jsx  Shared UI components
    forms.jsx       Authentication and editing forms
    store.js        State and cached API requests
    requests.js     Adapter for the shared backend API
    theme.js        Material UI theme
    styles.css      Modern styling
    utils.js        Image and error helpers
  api.js            Shared authenticated API requests
  runtime.js        Build paths and browser location helpers
  demoData.js       Fictional demo records and read-only requests
  uiPreference.js   Saved interface choice and equivalent routes
  InterfaceStyles.jsx  Styles for the selected interface
server/
  app.js            Express middleware and route mounting
  bin/www           Database connection and server startup
  models/           MongoDB schemas
  routes/           API endpoints and shared handler helpers
  public/           Artwork and uploaded images
shared/
  options.json      Subjects, grades, districts, and editable profile fields
```

Pages, widgets, forms, and state are grouped by responsibility. Repeated course editors, profile introductions, connection lists, selectors, and list handlers share implementations. Both interfaces use the same backend and accounts.

## Dependency changes

Versions below reflect the repository's dependency manifests.

| Area | Previous | Current |
| --- | --- | --- |
| Runtime | Node with legacy compatibility flags | Node 24 |
| React | React 17, `ReactDOM.render` | React 19.3, `createRoot` |
| Build | Create React App / react-scripts 4 | Vite 8.3 |
| UI | Material UI 4, JSS | MUI 9.5, Emotion |
| Routing | React Router 5 | React Router 7.18 |
| State | Redux 4, manual thunk configuration | Redux Toolkit 2.13, React Redux 9.3; RTK Query for modern screens |
| Forms | Formik 2.2, Yup 0.32 | Formik 2.4 / Yup 1.7 for legacy screens; React Hook Form 7.89 / Zod 4.6 for modern screens |
| API | Express 4 | Express 5.3 |
| Database client | Mongoose 5 | Mongoose 9.11 |
| Authentication | Older Passport/JWT packages | Passport 0.7, jsonwebtoken 9.0, passport-local-mongoose 9.2 |
| Uploads | Multer 1 | Multer 2.4 |
| Static checks | Create React App tooling | ESLint 10 |
| Installation | Separate dependency trees | npm workspaces, one pinned lockfile, `npm ci` |

Unused date libraries, Redux form state, image/base64 packages, session stores, Jade, and unsupported React widgets were removed. Neither `SKIP_PREFLIGHT_CHECK` nor the OpenSSL legacy flag is needed.

## Find the former components

Paths below are relative to `client/src/` and map the former components to their consolidated implementations.

| Former source | Current location |
| --- | --- |
| `MainComponent` and original `App` | `LegacyApp.jsx`: route table, `Protected`, `Navigation`; `App.jsx`: interface selection |
| `admin/AdminView` | `pages.jsx`: `AdminPage` |
| Student/teacher admin lists | `pages.jsx`: `AdminAccountList`, `AdminStudentList`, `AdminTeacherList` |
| `HomeComponent`, `Courses`, address search, course detail | `pages.jsx`: `HomePage`, `CoursesPage`, `AddressPage`, `CourseDetailPage` |
| Teacher/student directories | `pages.jsx`: `TeacherDirectory`, `StudentDirectory` |
| Own and public profile screens | `pages.jsx`: `TeacherProfile`, `StudentProfile`, `PublicTeacherProfile`, `PublicStudentProfile` |
| Registered teacher/student lists | `pages.jsx`: `ConnectionsPage`, `StudentConnections`, `TeacherConnections` |
| Introduction dialogs | `forms.jsx`: shared `ProfileIntroEditor` with role-specific wrappers |
| Course create/edit dialogs | `forms.jsx`: shared `CourseEditor` |
| Requirement dialogs | `forms.jsx`: `StudentDetailEditor`, `TeacherDetailEditor`, shared selectors |
| Sign-in/sign-up/onboarding/comment dialog | `forms.jsx`: `SignIn`, `SignUp`, `SetupProfile`, `ReviewForm` |
| Header, footer, and small shared widgets | `components.jsx`: `Header`, `Footer`, uploader, selectors, infinite scroll, rating |
| Redux action/reducer files and API helper | `store.js`: list handlers, authentication/profile state, backend actions; `api.js`: shared request helper |

The modern equivalents live in `modern/pages.jsx`, `modern/components.jsx`, and `modern/forms.jsx`. For example, the modern admin dashboard is `modern/pages.jsx` → `AdminPage`.
