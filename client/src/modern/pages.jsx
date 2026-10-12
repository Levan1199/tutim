import { useState } from "react";
import ArrowForwardRounded from "@mui/icons-material/ArrowForwardRounded";
import AutoStoriesRounded from "@mui/icons-material/AutoStoriesRounded";
import CheckCircleOutlineRounded from "@mui/icons-material/CheckCircleOutlineRounded";
import {
  Link as RouterLink,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Link,
  MenuItem,
  Rating,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import {
  useDeleteCourseMutation,
  useDeleteUserMutation,
  useDisconnectMutation,
  useGetConnectionsQuery,
  useGetCourseQuery,
  useGetCoursesQuery,
  useGetReviewsQuery,
  useGetStudentQuery,
  useGetStudentsQuery,
  useGetTeacherQuery,
  useGetTeachersQuery,
  useGetUsersQuery,
  useSession,
  useSetDisabledMutation,
} from "./store";
import {
  averageRating,
  avatar,
  courseImage,
  errorMessage,
  matchesFilters,
} from "./utils";
import {
  ConnectionButton,
  CourseCard,
  Filters,
  PageTitle,
  ProfileCard,
  QueryState,
} from "./components";
import { CourseEditor, ProfileForm, ReviewForm } from "./forms";
export function HomePage() {
  const teachers = useGetTeachersQuery();
  const courses = useGetCoursesQuery();
  const top = [...(teachers.data || [])]
    .sort((a, b) => averageRating(b) - averageRating(a))
    .slice(0, 3);
  return (
    <>
      <Container className="home-hero" maxWidth="lg">
        <Box className="home-hero-grid">
          <Box>
            <Typography className="eyebrow" sx={{ mb: 2 }}>
              A little guidance goes a long way
            </Typography>
            <Typography
              component="h1"
              variant="h1"
              sx={{ fontSize: { xs: 48, sm: 64, md: 76 }, maxWidth: 580 }}
            >
              Find your people.
              <br />
              <Box component="span" sx={{ color: "primary.main" }}>
                Grow your potential.
              </Box>
            </Typography>
            <Typography
              color="text.secondary"
              sx={{ mt: 3, mb: 4, maxWidth: 450, fontSize: 18 }}
            >
              From a tricky school subject to a brand-new passion. Find a
              teacher who makes learning feel like you.
            </Typography>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              sx={{ alignItems: { xs: "stretch", sm: "center" } }}
            >
              <Button
                component={RouterLink}
                to="/teachers"
                variant="contained"
                size="large"
                endIcon={<ArrowForwardRounded />}
              >
                Find a teacher
              </Button>
              <Button
                component={RouterLink}
                to="/courses"
                variant="outlined"
                size="large"
              >
                Explore courses
              </Button>
            </Stack>
            <Stack
              direction="row"
              spacing={1}
              sx={{ mt: 3, alignItems: "center", color: "text.secondary" }}
            >
              <CheckCircleOutlineRounded
                sx={{ fontSize: 18, color: "primary.main" }}
              />
              <Typography variant="body2">
                Your goals. Your pace. Your kind of teacher.
              </Typography>
            </Stack>
          </Box>
          <Box className="hero-art" aria-hidden="true">
            <div className="hero-orbit" />
            <Box className="hero-learning-card">
              <Box className="lesson-board">
                <Typography
                  sx={{ opacity: 0.75, fontSize: 12, letterSpacing: ".1em" }}
                >
                  TODAY'S LITTLE BREAKTHROUGH
                </Typography>
                <div className="lesson-equation">
                  a&#178; + b&#178; = c&#178;
                </div>
                <Typography variant="body2" sx={{ opacity: 0.85 }}>
                  It all starts to make sense.
                </Typography>
              </Box>
              <Stack
                direction="row"
                spacing={1.5}
                sx={{ alignItems: "center" }}
              >
                <Box className="brand-mark">
                  <AutoStoriesRounded />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 700 }}>
                    Learning, made personal
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    One connection at a time
                  </Typography>
                </Box>
              </Stack>
            </Box>
            <Box className="hero-note">
              <Typography
                sx={{
                  fontFamily: "Georgia, serif",
                  fontSize: 23,
                  fontStyle: "italic",
                }}
              >
                You've got this.
              </Typography>
              <Typography variant="caption">A fresh start awaits</Typography>
            </Box>
            <Box className="hero-float">
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <CheckCircleOutlineRounded color="primary" />
                <Box>
                  <Typography sx={{ fontWeight: 700 }}>
                    Find your learning match
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Subjects, grades &amp; neighborhoods
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Box>
        </Box>
      </Container>
      <Container maxWidth="lg" sx={{ pb: 3 }}>
        <Box
          sx={{
            borderTop: "1px solid",
            borderBottom: "1px solid",
            borderColor: "divider",
            py: 3,
            mb: 7,
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(3,1fr)" },
            gap: 2,
          }}
        >
          {[
            [
              "Learn something you love",
              "School subjects, music, sport, and more.",
            ],
            [
              "Find someone who gets you",
              "Explore teaching styles and student reviews.",
            ],
            [
              "Make a real connection",
              "Meet teachers and learners in your area.",
            ],
          ].map(([title, text]) => (
            <Box key={title}>
              <Typography sx={{ fontWeight: 700, mb: 0.5 }}>{title}</Typography>
              <Typography variant="body2" color="text.secondary">
                {text}
              </Typography>
            </Box>
          ))}
        </Box>
        <Box className="section-label">
          <Box>
            <Typography className="eyebrow" sx={{ mb: 1 }}>
              Follow your curiosity
            </Typography>
            <Typography variant="h4">What would you like to learn?</Typography>
          </Box>
          <Button
            component={RouterLink}
            to="/courses"
            endIcon={<ArrowForwardRounded />}
            sx={{ flexShrink: 0 }}
          >
            All courses
          </Button>
        </Box>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(2,minmax(0,1fr))",
              md: "repeat(4,minmax(0,1fr))",
            },
            gap: 1.5,
            mb: 3,
          }}
        >
          {["Maths", "English", "Physics", "Piano"].map((subject) => (
            <RouterLink
              className="subject-link"
              key={subject}
              to={"/teachers?subject=" + encodeURIComponent(subject)}
            >
              {subject}
              <ArrowForwardRounded
                sx={{ fontSize: 18, color: "primary.main" }}
              />
            </RouterLink>
          ))}
        </Box>
        <QueryState query={courses} empty={courses.data?.length === 0}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2,minmax(0,1fr))",
                lg: "repeat(4,minmax(0,1fr))",
              },
              gap: 3,
            }}
          >
            {courses.data?.slice(0, 4).map((course) => (
              <CourseCard key={course._id} course={course} />
            ))}
          </Box>
        </QueryState>
        <Box className="section-label" sx={{ mt: 8 }}>
          <Box>
            <Typography className="eyebrow" sx={{ mb: 1 }}>
              People who make a difference
            </Typography>
            <Typography variant="h4">Meet your next teacher</Typography>
          </Box>
          <Button
            component={RouterLink}
            to="/teachers"
            endIcon={<ArrowForwardRounded />}
            sx={{ flexShrink: 0 }}
          >
            View all
          </Button>
        </Box>
        <QueryState query={teachers} empty={top.length === 0}>
          <Box className="page-grid">
            {top.map((profile) => (
              <ProfileCard key={profile._id} profile={profile} />
            ))}
          </Box>
        </QueryState>
        <Box className="how-it-works" sx={{ mt: 8 }}>
          <Typography className="eyebrow" sx={{ mb: 1 }}>
            Simple from the start
          </Typography>
          <Typography variant="h4" sx={{ mb: 4 }}>
            Your next chapter, in three steps.
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(3,minmax(0,1fr))" },
              gap: 4,
            }}
          >
            {[
              [
                "01",
                "Explore your options",
                "Browse subjects and find teachers who fit your goals.",
              ],
              [
                "02",
                "Find your match",
                "Compare profiles, availability, and student reviews.",
              ],
              [
                "03",
                "Start a conversation",
                "Create your profile and connect with your chosen teacher.",
              ],
            ].map(([number, title, text]) => (
              <Box key={number}>
                <Typography
                  sx={{
                    fontSize: 14,
                    color: "primary.main",
                    fontWeight: 750,
                    mb: 1.5,
                  }}
                >
                  {number} /
                </Typography>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  {title}
                </Typography>
                <Typography color="text.secondary">{text}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Container>
    </>
  );
}
export function ProfileListPage({ kind }) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("recommended");
  const [params] = useSearchParams();
  const initialSubject = params.get("subject") || "";
  const [filters, setFilters] = useState({
    district: [],
    grade: [],
    subject: initialSubject ? [initialSubject] : [],
  });
  const teachers = useGetTeachersQuery(undefined, { skip: kind !== "teacher" });
  const students = useGetStudentsQuery(undefined, { skip: kind !== "student" });
  const query = kind === "teacher" ? teachers : students;
  const items = (query.data || [])
    .filter(
      (p) =>
        matchesFilters(p, filters) &&
        [p.name, ...(p.subject || [])]
          .join(" ")
          .toLowerCase()
          .includes(search.trim().toLowerCase()),
    )
    .sort((a, b) =>
      sort === "fee"
        ? a.fee - b.fee
        : sort === "name"
          ? a.name.localeCompare(b.name)
          : Number(b.available) - Number(a.available) ||
            averageRating(b) - averageRating(a),
    );
  return (
    <>
      <PageTitle
        title={
          kind === "teacher" ? "Current teachers" : "Students looking to learn"
        }
        subtitle={
          kind === "teacher"
            ? "Find available teachers by district, grade, and subject."
            : "Meet learners looking for guidance in your subject."
        }
      />
      <Container maxWidth="lg" sx={{ pb: 6 }}>
        <Filters
          key={initialSubject}
          initialSubject={initialSubject}
          onApply={setFilters}
        />
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ mb: 3, alignItems: { sm: "center" } }}
        >
          <TextField
            size="small"
            label="Search by name or subject"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flex: 1, maxWidth: { sm: 360 } }}
          />
          <Typography
            color="text.secondary"
            variant="body2"
            aria-live="polite"
            sx={{ flex: 1 }}
          >
            {query.isLoading
              ? "Finding your matches..."
              : `${items.length} ${kind === "teacher" ? "teachers" : "students"} match your search`}
          </Typography>
          <TextField
            select
            size="small"
            label="Sort by"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            sx={{ minWidth: 190 }}
          >
            <MenuItem value="recommended">Recommended</MenuItem>
            <MenuItem value="fee">Fee: low to high</MenuItem>
            <MenuItem value="name">Name: A to Z</MenuItem>
          </TextField>
        </Stack>
        <QueryState query={query} empty={items.length === 0}>
          <Box className="page-grid">
            {items.map((profile) => (
              <ProfileCard key={profile._id} profile={profile} kind={kind} />
            ))}
          </Box>
        </QueryState>
      </Container>
    </>
  );
}
export function ProfileDetailPage({ kind }) {
  const { id } = useParams();
  const { user } = useSession();
  const teachers = useGetTeacherQuery(id, { skip: kind !== "teacher" });
  const students = useGetStudentQuery(id, { skip: kind !== "student" });
  const query = kind === "teacher" ? teachers : students;
  const reviews = useGetReviewsQuery(id, { skip: kind !== "teacher" });
  const profile = query.data;
  return (
    <>
      <PageTitle
        title={profile?.name || "Profile"}
        subtitle={profile?.subject?.join(" | ")}
      />
      <Container maxWidth="md" sx={{ pb: 6 }}>
        <QueryState query={query}>
          {profile && (
            <>
              <ProfileCard profile={profile} kind={kind} />
              {kind === "student" && profile.address && (
                <Button
                  component={RouterLink}
                  to={
                    "/addresses?address=" + encodeURIComponent(profile.address)
                  }
                  sx={{ mt: 2 }}
                >
                  View location
                </Button>
              )}
              {kind === "teacher" && (
                <>
                  <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
                    Student reviews
                  </Typography>
                  <QueryState query={reviews}>
                    {reviews.data?.length === 0 && (
                      <Typography color="text.secondary">
                        No reviews yet.
                      </Typography>
                    )}
                    <Stack spacing={2}>
                      {reviews.data?.map((review) => (
                        <Card key={review._id}>
                          <CardContent>
                            <Stack direction="row" spacing={2}>
                              <Avatar
                                src={avatar(review.commenter)}
                                alt={review.commenter?.name}
                              />
                              <Box>
                                <Typography sx={{ fontWeight: 600 }}>
                                  {review.commenter?.name || "Student"}
                                </Typography>
                                <Rating
                                  readOnly
                                  size="small"
                                  value={review.rating}
                                />
                                <Typography
                                  variant="caption"

                                  color="text.secondary"
                                  sx={{ display: "block" }}
                                >
                                  {new Date(
                                    review.createdAt,
                                  ).toLocaleDateString()}
                                </Typography>
                              </Box>
                            </Stack>
                            <Typography sx={{ mt: 2 }}>
                              {review.comment}
                            </Typography>
                          </CardContent>
                        </Card>
                      ))}
                    </Stack>
                  </QueryState>
                  {user?.role === "student" && (
                    <Card sx={{ mt: 3 }}>
                      <CardContent>
                        <ReviewForm teacherId={id} />
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </>
          )}
        </QueryState>
      </Container>
    </>
  );
}
export function CoursesPage() {
  const courses = useGetCoursesQuery();
  const { user } = useSession();
  const [open, setOpen] = useState(false);
  return (
    <>
      <PageTitle
        title="Discover your next interest"
        subtitle="Explore courses for every age and learning goal."
      />
      <Container maxWidth="lg" sx={{ pb: 6 }}>
        {user?.role === "admin" && (
          <Button
            variant="contained"
            onClick={() => setOpen(true)}
            sx={{ mb: 3 }}
          >
            Add course
          </Button>
        )}
        <QueryState query={courses} empty={courses.data?.length === 0}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2,1fr)",
                md: "repeat(3,1fr)",
              },
              gap: 3,
            }}
          >
            {courses.data?.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))}
          </Box>
        </QueryState>
        <CourseEditor open={open} onClose={() => setOpen(false)} />
      </Container>
    </>
  );
}
export function CourseDetailPage() {
  const { id } = useParams();
  const query = useGetCourseQuery(id);
  const { user } = useSession();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [deleteCourse, { isLoading }] = useDeleteCourseMutation();
  const navigate = useNavigate();
  const course = query.data;
  return (
    <>
      <PageTitle
        title={course?.name || "Course"}
        subtitle="Make space for something new."
      />
      <Container maxWidth="md" sx={{ pb: 6 }}>
        <QueryState query={query}>
          {course && (
            <Stack spacing={3}>
              {error && <Alert severity="error">{error}</Alert>}
              <Box
                component="img"
                src={courseImage(course)}
                alt={course.name}
                sx={{
                  width: "100%",
                  maxHeight: 430,
                  objectFit: "cover",
                  borderRadius: 3,
                }}
              />
              <Typography sx={{ fontSize: 18 }}>
                {course.description}
              </Typography>
              <Stack direction="row" spacing={2} sx={{ flexWrap: "wrap" }}>
                <Button
                  component={RouterLink}
                  to={"/teachers?subject=" + encodeURIComponent(course.name)}
                  variant="contained"
                >
                  Find a {course.name} teacher
                </Button>
                {user?.role === "admin" && (
                  <>
                    <Button onClick={() => setOpen(true)} variant="outlined">
                      Edit course
                    </Button>
                    <Button
                      color="error"
                      disabled={isLoading}
                      onClick={async () => {
                        if (!window.confirm("Delete this course?")) return;
                        try {
                          await deleteCourse(id).unwrap();
                          navigate("/courses");
                        } catch (e) {
                          setError(errorMessage(e));
                        }
                      }}
                    >
                      Delete course
                    </Button>
                  </>
                )}
              </Stack>
              <CourseEditor
                open={open}
                course={course}
                onClose={() => setOpen(false)}
              />
            </Stack>
          )}
        </QueryState>
      </Container>
    </>
  );
}
export function MyProfilePage() {
  const { user } = useSession();
  const [role, setRole] = useState(
    user?.role === "teacher" ? "teacher" : "student",
  );
  if (user?.role === "admin")
    return (
      <>
        <PageTitle title="Your admin account" subtitle={user.username} />
        <Container maxWidth="md">
          <Alert severity="info">
            Your account has access to user and course management.
          </Alert>
          <Button
            component={RouterLink}
            to="/admin"
            variant="contained"
            sx={{ mt: 3 }}
          >
            Open admin dashboard
          </Button>
        </Container>
      </>
    );
  const selected = user?.role === "unassigned" ? role : user?.role;
  const profile =
    selected === "teacher" ? user?.teacherProfile : user?.studentProfile;
  return (
    <>
      <PageTitle
        title={profile ? "Your profile" : "Let's introduce you"}
        subtitle="Tell the community what you teach or what you want to learn."
      />
      <Container maxWidth="md" sx={{ pb: 6 }}>
        {user?.role === "unassigned" && (
          <TextField
            select
            label="I want to"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            fullWidth
            sx={{ mb: 3 }}
          >
            <MenuItem value="student">Find a teacher</MenuItem>
            <MenuItem value="teacher">Offer tutoring</MenuItem>
          </TextField>
        )}
        <Card>
          <CardContent sx={{ p: { xs: 2, md: 4 } }}>
            <ProfileForm
              key={selected + ":" + (profile?._id || "new")}
              role={selected}
              profile={profile}
            />
          </CardContent>
        </Card>
      </Container>
    </>
  );
}
export function ConnectionsPage() {
  const query = useGetConnectionsQuery();
  const { user } = useSession();
  const [disconnect, { isLoading }] = useDisconnectMutation();
  const [error, setError] = useState("");
  return (
    <>
      <PageTitle
        title="Your connections"
        subtitle="Keep track of teachers and students you have connected with."
      />
      <Container maxWidth="lg" sx={{ pb: 6 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <QueryState query={query} empty={query.data?.length === 0}>
          <Box className="page-grid">
            {query.data?.map((connection) => {
              const other =
                user.role === "teacher"
                  ? connection.studentId
                  : connection.teacherId;
              const kind = user.role === "teacher" ? "student" : "teacher";
              if (!other) return null;
              return (
                <Box key={connection._id}>
                  <ProfileCard profile={other} kind={kind} />
                  {user.role === "admin" && (
                    <Typography sx={{ mt: 1 }}>
                      Student: {connection.studentId?.name}
                    </Typography>
                  )}
                  <Button
                    color="error"
                    disabled={isLoading}
                    onClick={async () => {
                      if (!window.confirm("Remove this connection?")) return;
                      try {
                        await disconnect(connection._id).unwrap();
                      } catch (e) {
                        setError(errorMessage(e));
                      }
                    }}
                    sx={{ mt: 1 }}
                  >
                    Remove connection
                  </Button>
                </Box>
              );
            })}
          </Box>
        </QueryState>
      </Container>
    </>
  );
}
export function AdminPage() {
  const [search, setSearch] = useState("");
  const query = useGetUsersQuery();
  const [role, setRole] = useState("all");
  const [feedback, setFeedback] = useState(null);
  const [setDisabled, { isLoading: disableLoading }] = useSetDisabledMutation();
  const [deleteUser, { isLoading: deleteLoading }] = useDeleteUserMutation();
  const [open, setOpen] = useState(false);
  const users = (query.data || []).filter(
    (user) =>
      (role === "all" || user.role === role) &&
      [user.username, user.teacherProfile?.name, user.studentProfile?.name]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(search.trim().toLowerCase()),
  );
  return (
    <>
      <PageTitle
        title="Admin dashboard"
        subtitle="Manage community accounts and courses."
      />
      <Container maxWidth="lg" sx={{ pb: 6 }}>
        <Stack direction="row" spacing={2} sx={{ mb: 3, flexWrap: "wrap" }}>
          <Button component={RouterLink} to="/courses" variant="outlined">
            Manage courses
          </Button>
          <Button variant="contained" onClick={() => setOpen(true)}>
            Add course
          </Button>
        </Stack>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(3,1fr)" },
            gap: 2,
            mb: 4,
          }}
        >
          {[
            ["teacher", "Teachers"],
            ["student", "Students"],
            ["admin", "Admins"],
          ].map(([key, label]) => (
            <Card key={key}>
              <CardContent>
                <Typography color="text.secondary">{label}</Typography>
                <Typography variant="h3">
                  {query.data?.filter((u) => u.role === key).length || 0}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
        {feedback && (
          <Alert severity={feedback.severity} sx={{ mb: 2 }}>
            {feedback.text}
          </Alert>
        )}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ mb: 2 }}
        >
          <TextField
            label="Search accounts"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flex: 1 }}
          />
          <TextField
            select
            label="Account type"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            sx={{ mb: 2, minWidth: 220 }}
          >
            {["all", "teacher", "student", "admin", "unassigned"].map(
              (value) => (
                <MenuItem key={value} value={value}>
                  {value === "all"
                    ? "All accounts"
                    : value[0].toUpperCase() + value.slice(1)}
                </MenuItem>
              ),
            )}
          </TextField>
        </Stack>
        <QueryState query={query} empty={users.length === 0}>
          <TableContainer component={Card}>
            <Table aria-label="Community accounts">
              <TableHead>
                <TableRow>
                  <TableCell>Account</TableCell>
                  <TableCell>Profile</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>
                      {(user.teacherProfile || user.studentProfile)?.name ||
                        "-"}
                    </TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={user.isDisable ? "Disabled" : "Active"}
                        color={user.isDisable ? "default" : "success"}
                      />
                    </TableCell>
                    <TableCell>
                      {user.role !== "admin" && (
                        <Stack direction="row" spacing={1}>
                          <Button
                            disabled={disableLoading}
                            onClick={async () => {
                              try {
                                await setDisabled({
                                  id: user._id,
                                  isDisable: !user.isDisable,
                                }).unwrap();
                                setFeedback({
                                  severity: "success",
                                  text: "Account updated.",
                                });
                              } catch (e) {
                                setFeedback({
                                  severity: "error",
                                  text: errorMessage(e),
                                });
                              }
                            }}
                          >
                            {user.isDisable ? "Enable" : "Disable"}
                          </Button>
                          <Button
                            color="error"
                            disabled={deleteLoading}
                            onClick={async () => {
                              if (
                                !window.confirm(
                                  "Delete " +
                                    user.username +
                                    " and their profile, reviews, and connections?",
                                )
                              )
                                return;
                              try {
                                await deleteUser(user._id).unwrap();
                                setFeedback({
                                  severity: "success",
                                  text: "Account deleted.",
                                });
                              } catch (e) {
                                setFeedback({
                                  severity: "error",
                                  text: errorMessage(e),
                                });
                              }
                            }}
                          >
                            Delete
                          </Button>
                        </Stack>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </QueryState>
        <CourseEditor open={open} onClose={() => setOpen(false)} />
      </Container>
    </>
  );
}
export function AddressPage() {
  const [params] = useSearchParams();
  const { address } = useParams();
  const [search, setSearch] = useState(address || params.get("address") || "");
  const students = useGetStudentsQuery();
  const items = (students.data || []).filter(
    (p) =>
      p.address &&
      [p.name, p.address, ...p.district]
        .join(" ")
        .toLowerCase()
        .includes(search.trim().toLowerCase()),
  );
  return (
    <>
      <PageTitle
        title="Find an address"
        subtitle="Browse saved student addresses in your community."
      />
      <Container sx={{ pb: 6 }}>
        <TextField
          fullWidth
          label="Search name, address, or district"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ mb: 3 }}
        />
        <QueryState query={students} empty={items.length === 0}>
          <Box className="page-grid">
            {items.map((p) => (
              <Card key={p._id}>
                <CardContent>
                  <Typography variant="h6">{p.name}</Typography>
                  <Typography sx={{ my: 2 }}>{p.address}</Typography>
                  <Typography color="text.secondary">
                    {p.district.join(", ")}
                  </Typography>
                  <Button component={RouterLink} to={"/students/" + p._id}>
                    View profile
                  </Button>
                </CardContent>
              </Card>
            ))}
          </Box>
        </QueryState>
      </Container>
    </>
  );
}
