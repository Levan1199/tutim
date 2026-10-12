import { lazy, Suspense, useEffect, useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  useParams,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { Provider, useDispatch, useSelector } from "react-redux";
import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles";
import { ToastContainer } from "react-toastify";
import bootstrap from "bootstrap/dist/css/bootstrap.min.css?inline";
import icons from "@fortawesome/fontawesome-free/css/all.min.css?inline";
import iconShims from "@fortawesome/fontawesome-free/css/v4-shims.min.css?inline";
import toastStyles from "react-toastify/dist/ReactToastify.css?inline";
import styles from "./styles.css?inline";
import InterfaceStyles from "./InterfaceStyles.jsx";
import { ConfigureStore, fetchProfile } from "./store.js";
import { Header, Footer, theme } from "./components.jsx";
import { apiRequest } from "./api.js";
import { routeForInterface } from "./uiPreference.js";
import AppRouter from "./AppRouter.jsx";

const page = (name) =>
  lazy(() => import("./pages.jsx").then((pages) => ({ default: pages[name] })));
import { SetupProfile, SignIn, SignUp } from "./forms.jsx";
const routes = [
  ["/home", page("HomePage")],
  ["/teacherList", page("TeacherDirectory")],
  ["/teacherList/:subjectName", page("TeacherDirectory")],
  ["/studentList", page("StudentDirectory")],
  ["/profile/teacher", page("TeacherProfile"), "teacher"],
  ["/profile/student", page("StudentProfile"), "student"],
  ["/profile/student/:profileId", page("PublicStudentProfile")],
  ["/profile/teacher/:profileId", page("PublicTeacherProfile")],
  ["/courseDetail/:courseName", page("CourseDetailPage")],
  ["/courses", page("CoursesPage")],
  ["/addresses", page("AddressPage")],
  ["/addresses/:address", page("AddressPage")],
  ["/map", page("AddressPage")],
  ["/map/:address", page("AddressPage")],
  ["/awaiting", page("StudentConnections"), "student"],
  ["/teaAwaiting", page("TeacherConnections"), "teacher"],
  ["/admin/view", page("AdminPage"), "admin"],
  ["/admin/studentList", page("AdminStudentList"), "admin"],
  ["/admin/teacherList", page("AdminTeacherList"), "admin"],
  ["/stepper", SetupProfile, "authenticated"],
];

function ParamPage({ component: Component }) {
  return <Component {...useParams()} />;
}
function ModernLink() {
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    let cancelled = false;
    (async () => {
      let user, courses;
      try {
        if (["/profile", "/connections"].includes(location.pathname))
          user = await apiRequest("profile");
        if (location.pathname.startsWith("/courses/"))
          courses = await apiRequest("course");
      } catch {
        // Fall back to an accessible list or onboarding page.
      }
      if (!cancelled)
        navigate(routeForInterface(location, "legacy", { user, courses }), {
          replace: true,
        });
    })();
    return () => {
      cancelled = true;
    };
  }, [location, navigate]);
  return (
    <div role="status" style={{ padding: 100, textAlign: "center" }}>
      Loading...
    </div>
  );
}
function Protected({ access, children }) {
  const authenticated = useSelector((state) => state.auth.isAuthenticated);
  const profile = useSelector((state) => state.profiles);
  if (!authenticated) return <Navigate to="/home" replace />;
  if (access !== "authenticated") {
    if (profile.isLoading) return null;
    const allowed =
      access === "admin"
        ? profile.profiles?.admin
        : profile.profiles?.[access + "Profile"];
    if (!allowed) return <Navigate to="/home" replace />;
  }
  return children;
}
function Navigation({ onSwitchUI }) {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);
  return (
    <>
      <ToastContainer position="top-center" autoClose={3000} />
      <Header SignInForm={SignIn} SignUpForm={SignUp} onSwitchUI={onSwitchUI} />
      <Suspense
        fallback={
          <div role="status" style={{ paddingTop: 100, textAlign: "center" }}>
            Loading...
          </div>
        }
      >
        <Routes>
          {[
            "/teachers",
            "/teachers/:id",
            "/students",
            "/students/:id",
            "/courses/:id",
            "/admin",
            "/profile",
            "/connections",
            "/signin",
            "/signup",
          ].map((path) => (
            <Route key={path} path={path} element={<ModernLink />} />
          ))}
          {routes.map(([path, component, access]) => (
            <Route
              key={path}
              path={path}
              element={
                access ? (
                  <Protected access={access}>
                    <ParamPage component={component} />
                  </Protected>
                ) : (
                  <ParamPage component={component} />
                )
              }
            />
          ))}
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </Suspense>
      <Footer />
    </>
  );
}
export default function LegacyApp({ onSwitchUI }) {
  const [store] = useState(ConfigureStore);
  return (
    <Provider store={store}>
      <AppRouter>
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={theme}>
            <InterfaceStyles
              mode="legacy"
              css={[bootstrap, icons, iconShims, toastStyles, styles].join(
                "\n",
              )}
            />
            <Navigation onSwitchUI={onSwitchUI} />
          </ThemeProvider>
        </StyledEngineProvider>
      </AppRouter>
    </Provider>
  );
}
