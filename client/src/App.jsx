import { lazy, Suspense, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useParams,
} from "react-router-dom";
import { Provider, useDispatch, useSelector } from "react-redux";
import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ConfigureStore, fetchProfile } from "./store.js";
import { Header, Footer, theme } from "./components.jsx";

const store = ConfigureStore();
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
function Navigation() {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);
  return (
    <>
      <ToastContainer position="top-center" autoClose={3000} />
      <Header SignInForm={SignIn} SignUpForm={SignUp} />
      <Suspense
        fallback={
          <div role="status" style={{ paddingTop: 100, textAlign: "center" }}>
            Loading...
          </div>
        }
      >
        <Routes>
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
export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={theme}>
            <Navigation />
          </ThemeProvider>
        </StyledEngineProvider>
      </BrowserRouter>
    </Provider>
  );
}
