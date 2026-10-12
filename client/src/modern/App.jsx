import { useEffect, useState } from "react";
import {
  Link as RouterLink,
  NavLink,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  AppBar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Drawer,
  IconButton,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import SchoolRounded from "@mui/icons-material/SchoolRounded";
import MenuRounded from "@mui/icons-material/MenuRounded";
import CloseRounded from "@mui/icons-material/CloseRounded";
import {
  api,
  useGetCoursesQuery,
  useLogoutMutation,
  useSession,
} from "./store";
import { AuthPage } from "./forms";
import { isDemo } from "../runtime.js";
import {
  AdminPage,
  ConnectionsPage,
  CourseDetailPage,
  CoursesPage,
  HomePage,
  AddressPage,
  MyProfilePage,
  ProfileDetailPage,
  ProfileListPage,
} from "./pages";
function LegacyLink({ kind }) {
  const params = useParams();
  const courses = useGetCoursesQuery(undefined, { skip: kind !== "course" });
  if (kind === "course" && courses.isLoading) return <CircularProgress />;
  const to =
    kind === "course"
      ? courses.data?.find((c) => c.name === params.courseName)?._id
        ? "/courses/" +
          courses.data.find((c) => c.name === params.courseName)._id
        : "/courses"
      : kind === "subject"
        ? "/teachers?subject=" + encodeURIComponent(params.subjectName)
        : "/" + kind + "/" + params.profileId;
  return <Navigate to={to} replace />;
}
function Guard({ admin = false, children }) {
  const { user, loading } = useSession();
  if (loading && !user)
    return (
      <Box sx={{ display: "grid", placeItems: "center", py: 10 }}>
        <CircularProgress />
      </Box>
    );
  if (!user) return <Navigate to="/signin" replace />;
  if (admin && user.role !== "admin") return <Navigate to="/" replace />;
  return children;
}
export default function App({ onSwitchUI }) {
  const { user } = useSession();
  const [logout] = useLogoutMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  const mainLinks = [
    ["/", "Home"],
    ["/teachers", "Teachers"],
    ["/students", "Students"],
    ["/courses", "Courses"],
    ["/addresses", "Addresses"],
  ];
  const accountLinks = user
    ? [
        ["/profile", "My profile"],
        ["/connections", "Connections"],
        ...(user.role === "admin" ? [["/admin", "Admin"]] : []),
      ]
    : [];
  const signOut = async () => {
    await logout().unwrap();
    dispatch(api.util.resetApiState());
    setMenuOpen(false);
    navigate("/");
  };
  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <a
        className="skip-link"
        href="#main-content"
        onClick={(event) => {
          if (isDemo) {
            event.preventDefault();
            const main = document.getElementById("main-content");
            main?.scrollIntoView();
            main?.focus();
          }
        }}
      >
        Skip to content
      </a>
      <AppBar
        position="sticky"
        color="inherit"
        elevation={0}
        sx={{
          borderBottom: "1px solid",
          borderColor: "divider",
          background: "#faf9f5f2",
          backdropFilter: "blur(16px)",
        }}
      >
        <Container maxWidth="lg">
          <Toolbar
            disableGutters
            sx={{ gap: 2, minHeight: { xs: 72, md: 84 } }}
          >
            <Button
              component={RouterLink}
              to="/"
              aria-label="Tutim home"
              sx={{
                fontSize: 26,
                letterSpacing: "-.05em",
                color: "text.primary",
                pl: 0,
                gap: 1.2,
                mr: "auto",
              }}
            >
              <span className="brand-mark">
                <SchoolRounded />
              </span>
              tutim<span style={{ color: "#bd5b40" }}>.</span>
            </Button>
            <Stack
              component="nav"
              aria-label="Main navigation"
              className="site-nav"
              direction="row"
              sx={{ display: { xs: "none", md: "flex" }, gap: 0.5, mr: "auto" }}
            >
              {mainLinks.map(([to, label]) => (
                <Button
                  key={to}
                  component={NavLink}
                  end={to === "/"}
                  to={to}
                  sx={{ color: "text.secondary", px: 1.5 }}
                >
                  {label}
                </Button>
              ))}
            </Stack>
            {user ? (
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <Chip
                  label={user.username}
                  size="small"
                  sx={{ maxWidth: { xs: 135, sm: 200 }, background: "#e8efe6" }}
                />
                <Button
                  onClick={signOut}
                  sx={{ display: { xs: "none", md: "inline-flex" } }}
                >
                  Sign out
                </Button>
              </Stack>
            ) : (
              <Button
                component={RouterLink}
                to="/signin"
                variant="contained"
                disabled={isDemo}
              >
                Sign in
              </Button>
            )}
            <Button
              onClick={onSwitchUI}
              variant="outlined"
              sx={{ display: { xs: "none", md: "inline-flex" } }}
            >
              Legacy UI
            </Button>
            <IconButton
              aria-label="Open navigation"
              onClick={() => setMenuOpen(true)}
              sx={{ display: { md: "none" }, width: 44, height: 44 }}
            >
              <MenuRounded />
            </IconButton>
          </Toolbar>
          {user && (
            <Stack
              className="site-nav"
              direction="row"
              sx={{
                display: { xs: "none", md: "flex" },
                justifyContent: "flex-end",
                gap: 1,
                pb: 1,
              }}
            >
              {accountLinks.map(([to, label]) => (
                <Button key={to} component={NavLink} to={to} size="small">
                  {label}
                </Button>
              ))}
            </Stack>
          )}
        </Container>
      </AppBar>
      <Drawer anchor="right" open={menuOpen} onClose={() => setMenuOpen(false)}>
        <Box sx={{ width: "min(320px, 88vw)", p: 3 }}>
          <Stack
            direction="row"
            sx={{
              alignItems: "center",
              justifyContent: "space-between",
              mb: 3,
            }}
          >
            <Typography variant="h5">Explore Tutim</Typography>
            <IconButton
              aria-label="Close navigation"
              onClick={() => setMenuOpen(false)}
            >
              <CloseRounded />
            </IconButton>
          </Stack>
          <Stack
            component="nav"
            aria-label="Mobile navigation"
            className="site-nav"
            spacing={1}
          >
            {[...mainLinks, ...accountLinks].map(([to, label]) => (
              <Button
                key={to}
                component={NavLink}
                end={to === "/"}
                to={to}
                onClick={() => setMenuOpen(false)}
                sx={{ justifyContent: "flex-start" }}
              >
                {label}
              </Button>
            ))}
            {user && (
              <Button onClick={signOut} sx={{ justifyContent: "flex-start" }}>
                Sign out
              </Button>
            )}
            <Button
              onClick={onSwitchUI}
              sx={{ justifyContent: "flex-start", mt: 2 }}
            >
              Legacy UI
            </Button>
          </Stack>
        </Box>
      </Drawer>
      <Box
        component="main"
        id="main-content"
        tabIndex={-1}
        sx={{ flex: 1, outline: "none" }}
      >
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route
            path="/teachers"
            element={<ProfileListPage kind="teacher" />}
          />
          <Route
            path="/teacherList/:subjectName"
            element={<LegacyLink kind="subject" />}
          />
          <Route
            path="/profile/teacher/:profileId"
            element={<LegacyLink kind="teachers" />}
          />
          <Route
            path="/profile/student/:profileId"
            element={<LegacyLink kind="students" />}
          />
          <Route
            path="/courseDetail/:courseName"
            element={<LegacyLink kind="course" />}
          />
          {["/profile/teacher", "/profile/student", "/stepper"].map((path) => (
            <Route
              key={path}
              path={path}
              element={<Navigate to="/profile" replace />}
            />
          ))}
          {["/awaiting", "/teaAwaiting"].map((path) => (
            <Route
              key={path}
              path={path}
              element={<Navigate to="/connections" replace />}
            />
          ))}
          {["/admin/studentList", "/admin/teacherList"].map((path) => (
            <Route
              key={path}
              path={path}
              element={<Navigate to="/admin" replace />}
            />
          ))}
          <Route
            path="/teacherList"
            element={<Navigate to="/teachers" replace />}
          />
          <Route
            path="/teachers/:id"
            element={<ProfileDetailPage kind="teacher" />}
          />
          <Route
            path="/students"
            element={<ProfileListPage kind="student" />}
          />
          <Route
            path="/studentList"
            element={<Navigate to="/students" replace />}
          />
          <Route
            path="/students/:id"
            element={<ProfileDetailPage kind="student" />}
          />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/:id" element={<CourseDetailPage />} />
          <Route path="/addresses" element={<AddressPage />} />
          <Route path="/addresses/:address" element={<AddressPage />} />
          <Route path="/map" element={<AddressPage />} />
          <Route path="/map/:address" element={<AddressPage />} />
          <Route path="/signin" element={<AuthPage />} />
          <Route path="/signup" element={<AuthPage signup />} />
          <Route
            path="/profile"
            element={
              <Guard>
                <MyProfilePage />
              </Guard>
            }
          />
          <Route
            path="/connections"
            element={
              <Guard>
                <ConnectionsPage />
              </Guard>
            }
          />
          <Route
            path="/admin"
            element={
              <Guard admin>
                <AdminPage />
              </Guard>
            }
          />
          <Route
            path="/admin/view"
            element={<Navigate to="/admin" replace />}
          />
          <Route
            path="*"
            element={
              <Container sx={{ py: 8 }}>
                <Typography variant="h4">Page not found</Typography>
                <Button component={RouterLink} to="/">
                  Go home
                </Button>
              </Container>
            }
          />
        </Routes>
      </Box>
      <Box component="footer" className="site-footer">
        <Container>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{
              justifyContent: "space-between",
              alignItems: { sm: "center" },
            }}
          >
            <Box>
              <Typography variant="h5" sx={{ mb: 0.5 }}>
                Small steps. Brighter futures.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tutim connects curious learners with inspiring teachers.
              </Typography>
            </Box>
            <Button
              onClick={onSwitchUI}
              variant="outlined"
              sx={{ alignSelf: { xs: "flex-start", sm: "center" } }}
            >
              Legacy UI
            </Button>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
