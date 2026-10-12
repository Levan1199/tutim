import React, { useEffect, useState } from "react";
import { isDemo } from "./runtime.js";
import {
  courseUrl,
  courseHeaderUrl,
  fetchCourseInfo,
  avatarUrl,
  homeUrl,
  centerAddress,
  fetchTeacherReg,
  fetchTeacherAcc,
  fetchStudentAcc,
  disableTeacherAcc,
  disableStudentAcc,
  fetchCourseDetail,
  deleteCourseDetail,
  fetchStudentReg,
  teacherAwait,
  fetchTeacherAwait,
  studentAwait,
  fetchStudentAwait,
  removeStudentAwait,
  fetchProfile,
  removeTeacherAwait,
  fetchComments,
  postComment,
} from "./store.js";
import {
  createStyles,
  Loading,
  StarRating,
  Multiselect,
  InfiniteScroll,
  OptionSelect,
} from "./components.jsx";
import {
  Typography,
  Grid,
  Container,
  Box,
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardMedia,
  Fade,
  Slide,
  Grow,
  Paper,
  TextField,
  Modal,
  Divider,
  CardHeader,
  Avatar,
  FormControlLabel,
  Radio,
  RadioGroup,
  Checkbox,
} from "@mui/material";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { connect, useDispatch, useSelector } from "react-redux";
import {
  CreateCourseForm,
  EditCourseForm,
  StudentIntroEditor,
  StudentDetailEditor,
  TeacherIntroEditor,
  TeacherDetailEditor,
  ReviewForm,
} from "./forms.jsx";
import { Formik, Form, FastField } from "formik";
import * as FilterField from "./store.js";
import { toast } from "react-toastify";
import SearchIcon from "@mui/icons-material/Search";
import SubdirectoryArrowLeftIcon from "@mui/icons-material/SubdirectoryArrowLeft";
import EditIcon from "@mui/icons-material/Edit";
import PhoneIcon from "@mui/icons-material/Phone";
import MailIcon from "@mui/icons-material/Mail";
/* CoursesPage */
const selectCoursesPageState = (state) => {
  return { courseInfo: state.courseInfo };
};
const coursesPageActions = (dispatch) => ({
  fetchCourseInfo: () => dispatch(fetchCourseInfo()),
});
const useCoursesPageStyles = createStyles((theme) => ({
  root: { flexGrow: 1 },
  media: { height: 140 },
  container: { padding: "20px 0px" },
  paper: {
    minHeight: "400px",
    maxHeight: "400px",
    maxWidth: "700px",
    width: "700px",
    margin: "20px 0px",
  },
  main: { backgroundColor: "#f5f5f5", padding: 0, minHeight: "100vh" },
  box: {
    width: "100%",
    padding: "20px 0",
    backgroundColor: theme.palette.secondary.light,
  },
  normalText: {
    fontFamily: "Segoe UI",
    fontWeight: "medium",
    fontSize: "1.2rem",
  },
  headerText: {
    fontWeight: "bold",
    fontFamily: "Roboto",
    color: theme.palette.primary.dark,
  },
}));
const CoursesPageCoursesRender = (props) => {
  const { name, imgPath } = props.course;
  const classes = useCoursesPageStyles();
  const history = useNavigate();
  const handleClick = () => {
    history(`/courseDetail/${name}`);
  };
  return (
    <Card className={classes.root}>
      <CardActionArea onClick={handleClick}>
        <CardMedia
          className={classes.media}
          image={courseUrl + imgPath}
          title="Top Course"
        />

        <CardContent>
          <Typography gutterBottom variant="h5" component="h2">
            {name}
          </Typography>
        </CardContent>
      </CardActionArea>

      <CardActions onClick={handleClick}>
        <Button variant="contained" color="primary">
          More Information
        </Button>
      </CardActions>
    </Card>
  );
};
const CoursesPageCourses = (props) => {
  const classes = useCoursesPageStyles();
  const { courseInfo, fetchCourseInfo } = props;
  useEffect(() => {
    async function fetchData() {
      return await fetchCourseInfo();
    }
    fetchData();
  }, []);
  if (courseInfo.isLoading) {
    return <Loading />;
  } else {
    return (
      <Container maxWidth={false} className={classes.main}>
        <Box className={classes.box}>
          <Typography
            variant="h4"
            align="center"
            className={classes.headerText}
          >
            Courses
          </Typography>
          <Typography
            variant="body1"
            align="center"
            className={classes.normalText}
          >
            Discover courses for all ages and exciting subjects
          </Typography>
        </Box>
        <Container maxWidth="lg" className={classes.container}>
          <Grid container spacing={2} sx={{ justifyContent: "center" }}>
            {(() => {
              return props.courseInfo.courseInfo.map((course, index) => {
                if (course) {
                  return (
                    <Grid size={{ xs: 3 }} key={index}>
                      <CoursesPageCoursesRender course={course} />
                    </Grid>
                  );
                } else {
                  return "";
                }
              });
            })()}
          </Grid>
        </Container>
      </Container>
    );
  }
};
const CoursesPage = connect(
  selectCoursesPageState,
  coursesPageActions,
)(CoursesPageCourses);
/* HomePage */
const selectHomePageState = (state) => {
  return {
    teacherRegs: state.teacherRegs,
    courseInfo: state.courseInfo,
    profiles: state.profiles,
  };
};
const homePageActions = (dispatch) => ({
  fetchCourseInfo: () => dispatch(fetchCourseInfo()),
  fetchTeacherReg: () => dispatch(fetchTeacherReg()),
});
const useHomePageStyles = createStyles((theme) => ({
  root: { flexGrow: 1 },
  img: {
    margin: "auto",
    display: "block",
    maxWidth: "100%",
    maxHeight: "100%",
  },
  media: { height: 0, paddingTop: "56.25%", marginTop: "30" },
  paperStyle: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    width: "100%",
    height: "100vh",
    backgroundImage: `url(${courseHeaderUrl})`,
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
  },
  headerText: { fontWeight: "bold", fontFamily: "Roboto" },
  normalText: { fontFamily: "Segoe UI", fontWeight: "medium" },
  box: { width: "100%", padding: "20px 0" },
  main: { backgroundColor: "#f5f5f5", padding: 0 },
  container: { padding: "20px 0px" },
  infoSection: {
    padding: "20px 0px",
    backgroundColor: theme.palette.secondary.light,
  },
  infoImg: { width: "100%", height: 128 },
  infoGrid: { maxWidth: "960px" },
  cplxRoot: { display: "flex" },
  cplxContent: { flex: "1 0 auto" },
  cplxCover: { width: 151, maxWidth: 151 },
  cplxDetails: {
    display: "flex",
    flexDirection: "column",
    maxHeight: "200px",
    minHeight: "200px",
    width: "100%",
    backgroundColor: theme.palette.secondary.light,
  },
}));
const HomePageComplexGrid = (props) => {
  const { profile } = props;
  const classes = useHomePageStyles();
  let history = useNavigate();
  let subject = profile.subject ? profile.subject.join(", ") : "";
  const rating = profile.rate / profile.commentCount;
  const handleClick = () => {
    history(`/profile/teacher/${profile._id}`);
  };
  return (
    <Card className={classes.cplxRoot}>
      <CardMedia
        className={classes.cplxCover}
        image={avatarUrl + profile.imgPath}
        title="Top Course"
      />

      <div className={classes.cplxDetails}>
        <CardContent className={classes.cplxContent}>
          <Typography variant="subtitle1" className={classes.headerText}>
            {profile.name}
          </Typography>
          <StarRating rating={rating} />
          <Typography variant="subtitle2">{subject}</Typography>
          <Button onClick={handleClick} variant="contained" color="primary">
            More Information
          </Button>
        </CardContent>
      </div>
    </Card>
  );
};
const HomePageTopCourses = (props) => {
  const { name, imgPath } = props.course;
  const classes = useHomePageStyles();
  let history = useNavigate();
  const handleClick = () => {
    history(`/courseDetail/${name}`);
  };
  return (
    <Card>
      <CardActionArea onClick={handleClick}>
        <CardMedia
          className={classes.media}
          image={courseUrl + imgPath}
          title="Top Course"
        />

        <CardContent>
          <Typography gutterBottom variant="h5" component="h2">
            {name}
          </Typography>
        </CardContent>
      </CardActionArea>

      <CardActions onClick={handleClick}>
        <Button variant="contained" color="primary">
          More Information
        </Button>
      </CardActions>
    </Card>
  );
};
function HomePageHome(props) {
  const { fetchCourseInfo, fetchTeacherReg, profiles } = props;
  let history = useNavigate();
  let location = useLocation();
  useEffect(() => {
    async function fetchData() {
      await fetchCourseInfo();
      return await fetchTeacherReg();
    }
    fetchData();
  }, []);
  useEffect(() => {
    if (profiles.isEmpty && location.pathname !== "/stepper") {
      history("/stepper");
    }
  }, [profiles]);
  const classes = useHomePageStyles();
  if (props.courseInfo.isLoading || props.teacherRegs.isLoading) {
    return <Loading />;
  } else {
    return (
      <>
        <Fade in={true} timeout={{ enter: 2000 }}>
          <Paper className={classes.paperStyle} variant="outlined">
            <Typography
              color="primary"
              variant="h1"
              align="center"
              className={classes.headerText}
            >
              GET STUDY
            </Typography>
            <Typography
              color="primary"
              variant="h2"
              align="center"
              className={classes.headerText}
            >
              A place for pupils and teachers
            </Typography>
          </Paper>
        </Fade>

        <Container maxWidth={false} className={classes.main}>
          <Slide direction="right" in={true} timeout={2000}>
            <Container maxWidth={false} className={classes.infoSection}>
              <Container maxWidth="lg">
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12 }}>
                    <Typography
                      variant="h2"
                      align="center"
                      className={classes.headerText}
                    >
                      This can be the starting place
                    </Typography>
                    <Typography
                      variant="h4"
                      align="center"
                      className={classes.normalText}
                    >
                      Natural science and mathematics, English, Art talent
                      training and soft skills development for children will
                      help your child make great progress and find a passion for
                      discovering the world.
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 12, md: 4 }}>
                    <div className={classes.infoImg}>
                      <img
                        className={classes.img}
                        alt="Teacher"
                        src={homeUrl + "art.png"}
                      />
                    </div>
                    <Typography
                      variant="h6"
                      align="center"
                      className={classes.headerText}
                    >
                      {" "}
                      ART{" "}
                    </Typography>
                    <Typography
                      variant="body1"
                      align="center"
                      className={classes.normalText}
                    >
                      Painting, Chess, siging in English, Modern Dancing,
                      Dancing, Ukulele, Piano... improve creativity,
                      intelligence and train children's body flexibility.
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <div className={classes.infoImg}>
                      <img
                        className={classes.img}
                        alt="Teacher"
                        src={homeUrl + "language.png"}
                      />
                    </div>
                    <Typography
                      variant="h6"
                      align="center"
                      className={classes.headerText}
                    >
                      {" "}
                      LANGUAGE{" "}
                    </Typography>
                    <Typography
                      variant="body1"
                      align="center"
                      className={classes.normalText}
                    >
                      Learning a new language means your brain has to cope with
                      complexity as it makes sense of and absorbs new patterns.
                      As our brains work out the meaning, endeavoring to
                      communicate, we develop key learning skills such as
                      cognitive thinking and problem-solving.
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <div className={classes.infoImg}>
                      <img
                        className={classes.img}
                        alt="Teacher"
                        src={homeUrl + "softskill.png"}
                      />
                    </div>
                    <Typography
                      variant="h6"
                      align="center"
                      className={classes.headerText}
                    >
                      {" "}
                      SOFT SKILLS{" "}
                    </Typography>
                    <Typography
                      variant="body1"
                      align="center"
                      className={classes.normalText}
                    >
                      Soft skills are attributes that help determine how we
                      approach our work and also how we work with others. Soft
                      skills pump up the curious minds to act and make the path
                      to success
                    </Typography>
                  </Grid>
                </Grid>
              </Container>
            </Container>
          </Slide>

          <Box className={classes.box}>
            <Typography
              variant="h4"
              align="center"
              className={classes.normalText}
            >
              Lastest Courses
            </Typography>
            <Typography
              variant="body1"
              align="center"
              className={classes.normalText}
            >
              Discover courses for all ages and exciting subjects
            </Typography>
          </Box>

          <Grow in={true} timeout={2000}>
            <Container maxWidth="lg" className={classes.container}>
              <Grid size={{ xs: 12 }}>
                <Grid container spacing={2} sx={{ justifyContent: "center" }}>
                  {(() => {
                    const length = props.courseInfo.courseInfo.length;
                    const courses = props.courseInfo.courseInfo.slice(
                      length - 8,
                      length,
                    );
                    return courses.map((course) => {
                      if (course) {
                        return (
                          <Grid size={{ md: 3 }} key={course._id}>
                            <HomePageTopCourses course={course} />
                          </Grid>
                        );
                      } else return <Loading />;
                    });
                  })()}
                </Grid>
              </Grid>
            </Container>
          </Grow>

          <Box className={classes.box}>
            <Typography
              variant="h4"
              align="center"
              className={classes.normalText}
            >
              Top Teachers
            </Typography>
            <Typography
              variant="body1"
              align="center"
              className={classes.normalText}
            >
              Teachers have most possitive feedbacks
            </Typography>
          </Box>

          <Grow in={true} timeout={2000}>
            <Container maxWidth="lg" className={classes.container}>
              <Grid container spacing={2} sx={{ justifyContent: "center" }}>
                {(() => {
                  const compare = (a, b) => {
                    if (a.rate / a.commentCount < b.rate / b.commentCount) {
                      return -1;
                    }
                    if (a.rate / a.commentCount > b.rate / b.commentCount) {
                      return 1;
                    }
                    return 0;
                  };
                  let teachers = props.teacherRegs.teacherRegs;
                  teachers = teachers.sort(compare);
                  teachers = teachers.reverse().slice(0, 6);
                  return teachers.map((teacher, idx) => {
                    if (teacher) {
                      return (
                        <Grid size={{ xs: 4 }} key={idx}>
                          <HomePageComplexGrid profile={teacher} />
                        </Grid>
                      );
                    } else return <Loading />;
                  });
                })()}
              </Grid>
            </Container>
          </Grow>

          <Container maxWidth={false}>
            <Box className={classes.box}>
              <Typography
                variant="h4"
                align="center"
                className={classes.headerText}
              >
                CENTER ADDRESS
              </Typography>
            </Box>
            <Container maxWidth="lg" className={classes.container}>
              <Paper variant="outlined" sx={{ p: 3 }}>
                <Typography variant="h6">{centerAddress}</Typography>
              </Paper>
            </Container>
          </Container>
        </Container>
      </>
    );
  }
}
const HomePage = connect(selectHomePageState, homePageActions)(HomePageHome);
/* AddressPage: searches saved addresses without an external map provider. */
const useAddressPageStyles = createStyles((theme) => ({
  container: { padding: "20px 0px" },
  main: { backgroundColor: "#f5f5f5", padding: 0, minHeight: "100vh" },
  box: {
    width: "100%",
    padding: "20px 0",
    backgroundColor: theme.palette.secondary.light,
  },
  normalText: {
    fontFamily: "Segoe UI",
    fontWeight: "medium",
    fontSize: "1.2rem",
  },
  headerText: {
    fontWeight: "bold",
    fontFamily: "Roboto",
    color: theme.palette.primary.dark,
  },
}));
function AddressPage({ address }) {
  const classes = useAddressPageStyles();
  const dispatch = useDispatch();
  const students = useSelector((state) => state.studentRegs);
  const [query, setQuery] = useState(address || "");
  useEffect(() => {
    setQuery(address || "");
  }, [address]);
  useEffect(() => {
    dispatch(fetchStudentReg());
  }, [dispatch]);
  const normalize = (value) =>
    String(value || "")
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLocaleLowerCase();
  const search = normalize(query.trim());
  const matches = (students.studentRegs || []).filter(
    (student) =>
      student.address &&
      normalize(
        [student.name, student.address, ...(student.district || [])].join(" "),
      ).includes(search),
  );
  const showCenter = normalize(centerAddress).includes(search);
  return (
    <Container maxWidth={false} className={classes.main}>
      <Box className={classes.box}>
        <Typography variant="h4" align="center" className={classes.headerText}>
          Addresses
        </Typography>
        <Typography
          variant="body1"
          align="center"
          className={classes.normalText}
        >
          Search students by name, address or district
        </Typography>
      </Box>
      <Container maxWidth="lg" className={classes.container}>
        <TextField
          label="Search addresses"
          placeholder="Name, address or district"
          fullWidth
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          sx={{ mb: 3 }}
        />
        {students.errMess && (
          <Typography role="alert">{students.errMess}</Typography>
        )}
        <Grid container spacing={2}>
          {showCenter && (
            <Grid size={{ xs: 12 }}>
              <Paper variant="outlined" sx={{ p: 3 }}>
                <Typography variant="h6">Center address</Typography>
                <Typography>{centerAddress}</Typography>
              </Paper>
            </Grid>
          )}
          {matches.map((student) => (
            <Grid size={{ xs: 12, md: 6 }} key={student._id}>
              <Paper variant="outlined" sx={{ p: 3 }}>
                <Typography variant="h6">
                  <Link to={"/profile/student/" + student._id}>
                    {student.name}
                  </Link>
                </Typography>
                <Typography>{student.address}</Typography>
                <Typography color="textSecondary">
                  {(student.district || []).join(", ")}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
        {students.isLoading && (
          <Typography role="status" sx={{ mt: 2 }}>
            Loading addresses...
          </Typography>
        )}
        {!students.isLoading &&
          !students.errMess &&
          !showCenter &&
          !matches.length && (
            <Typography sx={{ mt: 2 }}>
              No saved address matches your search.
            </Typography>
          )}
      </Container>
    </Container>
  );
}
/* AdminAccountList */
const useAdminAccountListStyles = createStyles((theme) => ({
  text: {
    fontWeight: "bold",
    fontSize: "30px",
    color: theme.palette.primary.dark,
  },
  container: { padding: "20px 0px" },
  header: { paddingBottom: "10px" },
  button: { height: "50px", width: "75px" },
  main: { padding: 0, minHeight: "100vh", backgroundColor: "#f5f5f5" },
  box: {
    width: "100%",
    padding: "20px 0",
    backgroundColor: theme.palette.secondary.light,
  },
  normalText: {
    fontFamily: "Segoe UI",
    fontWeight: "medium",
    fontSize: "1.5rem",
  },
  headerText: {
    fontWeight: "bold",
    fontFamily: "Roboto",
    color: theme.palette.primary.dark,
  },
  card: { minHeight: "265px", maxHeight: "265px" },
  cardcontent: { "&:last-child": { paddingTop: 0 } },
  paper: {
    padding: theme.spacing(2),
    margin: "auto",
    maxWidth: "80%",
    backgroundColor: theme.palette.secondary.light,
  },
  paper2: {
    padding: theme.spacing(2),
    margin: "auto",
    maxWidth: "80%",
    backgroundColor: "#dcdcdc",
  },
  image: { width: 128, height: 128 },
  img: {
    margin: "auto",
    display: "block",
    maxWidth: "100%",
    maxHeight: "100%",
  },
  disableButton: { backgroundColor: theme.palette.warning.main },
}));
const adminAccountListRoles = {
  teacher: {
    state: "managerProfiles",
    items: "managerProfiles",
    fetch: fetchTeacherAcc,
    toggle: disableTeacherAcc,
  },
  student: {
    state: "managerStudentProfiles",
    items: "managerStudentProfiles",
    fetch: fetchStudentAcc,
    toggle: disableStudentAcc,
  },
};
function AdminAccountList({ role }) {
  const classes = useAdminAccountListStyles(),
    dispatch = useDispatch(),
    settings = adminAccountListRoles[role];
  const state = useSelector((store) => store[settings.state]);
  useEffect(() => {
    dispatch(settings.fetch());
  }, [dispatch, settings]);
  return (
    <Container maxWidth={false} className={classes.main}>
      <Box className={classes.box}>
        <Typography variant="h4" align="center" className={classes.headerText}>
          Current {role} accounts
        </Typography>
      </Box>
      <Container maxWidth="lg" className={classes.container}>
        {state.isLoading ? (
          <Loading />
        ) : state.errMess ? (
          <p role="alert">{state.errMess}</p>
        ) : (
          <Grid container spacing={2} sx={{ justifyContent: "center" }}>
            {state[settings.items].map((account) => {
              const profile = account[role + "Profile"];
              if (!profile) return null;
              return (
                <Grid size={12} key={account._id}>
                  <Paper
                    className={
                      account.isDisable ? classes.paper2 : classes.paper
                    }
                  >
                    <Grid
                      container
                      spacing={2}
                      sx={{ justifyContent: "center" }}
                    >
                      <Grid size={{ xs: 12, sm: 2 }}>
                        <div className={classes.image}>
                          <img
                            className={classes.img}
                            alt={role}
                            src={avatarUrl + profile.imgPath}
                          />
                        </div>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 8 }} container>
                        <Grid container direction="column" spacing={2}>
                          <Grid>
                            <Typography variant="h6">{profile.name}</Typography>
                            <Typography variant="subtitle1">
                              ID: {profile._id}
                            </Typography>
                            <Typography variant="body2">
                              {profile.subject?.join(", ")}
                            </Typography>
                            <Typography variant="body2">
                              {profile.district?.join(", ")}
                            </Typography>
                            <Typography variant="body2">
                              {profile.fee}
                            </Typography>
                            {role === "student" && (
                              <Typography variant="body2">
                                {profile.description}
                              </Typography>
                            )}
                          </Grid>
                          <Grid>
                            <Button
                              component={Link}
                              to={`/profile/${role}/${profile._id}`}
                              variant="contained"
                              color="primary"
                            >
                              More Information
                            </Button>
                          </Grid>
                        </Grid>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 2 }}>
                        <Button
                          variant="contained"
                          className={classes.disableButton}
                          onClick={() => dispatch(settings.toggle(account._id))}
                        >
                          {account.isDisable ? "Disabled" : "Disable"}
                        </Button>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        )}
        {!state.isLoading &&
          !state.errMess &&
          state[settings.items].length === 0 && (
            <Typography align="center">No {role} accounts yet.</Typography>
          )}
      </Container>
    </Container>
  );
}
/* AdminStudentList */
function AdminStudentList() {
  return <AdminAccountList role="student" />;
}
/* AdminTeacherList */
function AdminTeacherList() {
  return <AdminAccountList role="teacher" />;
}
/* AdminPage */
const useAdminPageStyles = createStyles((theme) => ({
  text: {
    fontWeight: "bold",
    fontSize: "30px",
    color: theme.palette.primary.dark,
  },
  container: { padding: "20px 0px" },
  header: { paddingBottom: "10px" },
  button: { height: "50px", width: "75px" },
  main: { padding: 0, minHeight: "100vh", backgroundColor: "#f5f5f5" },
  box: {
    width: "100%",
    padding: "20px 0",
    backgroundColor: theme.palette.secondary.light,
  },
  normalText: {
    fontFamily: "Segoe UI",
    fontWeight: "medium",
    fontSize: "1.5rem",
  },
  headerText: {
    fontWeight: "bold",
    fontFamily: "Roboto",
    color: theme.palette.primary.dark,
  },
  card: { minHeight: "265px", maxHeight: "265px" },
  cardcontent: { "&:last-child": { paddingTop: 0 } },
  paper: {
    padding: theme.spacing(2),
    margin: "auto",
    maxWidth: "80%",
    backgroundColor: theme.palette.secondary.light,
  },
  paper2: {
    padding: theme.spacing(2),
    margin: "auto",
    maxWidth: "80%",
    backgroundColor: "#dcdcdc",
  },
  image: { width: 128, height: 128 },
  img: {
    margin: "auto",
    display: "block",
    maxWidth: "100%",
    maxHeight: "100%",
  },
  disableButton: { backgroundColor: theme.palette.warning.main },
  modal: { display: "flex", alignItems: "center", justifyContent: "center" },
}));
const AdminPage = (props) => {
  const classes = useAdminPageStyles();
  const [postCourse, setPostCourse] = React.useState(false);
  return (
    <Container maxWidth={false} className={classes.main}>
      <Box className={classes.box}>
        <Typography variant="h4" align="center" className={classes.headerText}>
          Admin View
        </Typography>
        <Typography
          variant="body1"
          align="center"
          className={classes.normalText}
        >
          Management
        </Typography>
      </Box>
      <Container maxWidth="lg" className={classes.container}>
        <Grid size={{ xs: 12 }} container spacing={1}>
          <Grid>
            <Link to="/admin/studentList">
              <Button variant="contained" color="primary">
                Student List
              </Button>
            </Link>
          </Grid>
          <Grid>
            <Link to="/admin/teacherList">
              <Button variant="contained" color="primary">
                Teacher List
              </Button>
            </Link>
          </Grid>
          <Grid>
            <Link to="/courses">
              <Button variant="contained" color="primary">
                Courses
              </Button>
            </Link>
          </Grid>
          <Grid>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setPostCourse(true)}
            >
              Post Course
            </Button>
          </Grid>
        </Grid>
      </Container>

      <Modal
        className={classes.modal}
        open={postCourse}
        onClose={() => setPostCourse(false)}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
        <CreateCourseForm closeModal={() => setPostCourse(false)} />
      </Modal>
    </Container>
  );
};
/* CourseDetailPage */
// import local data
const selectCourseDetailPageState = (state) => {
  return { courseInfo: state.courseInfo, profiles: state.profiles };
};
const courseDetailPageActions = (dispatch) => ({
  fetchCourseDetail: (name) => dispatch(fetchCourseDetail(name)),
  deleteCourseDetail: (name) => dispatch(deleteCourseDetail(name)),
});
const useCourseDetailPageStyles = createStyles((theme) => ({
  container: { padding: "20px 0px" },
  paper: {
    minHeight: "400px",
    maxHeight: "400px",
    maxWidth: "700px",
    width: "700px",
    margin: "20px 0px",
  },
  main: { backgroundColor: "#f5f5f5", padding: 0, minHeight: "100vh" },
  box: {
    width: "100%",
    padding: "20px 0",
    backgroundColor: theme.palette.secondary.light,
  },
  normalText: {
    fontFamily: "Segoe UI",
    fontWeight: "medium",
    fontSize: "1.2rem",
  },
  headerText: {
    fontWeight: "bold",
    fontFamily: "Roboto",
    color: theme.palette.primary.dark,
  },
  modal: { display: "flex", alignItems: "center", justifyContent: "center" },
}));
const CourseDetailPageCourseDetail = (props) => {
  const classes = useCourseDetailPageStyles();
  const {
    courseInfo,
    courseName,
    fetchCourseDetail,
    profiles,
    deleteCourseDetail,
  } = props;
  const history = useNavigate();
  useEffect(() => {
    async function fetchData() {
      return await fetchCourseDetail(courseName);
    }
    fetchData();
  }, []);
  const [edit, setEdit] = React.useState(false);
  if (courseInfo.isLoading) {
    return <Loading />;
  } else {
    const courses = courseInfo.courseInfo;
    const course = courses.filter(
      (course) => course.name === props.courseName,
    )[0];
    if (!course)
      return <p role="alert">{courseInfo.errMess || "Course not found."}</p>;
    const name = course.name.toUpperCase();
    const handleDelete = async () => {
      const deleted = await deleteCourseDetail(course.name);
      if (deleted) history("/courses");
    };
    return (
      <Container maxWidth={false} className={classes.main}>
        <Box className={classes.box}>
          <Typography
            variant="h4"
            align="center"
            className={classes.headerText}
          >
            {name} COURSE
          </Typography>
        </Box>
        <Container maxWidth="lg" className={classes.container}>
          <Grid container spacing={1} sx={{ justifyContent: "center" }}>
            <Grid size={{ xs: 12 }}>
              <Grid container spacing={1}>
                <Grid size={{ xs: 3 }}>
                  <Typography
                    variant="h5"
                    align="left"
                    className={classes.headerText}
                  >
                    Start learning {course.name}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 2 }}>
                  <Link to={`/teacherList/${course.name}`}>
                    <Button variant="contained" color="primary">
                      Register Now
                    </Button>
                  </Link>
                </Grid>
                {(() => {
                  if (profiles.profiles && profiles.profiles.admin) {
                    return (
                      <>
                        <Grid size={{ xs: 5 }} />
                        <Grid size={{ xs: 1 }}>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => setEdit(true)}
                          >
                            Edit
                          </Button>
                        </Grid>
                        <Grid size={{ xs: 1 }}>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleDelete()}
                          >
                            DELETE
                          </Button>
                        </Grid>
                      </>
                    );
                  }
                })()}
              </Grid>
              <Divider style={{ margin: "10px 0px 0px" }} />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography
                variant="h6"
                align="center"
                className={classes.normalText}
              >
                {course.description}
              </Typography>
            </Grid>

            <Paper variant="outlined" className={classes.paper}>
              <img
                alt="course ava"
                src={`${courseUrl}${course.imgPath}`}
                width="100%"
                height="100%"
              />
            </Paper>
          </Grid>

          <Modal
            className={classes.modal}
            open={edit}
            onClose={() => setEdit(false)}
            aria-labelledby="simple-modal-title"
            aria-describedby="simple-modal-description"
          >
            <EditCourseForm closeModal={() => setEdit(false)} course={course} />
          </Modal>
        </Container>
      </Container>
    );
  }
};
const CourseDetailPage = connect(
  selectCourseDetailPageState,
  courseDetailPageActions,
)(CourseDetailPageCourseDetail);
/* StudentDirectory */
const selectStudentDirectoryState = (state) => {
  return {
    studentRegs: state.studentRegs,
    auth: state.auth,
    profiles: state.profiles,
    awaiting: state.awaiting,
  };
};
const studentDirectoryActions = (dispatch) => ({
  fetchStudentReg: () => dispatch(fetchStudentReg()),
  teacherAwait: (connecting) => dispatch(teacherAwait(connecting)),
  fetchTeacherAwait: () => dispatch(fetchTeacherAwait()),
});
const useStudentDirectoryStyles = createStyles((theme) => ({
  text: {
    fontWeight: "bold",
    fontSize: "30px",
    color: theme.palette.primary.dark,
  },
  container: { padding: "20px 0px" },
  header: { paddingBottom: "10px" },
  button: { height: "50px", width: "75px" },
  main: { backgroundColor: "#efefef", padding: 0, minHeight: "100vh" },
  box: {
    width: "100%",
    padding: "20px 0",
    backgroundColor: theme.palette.secondary.light,
  },
  normalText: {
    fontFamily: "Segoe UI",
    fontWeight: "medium",
    fontSize: "1.5rem",
  },
  headerText: {
    fontWeight: "bold",
    fontFamily: "Roboto",
    color: theme.palette.primary.dark,
  },
  card: { minHeight: "240px", maxHeight: "240px" },
  cardcontent: { "&:last-child": { padding: 0 } },
  cardText: {
    fontFamily: "Roboto",
    fontWeight: "medium",
    color: theme.text.title,
  },
  cardTextBody: {
    fontFamily: "Roboto",
    fontWeight: "bold",
    color: theme.text.body,
  },
  cardTop: {
    padding: "0 10px",
    backgroundColor: "#d2e9f3",
    border: "2px solid #aed7e9",
  },
  cardBottom: { padding: "0 10px" },
  regButton: {
    backgroundColor: "#ffc334",
    color: "white",
    "&:hover": { backgroundColor: "#f2a900" },
  },
  headerName: {
    fontFamily: "Roboto",
    color: theme.text.body,
    fontWeight: "bold",
    fontSize: "1.3rem",
  },
  findLink: {
    fontFamily: "Roboto",
    color: theme.palette.primary.main,
    fontWeight: "bold",
  },
}));
const studentDirectoryFilterProps = (filterVals, student) => {
  const dist = filterVals.district.every((e) => {
    return student.district.includes(e);
  });
  const grade = filterVals.grade.every((e) => {
    return student.grade.includes(e);
  });
  const subject = filterVals.subject.every((e) => {
    return student.subject.includes(e);
  });
  const result = dist && grade && subject;
  return result;
};
const studentDirectoryHandleRegister = (
  register,
  studentId,
  auth,
  teacherId,
) => {
  const connecting = { studentId: studentId, teacherId: teacherId };
  if (!auth) {
    toast.error("You need to login!");
  } else if (!teacherId) {
    toast.error("Only teacher can register");
  } else {
    register(connecting);
    toast.success("Register successfully");
  }
};
const studentDirectoryIsInclude = (arr, teaId) => {
  const temp = arr.map((student) => student.studentId._id);
  const index = temp.indexOf(teaId);
  if (index === -1) return false;
  else return true;
};
function StudentDirectoryRenderStudentCard({
  student,
  auth,
  profile,
  register,
  awaiting,
}) {
  const editStyle = useStudentDirectoryStyles();
  let subject = student.subject.join(", ");
  let dist = student.district.join(",");
  let fee = student.fee ? student.fee.toLocaleString() : "";
  let grade = student.grade.join(", ");
  let teacherId = "";
  if (profile && profile.teacherProfile) {
    teacherId = profile.teacherProfile._id;
  }
  return (
    <Card className={editStyle.card}>
      <CardHeader
        className={editStyle.headerBg}
        avatar={<Avatar alt="avatar" src={avatarUrl + student.imgPath} />}
        subheader={
          <Link
            style={{ textDecoration: "none" }}
            className={editStyle.headerName}
            to={`/profile/student/${student._id}`}
          >
            {student.name}
          </Link>
        }
        action={
          studentDirectoryIsInclude(awaiting, student._id) ? (
            <Button color="secondary" variant="contained">
              Connecting
            </Button>
          ) : (
            <Button
              className={editStyle.regButton}
              variant="contained"
              onClick={() =>
                studentDirectoryHandleRegister(
                  register,
                  student._id,
                  auth,
                  teacherId,
                )
              }
              disabled={isDemo}
            >
              Register
            </Button>
          )
        }
      />

      <CardContent className={editStyle.cardcontent}>
        <Box className={editStyle.cardTop}>
          <Grid container sx={{ justifyContent: "space-between" }}>
            <Grid size={{ xs: 2 }}>
              <Typography className={editStyle.cardText} align="left">
                {" "}
                Subject:{" "}
              </Typography>
            </Grid>
            <Grid size={{ xs: 10 }}>
              <Typography
                className={editStyle.cardTextBody}
                noWrap
                align="right"
              >
                {subject}
              </Typography>
            </Grid>
          </Grid>
          <Grid container sx={{ justifyContent: "space-between" }}>
            <Grid size={{ xs: 2 }}>
              <Typography className={editStyle.cardText} align="left">
                {" "}
                District:{" "}
              </Typography>
            </Grid>
            <Grid size={{ xs: 10 }}>
              <Typography
                className={editStyle.cardTextBody}
                noWrap
                align="right"
              >
                {dist}
              </Typography>
            </Grid>
          </Grid>
          <Grid container sx={{ justifyContent: "space-between" }}>
            <Grid size={{ xs: 2 }}>
              <Typography className={editStyle.cardText} align="left">
                {" "}
                Grade:{" "}
              </Typography>
            </Grid>
            <Grid size={{ xs: 10 }}>
              <Typography
                className={editStyle.cardTextBody}
                noWrap
                align="right"
              >
                {grade}
              </Typography>
            </Grid>
          </Grid>
        </Box>
        <Box className={editStyle.cardBottom}>
          <Grid container sx={{ justifyContent: "space-between" }}>
            <Typography
              className={editStyle.cardText}
              sx={{ display: "inline" }}
            >
              Recommend Tuition Fee:{" "}
            </Typography>
            <Typography
              className={editStyle.cardTextBody}
              sx={{ display: "inline" }}
            >
              {fee}
            </Typography>
          </Grid>

          <Grid container sx={{ justifyContent: "space-between" }}>
            <Grid size={{ xs: 2 }}>
              <Typography className={editStyle.cardText} align="left">
                {" "}
                Address:{" "}
              </Typography>
            </Grid>
            <Grid size={{ xs: 10 }}>
              <Typography
                className={editStyle.cardTextBody}
                noWrap
                align="right"
              >
                <Link
                  className={editStyle.findLink}
                  style={{
                    textDecoration: "none",
                    textDecorationColor: "none",
                  }}
                  to={`/addresses/${encodeURIComponent(student.address || "")}`}
                >
                  {" "}
                  Find
                  <SearchIcon />
                </Link>
                {student.address}
              </Typography>
            </Grid>
          </Grid>

          <Grid container sx={{ justifyContent: "space-between" }}>
            <Grid size={{ xs: 2 }}>
              <Typography className={editStyle.cardText} align="left">
                Description:
              </Typography>
            </Grid>
            <Grid size={{ xs: 10 }}>
              <Typography
                className={editStyle.cardTextBody}
                noWrap
                align="right"
              >
                {student.description}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
}
const StudentDirectoryStudentRegs = (props) => {
  const classes = useStudentDirectoryStyles();
  const ownerId = props.profiles.profiles?.teacherProfile?._id;
  useEffect(() => {
    if (ownerId) props.fetchTeacherAwait();
  }, [ownerId]);
  const { fetchStudentReg, studentRegs, fetchTeacherAwait } = props;
  useEffect(() => {
    window.scrollTo(0, 0);
    async function fetchData() {
      await fetchStudentReg();
      return await fetchTeacherAwait();
    }
    fetchData();
  }, []);
  const [filterVals, setFilterVals] = useState({
    district: [],
    grade: [],
    subject: [],
  });
  const [foundStudents, setFoundStudents] = useState();
  useEffect(() => {
    const temp = studentRegs.studentRegs.filter((student) => {
      return studentDirectoryFilterProps(filterVals, student);
    });
    setFoundStudents(temp);
  }, [studentRegs, filterVals]);
  const handleSubmit = (values) => {
    var filterName = {};
    filterName.district = values.district.map((district) => district.name);
    filterName.grade = values.grade.map((grade) => grade.name);
    filterName.subject = values.subject.map((subject) => subject.name);
    setFilterVals(filterName);
  };
  const ScrollData = () => {
    const [tempArr, setTempArr] = useState(
      foundStudents.slice(5, foundStudents.length),
    );
    const [tempDataLength, setTempDataLength] = useState(
      foundStudents.slice(0, 5),
    );
    const fetchData = () => {
      const moreFive = tempArr.slice(0, 5);
      setTempDataLength((prev) => [...prev, ...moreFive]);
      setTempArr(tempArr.slice(5, tempArr.length));
    };
    const checkLeft = () => {
      if (tempDataLength.length < foundStudents.length) {
        return true;
      } else return false;
    };
    return (
      <InfiniteScroll
        dataLength={tempDataLength.length}
        next={fetchData}
        hasMore={checkLeft()}
        loader={<Loading />}
        style={{ overflowY: "hidden", overflowX: "hidden" }}
      >
        <Grid
          container
          direction="row"
          spacing={1}
          sx={{ justifyContent: "center" }}
        >
          {tempDataLength.map((student, index) => {
            if (student.available) {
              return (
                <Grid size={{ xs: 12, md: 5 }} key={index}>
                  <StudentDirectoryRenderStudentCard
                    student={student}
                    register={props.teacherAwait}
                    auth={props.auth}
                    profile={props.profiles.profiles}
                    awaiting={props.awaiting.awaiting}
                  />
                </Grid>
              );
            } else return null;
          })}
        </Grid>
      </InfiniteScroll>
    );
  };
  if (!foundStudents) {
    return <Loading />;
  } else {
    return (
      <Container maxWidth={false} className={classes.main}>
        <Box className={classes.box}>
          <Typography
            variant="h4"
            align="center"
            className={classes.headerText}
          >
            Current classes
          </Typography>
          <Typography
            variant="body1"
            align="center"
            className={classes.normalText}
          >
            Current classes that is in need of teachers
          </Typography>
        </Box>
        <Container maxWidth="lg" className={classes.container}>
          <Grid container spacing={1}>
            <Grid size={{ xs: 12 }} className={classes.header}>
              <Grid container spacing={1} className={classes.header}>
                <Grid size={{ xs: 12, sm: 9 }}>
                  <Formik
                    initialValues={FilterField.stuInit}
                    onSubmit={handleSubmit}
                  >
                    <Form>
                      <Grid
                        container
                        spacing={1}
                        className={classes.multiSelect}
                      >
                        <Grid size={{ xs: 12, sm: 3 }}>
                          <FastField
                            id="district"
                            name="district"
                            component={OptionSelect}
                            option={FilterField.distOption}
                            placeholder="District"
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 3 }}>
                          <FastField
                            id="grade"
                            name="grade"
                            component={OptionSelect}
                            option={FilterField.gradOption}
                            placeholder="Grade"
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 3 }}>
                          <FastField
                            id="subject"
                            name="subject"
                            component={OptionSelect}
                            option={FilterField.subjOption}
                            placeholder="Subject"
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 2 }}>
                          <Button
                            className={classes.button}
                            color="secondary"
                            type="submit"
                            variant="contained"
                          >
                            Find
                          </Button>
                        </Grid>
                      </Grid>
                    </Form>
                  </Formik>
                </Grid>
              </Grid>
              <Divider />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <ScrollData />
            </Grid>
          </Grid>
        </Container>
      </Container>
    );
  }
};
const StudentDirectory = connect(
  selectStudentDirectoryState,
  studentDirectoryActions,
)(StudentDirectoryStudentRegs);
/* TeacherDirectory */
const selectTeacherDirectoryState = (state) => {
  return {
    teacherRegs: state.teacherRegs,
    auth: state.auth,
    profiles: state.profiles,
    awaiting: state.awaiting,
  };
};
const teacherDirectoryActions = (dispatch) => ({
  fetchTeacherReg: () => dispatch(fetchTeacherReg()),
  studentAwait: (connecting) => dispatch(studentAwait(connecting)),
  fetchStudentAwait: () => dispatch(fetchStudentAwait()),
});
const useTeacherDirectoryStyles = createStyles((theme) => ({
  text: {
    fontWeight: "bold",
    fontSize: "30px",
    color: theme.palette.primary.dark,
  },
  container: { padding: "20px 0px" },
  header: { paddingBottom: "10px" },
  button: { height: "50px", width: "75px" },
  main: { backgroundColor: "#f5f5f5", padding: 0, minHeight: "100vh" },
  box: {
    width: "100%",
    padding: "20px 0",
    backgroundColor: theme.palette.secondary.light,
  },
  normalText: {
    fontFamily: "Segoe UI",
    fontWeight: "medium",
    fontSize: "1.5rem",
  },
  headerText: {
    fontWeight: "bold",
    fontFamily: "Roboto",
    color: theme.palette.primary.dark,
  },
  card: { maxHeight: "230px", minHeight: "230px" },
  cardcontent: { "&:last-child": { padding: 0 } },
  cardText: {
    fontFamily: "Roboto",
    fontWeight: "medium",
    color: theme.text.title,
  },
  cardTextBody: {
    fontFamily: "Roboto",
    fontWeight: "bold",
    color: theme.text.body,
  },
  cardTop: {
    padding: "0 10px",
    backgroundColor: "#d2e9f3",
    border: "2px solid #aed7e9",
  },
  cardBottom: { padding: "0 10px" },
  regButton: {
    backgroundColor: "#ffc334",
    color: "white",
    "&:hover": { backgroundColor: "#f2a900" },
  },
  headerName: {
    fontFamily: "Roboto",
    color: theme.text.body,
    fontWeight: "bold",
    fontSize: "1.25rem",
  },
}));
const teacherDirectoryFilterProps = (filterVals, teacher) => {
  const dist = filterVals.district.every((e) => {
    return teacher.district.includes(e);
  });
  const grade = filterVals.grade.every((e) => {
    return teacher.grade.includes(e);
  });
  const subject = filterVals.subject.every((e) => {
    return teacher.subject.includes(e);
  });
  const result = dist && grade && subject;
  return result;
};
const teacherDirectoryHandleRegister = (
  register,
  teacherId,
  auth,
  studentId,
) => {
  const connecting = { studentId: studentId, teacherId: teacherId };
  if (!auth) {
    toast.error("You need to login!");
  } else if (!studentId) {
    toast.error("Only student can register");
  } else {
    register(connecting);
    toast.success("Register successfully");
  }
};
const teacherDirectorySwitchWeekdays = (day) => {
  switch (day) {
    case 2:
      return "Monday";
    case 3:
      return "Tuesday";
    case 4:
      return "Wednesday";
    case 5:
      return "Thursday";
    case 6:
      return "Friday";
    case 7:
      return "Saturday";
    case 8:
      return "Sunday";
    default:
      return "";
  }
};
const teacherDirectoryIsInclude = (arr, teaId) => {
  const temp = arr.map((teacher) => teacher.teacherId._id);
  const index = temp.indexOf(teaId);
  if (index === -1) return false;
  else return true;
};
const TeacherDirectoryRenderTeacherCard = ({
  teacher,
  register,
  auth,
  profile,
  awaiting,
}) => {
  const classes = useTeacherDirectoryStyles();
  let subject = teacher.subject.join(", ");
  let grade = teacher.grade.join(", ");
  let district = teacher.district.join(", ");
  let weekly = teacher.weekly.map(teacherDirectorySwitchWeekdays).join(", ");
  let fee = teacher.fee ? teacher.fee.toLocaleString() : "";
  let studentId = "";
  if (profile && profile.studentProfile) {
    studentId = profile.studentProfile._id;
  }
  return (
    <Card className={classes.card}>
      <CardHeader
        className={classes.headerBg}
        avatar={<Avatar alt="avatar" src={avatarUrl + teacher.imgPath} />}
        title={
          <Link
            style={{ textDecoration: "none" }}
            className={classes.headerName}
            to={`/profile/teacher/${teacher._id}`}
          >
            {teacher.name}
          </Link>
        }
        subheader={"Email: " + teacher.email}
        action={
          teacherDirectoryIsInclude(awaiting, teacher._id) ? (
            <Button color="secondary" variant="contained">
              Connecting
            </Button>
          ) : (
            <Button
              className={classes.regButton}
              variant="contained"
              onClick={() =>
                teacherDirectoryHandleRegister(
                  register,
                  teacher._id,
                  auth,
                  studentId,
                )
              }
              disabled={isDemo}
            >
              Register
            </Button>
          )
        }
        slotProps={{ title: { variant: "h6" } }}
      />

      <CardContent className={classes.cardcontent}>
        <Box className={classes.cardTop}>
          <Grid container sx={{ justifyContent: "space-between" }}>
            <Grid size={{ xs: 2 }}>
              <Typography className={classes.cardText} align="left">
                {" "}
                Subject:{" "}
              </Typography>
            </Grid>
            <Grid size={{ xs: 10 }}>
              <Typography className={classes.cardTextBody} noWrap align="right">
                {subject}
              </Typography>
            </Grid>
          </Grid>
          <Grid container sx={{ justifyContent: "space-between" }}>
            <Grid size={{ xs: 2 }}>
              <Typography className={classes.cardText} align="left">
                {" "}
                District:{" "}
              </Typography>
            </Grid>
            <Grid size={{ xs: 10 }}>
              <Typography className={classes.cardTextBody} noWrap align="right">
                {district}
              </Typography>
            </Grid>
          </Grid>
          <Grid container sx={{ justifyContent: "space-between" }}>
            <Grid size={{ xs: 2 }}>
              <Typography className={classes.cardText} align="left">
                {" "}
                Grade:{" "}
              </Typography>
            </Grid>
            <Grid size={{ xs: 10 }}>
              <Typography className={classes.cardTextBody} noWrap align="right">
                {grade}
              </Typography>
            </Grid>
          </Grid>
        </Box>
        <Box className={classes.cardBottom}>
          <Grid container sx={{ justifyContent: "space-between" }}>
            <Typography className={classes.cardText} sx={{ display: "inline" }}>
              Tuition Fee:{" "}
            </Typography>
            <Typography
              className={classes.cardTextBody}
              sx={{ display: "inline" }}
            >
              {fee}
            </Typography>
          </Grid>

          <Grid container sx={{ justifyContent: "space-between" }}>
            <Grid size={{ xs: 4 }}>
              <Typography className={classes.cardText} align="left">
                Available Weekdays:
              </Typography>
            </Grid>
            <Grid size={{ xs: 8 }}>
              <Typography className={classes.cardTextBody} noWrap align="right">
                {weekly}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
};
const TeacherDirectoryTeacherRegs = (props) => {
  const classes = useTeacherDirectoryStyles();
  const ownerId = props.profiles.profiles?.studentProfile?._id;
  useEffect(() => {
    if (ownerId) props.fetchStudentAwait();
  }, [ownerId]);
  const [filterVals, setFilterVals] = useState({
    district: [],
    grade: [],
    subject: [],
  });
  const { fetchTeacherReg, teacherRegs, fetchStudentAwait } = props;
  useEffect(() => {
    window.scrollTo(0, 0);
    async function fetchData() {
      await fetchTeacherReg();
      return await fetchStudentAwait();
    }
    fetchData();
  }, []);
  const { subjectName } = props;
  useEffect(() => {
    if (subjectName != undefined) {
      setFilterVals((prev) => {
        return { ...prev, subject: [subjectName] };
      });
    }
  }, []);
  const [foundTeachers, setFoundTeachers] = useState();
  useEffect(() => {
    const temp = teacherRegs.teacherRegs.filter((teacher) => {
      return teacherDirectoryFilterProps(filterVals, teacher);
    });
    setFoundTeachers(temp);
  }, [teacherRegs, filterVals]);
  const handleSubmit = (values) => {
    var filterName = {};
    filterName.district = values.district.map((district) => district.name);
    filterName.grade = values.grade.map((grade) => grade.name);
    filterName.subject = values.subject.map((subject) => subject.name);
    setFilterVals(filterName);
  };
  const ScrollData = () => {
    const [tempArr, setTempArr] = useState(
      foundTeachers.slice(5, foundTeachers.length),
    );
    const [tempDataLength, setTempDataLength] = useState(
      foundTeachers.slice(0, 5),
    );
    const fetchData = () => {
      const moreFive = tempArr.slice(0, 5);
      setTempDataLength((prev) => [...prev, ...moreFive]);
      setTempArr(tempArr.slice(5, tempArr.length));
    };
    const checkLeft = () => {
      if (tempDataLength.length < foundTeachers.length) {
        return true;
      } else return false;
    };
    return (
      <InfiniteScroll
        dataLength={tempDataLength.length}
        next={fetchData}
        hasMore={checkLeft()}
        loader={<Loading />}
        style={{ overflowX: "hidden", overflowY: "hidden" }}
      >
        <Grid
          container
          direction="row"
          spacing={1}
          sx={{ justifyContent: "center" }}
        >
          {tempDataLength.map((teacher, index) => {
            if (teacher.available) {
              return (
                <Grid size={{ xs: 12, md: 5 }} key={index}>
                  <TeacherDirectoryRenderTeacherCard
                    teacher={teacher}
                    register={props.studentAwait}
                    auth={props.auth}
                    profile={props.profiles.profiles}
                    awaiting={props.awaiting.awaiting}
                  />
                </Grid>
              );
            } else return null;
          })}
        </Grid>
      </InfiniteScroll>
    );
  };
  if (!foundTeachers) {
    return <Loading />;
  } else {
    return (
      <Container maxWidth={false} className={classes.main}>
        <Box className={classes.box}>
          <Typography
            variant="h4"
            align="center"
            className={classes.headerText}
          >
            Current teachers
          </Typography>
          <Typography
            variant="body1"
            align="center"
            className={classes.normalText}
          >
            Current teachers that are available for various type of subjects
          </Typography>
        </Box>
        <Container maxWidth="lg" className={classes.container} id="a22">
          <Grid container spacing={1}>
            <Grid size={{ xs: 12 }} className={classes.header}>
              <Grid container spacing={1} className={classes.header}>
                <Grid size={{ xs: 12, sm: 9 }}>
                  <Formik
                    initialValues={{
                      ...FilterField.teachInit,
                      subject: subjectName ? [{ name: subjectName }] : [],
                    }}
                    onSubmit={handleSubmit}
                  >
                    <Form>
                      <Grid
                        container
                        spacing={1}
                        className={classes.multiSelect}
                      >
                        <Grid size={{ xs: 12, sm: 3 }}>
                          <FastField
                            id="district"
                            name="district"
                            component={OptionSelect}
                            option={FilterField.distOption}
                            placeholder="District"
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 3 }}>
                          <FastField
                            id="grade"
                            name="grade"
                            component={OptionSelect}
                            option={FilterField.gradOption}
                            placeholder="Grade"
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 3 }}>
                          <FastField
                            id="subject"
                            name="subject"
                            component={OptionSelect}
                            option={FilterField.subjOption}
                            placeholder="Subject"
                            preVal={props.subjectName}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 2 }}>
                          <Button
                            className={classes.button}
                            color="secondary"
                            type="submit"
                            variant="contained"
                          >
                            Find
                          </Button>
                        </Grid>
                      </Grid>
                    </Form>
                  </Formik>
                </Grid>
              </Grid>
              <Divider />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <ScrollData />
            </Grid>
          </Grid>
        </Container>
      </Container>
    );
  }
};
const TeacherDirectory = connect(
  selectTeacherDirectoryState,
  teacherDirectoryActions,
)(TeacherDirectoryTeacherRegs);
/* Connections for both roles */
const useConnectionListStyles = createStyles((theme) => ({
  root: { flexGrow: 1 },
  paper: {
    padding: theme.spacing(2),
    margin: "auto",
    maxWidth: "80%",
    backgroundColor: "#d2e9f3",
    border: "2px solid #7db0c5",
  },
  image: { width: 128, height: 128 },
  img: {
    margin: "auto",
    display: "block",
    maxWidth: "100%",
    maxHeight: "100%",
  },
  media: { height: 140 },
  paperStyle: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    width: "100%",
    height: "100vh",
    backgroundImage: `url(${courseHeaderUrl})`,
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
  },
  headerText: { fontWeight: "bold", fontFamily: "Roboto" },
  normalText: { fontFamily: "Segoe UI", fontWeight: "medium" },
  box: {
    width: "100%",
    padding: "20px 0",
    backgroundColor: theme.palette.secondary.light,
  },
  main: { backgroundColor: "#f5f5f5", padding: 0, minHeight: "100vh" },
  container: { padding: "20px 0px" },
  buttonRemove: {
    backgroundColor: "#ffc334",
    color: "white",
    "&:hover": { backgroundColor: "#f2a900" },
  },
}));
const ConnectionCard = ({ profile, remove, otherRole }) => {
  const classes = useConnectionListStyles();
  let subject = profile.subject ? profile.subject.join(", ") : "";
  const handleClick = () => {
    const obj = { [otherRole + "Id"]: profile._id };
    return remove(obj);
  };
  return (
    <div className={classes.root}>
      <Paper className={classes.paper} md={12}>
        <Grid container spacing={2} sx={{ justifyContent: "center" }}>
          <Grid size={{ sm: 2 }}>
            <div className={classes.image}>
              <img
                className={classes.img}
                alt="Teacher"
                src={avatarUrl + profile.imgPath}
              />
            </div>
          </Grid>
          <Grid size={{ sm: 8 }}>
            <Grid container direction="column" spacing={2} size={{ sm: true }}>
              <Grid size={{ sm: true }}>
                <Typography gutterBottom variant="h6">
                  {profile.name}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  {subject}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {profile.description}
                </Typography>
              </Grid>
              <Grid>
                <Link to={`/profile/${otherRole}/${profile._id}`}>
                  <Button variant="contained" color="primary">
                    More Information
                  </Button>
                </Link>
              </Grid>
            </Grid>
          </Grid>
          <Grid size={{ sm: 2 }}>
            <Button
              variant="contained"
              className={classes.buttonRemove}
              onClick={handleClick}
            >
              Disconnect
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </div>
  );
};
function ConnectionsPage({ role }) {
  const classes = useConnectionListStyles();
  const dispatch = useDispatch();
  const awaiting = useSelector((state) => state.awaiting);
  const ownerId = useSelector(
    (state) => state.profiles.profiles?.[role + "Profile"]?._id,
  );
  const otherRole = role === "student" ? "teacher" : "student";
  const load = role === "student" ? fetchStudentAwait : fetchTeacherAwait;
  const remove = role === "student" ? removeStudentAwait : removeTeacherAwait;
  useEffect(() => {
    if (ownerId) dispatch(load());
  }, [dispatch, ownerId, load]);
  if (awaiting.isLoading) {
    return <Loading />;
  } else {
    return (
      <Container maxWidth={false} className={classes.main}>
        <Box className={classes.box}>
          <Typography
            variant="h4"
            align="center"
            className={classes.normalText}
          >
            Your list of registed {otherRole}s
          </Typography>
        </Box>

        <Container maxWidth="lg" className={classes.container}>
          <Grid container spacing={1} sx={{ justifyContent: "center" }}>
            <Grid size={{ xs: 12 }}>
              <Grid>
                <Link to={`/profile/${role}`}>
                  <Button variant="contained" color="primary">
                    Back to your Profile <SubdirectoryArrowLeftIcon />
                  </Button>
                </Link>
              </Grid>
              <Divider style={{ margin: "10px 0px 0px" }} />
            </Grid>
          </Grid>
          <Grid container spacing={2} sx={{ justifyContent: "center" }}>
            {(() => {
              const list = awaiting.awaiting;
              return list.map((teacher) => {
                if (teacher) {
                  return (
                    <Grid size={{ xs: 12 }} key={teacher._id}>
                      <ConnectionCard
                        profile={teacher[otherRole + "Id"]}
                        otherRole={otherRole}
                        remove={(body) => dispatch(remove(body))}
                      />
                    </Grid>
                  );
                } else return <Loading />;
              });
            })()}
          </Grid>
        </Container>
      </Container>
    );
  }
}
function StudentConnections() {
  return <ConnectionsPage role="student" />;
}
function TeacherConnections() {
  return <ConnectionsPage role="teacher" />;
}
/* StudentProfile */
const selectStudentProfileState = (state) => {
  return { profiles: state.profiles };
};
const studentProfileActions = (dispatch) => ({
  fetchProfile: () => dispatch(fetchProfile()),
});
const useStudentProfileStyles = createStyles((theme) => ({
  main: { backgroundColor: "#f5f5f5", minHeight: "100vh" },
  container: { padding: "20px 0px" },
  root: { flexGrow: 1, padding: "20px 100px" },
  profileImg: { height: "300px", width: "300px" },
  paperStyle: { padding: 20, height: "50vh", width: 280, margin: "20px auto" },
  modal: { display: "flex", alignItems: "center", justifyContent: "center" },
  normalText: {
    fontFamily: "Segoe UI",
    fontWeight: "medium",
    fontSize: "1.5rem",
  },
  headerText: { fontWeight: "bold", fontFamily: "Roboto" },
}));
const StudentProfileRenderUI = (props) => {
  const classes = useStudentProfileStyles();
  const [modalIntro, setModalIntro] = React.useState(false);
  const [modalDetail, setModalDetail] = React.useState(false);
  const { studentProfile } = props.profile;
  const grade = studentProfile.grade ? studentProfile.grade.join(", ") : "";
  const subject = studentProfile.subject
    ? studentProfile.subject.join(", ")
    : "";
  const district = studentProfile.district
    ? studentProfile.district.join(", ")
    : "";
  var fee = studentProfile.fee ? studentProfile.fee.toLocaleString() : 0;
  return (
    <Container maxWidth={false} className={classes.main}>
      <Container maxWidth="lg" className={classes.container}>
        <Grid container direction="row" spacing={2}>
          <Grid size={{ md: 12, lg: 3 }}>
            <Avatar
              className={classes.profileImg}
              src={avatarUrl + studentProfile.imgPath}
              alt="Student Avatar"
            />
          </Grid>

          <Grid size={{ md: 12, lg: 8 }}>
            <Typography variant="h2" className={classes.headerText}>
              {studentProfile.name}
            </Typography>
            <Typography variant="h6" className={classes.normalText}>
              <MailIcon /> Email : {studentProfile.email}
            </Typography>
            <Typography variant="h6" className={classes.normalText}>
              <PhoneIcon /> Phone : {studentProfile.telnum}
            </Typography>

            <Divider />

            <Typography variant="h5" className={classes.normalText}>
              Description: {studentProfile.description}
            </Typography>
          </Grid>

          <Box
            component={Grid}
            sx={{ display: { md: "none", lg: "block" } }}
            size={{ lg: 1, md: 12 }}
          >
            <Button
              onClick={() => setModalIntro(true)}
              aria-label="Edit introduction"
            >
              <EditIcon />
            </Button>
          </Box>
          <Grid size={{ md: 12 }}>
            <Divider />
          </Grid>
        </Grid>

        <Grid container direction="row" spacing={2}>
          <Grid size={{ md: 6 }}>
            <Typography
              variant="h4"
              className={classes.headerText}
              color="secondary"
            >
              Class required information
            </Typography>
            <Typography variant="body1" className={classes.normalText}>
              <b>Grade: </b>
              {grade}
            </Typography>
            <Typography variant="body1" className={classes.normalText}>
              <b>Subject: </b>
              {subject}
            </Typography>
            <Typography variant="body1" className={classes.normalText}>
              <b>District: </b>
              {district}
            </Typography>
            <Typography variant="body1" className={classes.normalText}>
              <b>Tuition Fee: </b>
              {fee}
            </Typography>
            <Typography variant="body1" className={classes.normalText}>
              <b>Address: </b>
              {studentProfile.address}
            </Typography>
          </Grid>
          <Grid size={{ md: 4 }}>
            <Typography
              variant="h4"
              className={classes.headerText}
              color="secondary"
            >
              Finding teacher:
            </Typography>
            <RadioGroup
              row
              aria-label="position"
              name="available"
              defaultValue="top"
              defaultChecked={studentProfile.available}
            >
              <FormControlLabel
                value="true"
                control={
                  <Radio
                    name="available"
                    checked={studentProfile.available === true}
                  />
                }
                label="Yes"
                labelPlacement="top"
              />

              <FormControlLabel
                value="false"
                control={
                  <Radio
                    name="available"
                    checked={studentProfile.available === false}
                  />
                }
                label="No"
                labelPlacement="top"
              />
            </RadioGroup>
            <Link to={`/awaiting`}>
              <Button variant="contained" color="primary">
                View teachers you registered! <SubdirectoryArrowLeftIcon />{" "}
              </Button>
            </Link>
          </Grid>
          <Box
            component={Grid}
            sx={{ display: { md: "none", lg: "block" } }}
            size={{ md: 2 }}
          >
            <Button
              onClick={() => setModalDetail(true)}
              aria-label="Edit requirements"
            >
              <EditIcon />
            </Button>
          </Box>
          <Grid size={{ md: 12 }}>
            <Divider />
          </Grid>
        </Grid>

        <Modal
          className={classes.modal}
          open={modalIntro}
          onClose={() => setModalIntro(false)}
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
        >
          <StudentIntroEditor
            closeModal={() => setModalIntro(false)}
            {...studentProfile}
          />
        </Modal>

        <Modal
          className={classes.modal}
          open={modalDetail}
          onClose={() => setModalDetail(false)}
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
        >
          <StudentDetailEditor
            closeModal={() => setModalDetail(false)}
            {...studentProfile}
          />
        </Modal>
      </Container>
    </Container>
  );
};
const StudentProfileStudentInfo = (props) => {
  const { profiles } = props;
  if (!profiles.profiles || profiles.isLoading) {
    return (
      <div className="container">
        <div className="row">
          <Loading />
        </div>
      </div>
    );
  } else {
    return <StudentProfileRenderUI profile={profiles.profiles} />;
  }
};
const StudentProfile = connect(
  selectStudentProfileState,
  studentProfileActions,
)(StudentProfileStudentInfo);
/* TeacherProfile */
const selectTeacherProfileState = (state) => {
  return { profiles: state.profiles, comments: state.comments };
};
const teacherProfileActions = (dispatch) => ({
  fetchProfile: () => dispatch(fetchProfile()),
  fetchComments: () => dispatch(fetchComments()),
});
const useTeacherProfileStyles = createStyles((theme) => ({
  main: { backgroundColor: "#f5f5f5", minHeight: "100vh" },
  container: { padding: "20px 0px" },
  root: { flexGrow: 1, padding: "20px 100px" },
  profileImg: { height: "300px", width: "300px" },
  paperStyle: { padding: 20, height: "50vh", width: 280, margin: "20px auto" },
  modal: { display: "flex", alignItems: "center", justifyContent: "center" },
  normalText: {
    fontFamily: "Segoe UI",
    fontWeight: "medium",
    fontSize: "1.5rem",
  },
  headerText: { fontWeight: "bold", fontFamily: "Roboto" },
  cmt: { fontFamily: "Segoe UI", fontWeight: "medium" },
  paper: { padding: "2px", maxWidth: "100%", backgroundColor: "#f5f5f5" },
}));
const teacherProfileCheckBoxValues = [
  { label: "Mon", value: 2 },
  { label: "Tue", value: 3 },
  { label: "Wed", value: 4 },
  { label: "Thu", value: 5 },
  { label: "Fri", value: 6 },
  { label: "Sat", value: 7 },
  { label: "Sun", value: 8 },
];
const TeacherProfileRenderCheckBox = (props) => {
  const { value, label, weekly } = props;
  return (
    <FormControlLabel
      control={<Checkbox value={value} checked={weekly.includes(value)} />}
      label={label}
      labelPlacement="top"
    />
  );
};
const TeacherProfileComment = ({ cmt }) => {
  const classes = useTeacherProfileStyles();
  return (
    <Paper className={classes.paper} variant="outlined">
      <Grid container sx={{ alignItems: "center" }}>
        <Grid size={{ sm: 1 }} container sx={{ justifyContent: "center" }}>
          <Avatar alt="avatar" src={avatarUrl + cmt.commenter.imgPath} />
        </Grid>
        <Grid size={{ sm: 10 }} container sx={{ alignItems: "center" }}>
          <Grid>
            <Typography variant="subtitle1" className={classes.headerText}>
              {cmt.commenter.name}
            </Typography>
            <Typography variant="body1" className={classes.cmt}>
              rate: {cmt.rating}/5
            </Typography>
            <Typography variant="body2" className={classes.cmt}>
              {cmt.comment}
            </Typography>
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  );
};
const TeacherProfileRenderUI = (props) => {
  const classes = useTeacherProfileStyles();
  const [modalIntro, setModalIntro] = React.useState(false);
  const [modalDetail, setModalDetail] = React.useState(false);
  const { teacherProfile } = props.profile;
  const grade = teacherProfile.grade ? teacherProfile.grade.join(", ") : "";
  const subject = teacherProfile.subject
    ? teacherProfile.subject.join(", ")
    : "";
  const district = teacherProfile.district
    ? teacherProfile.district.join(", ")
    : "";
  var fee = teacherProfile.fee ? teacherProfile.fee.toLocaleString() : 0;
  return (
    <Container maxWidth={false} className={classes.main}>
      <Container maxWidth="lg" className={classes.container}>
        <Grid container direction="row" spacing={2}>
          <Grid size={{ md: 12, lg: 3 }}>
            <Avatar
              className={classes.profileImg}
              src={avatarUrl + teacherProfile.imgPath}
              alt="Teacher Avatar"
            />
          </Grid>

          <Grid size={{ md: 12, lg: 8 }}>
            <Typography variant="h2" className={classes.headerText}>
              {teacherProfile.name}
            </Typography>
            <StarRating rating={props.rating} />
            <Typography variant="h6" className={classes.normalText}>
              <MailIcon /> Email : {teacherProfile.email}
            </Typography>
            <Typography variant="h6" className={classes.normalText}>
              <PhoneIcon /> Phone : {teacherProfile.telnum}
            </Typography>

            <Divider />

            <Typography variant="h5" className={classes.normalText}>
              Description: {teacherProfile.description}
            </Typography>
          </Grid>

          <Box
            component={Grid}
            sx={{ display: { md: "none", lg: "block" } }}
            size={{ lg: 1, md: 12 }}
          >
            <Button
              onClick={() => setModalIntro(true)}
              aria-label="Edit introduction"
            >
              <EditIcon />
            </Button>
          </Box>
          <Grid size={{ md: 12 }}>
            <Divider />
          </Grid>
        </Grid>

        <Grid container direction="row" spacing={2}>
          <Grid size={{ md: 12, lg: 6 }}>
            <Typography
              variant="h4"
              className={classes.headerText}
              color="secondary"
            >
              Class information
            </Typography>
            <Typography variant="body1" className={classes.normalText}>
              <b>Grade: </b>
              {grade}
            </Typography>
            <Typography variant="body1" className={classes.normalText}>
              <b>Subject: </b>
              {subject}
            </Typography>
            <Typography variant="body1" className={classes.normalText}>
              <b>District: </b> {district}
            </Typography>
            <Typography variant="body1" className={classes.normalText}>
              <b>Tuition Fee: </b> {fee}
            </Typography>
          </Grid>

          <Grid size={{ md: 12, lg: 5 }}>
            <Typography
              variant="h4"
              className={classes.headerText}
              color="secondary"
            >
              Schedule
            </Typography>
            {teacherProfileCheckBoxValues.map((obj, index) => (
              <TeacherProfileRenderCheckBox
                label={obj.label}
                value={obj.value}
                weekly={teacherProfile.weekly}
                key={index}
              />
            ))}
            <Grid size={{ xs: 12 }}>
              <Typography
                variant="h4"
                className={classes.headerText}
                color="secondary"
              >
                Available:{" "}
              </Typography>
              <RadioGroup
                row
                aria-label="position"
                name="available"
                defaultValue="top"
                defaultChecked={teacherProfile.available}
              >
                <FormControlLabel
                  value="true"
                  control={
                    <Radio
                      name="available"
                      checked={teacherProfile.available === true}
                    />
                  }
                  label="Yes"
                  labelPlacement="top"
                />

                <FormControlLabel
                  value="false"
                  control={
                    <Radio
                      name="available"
                      checked={teacherProfile.available === false}
                    />
                  }
                  label="No"
                  labelPlacement="top"
                />
              </RadioGroup>
              <Link to={`/teaAwaiting`}>
                <Button variant="contained" color="primary">
                  View teachers you registered!{" "}
                  <SubdirectoryArrowLeftIcon />{" "}
                </Button>
              </Link>
            </Grid>
          </Grid>
          <Box
            component={Grid}
            sx={{ display: { md: "none", lg: "block" } }}
            size={{ lg: 1, md: 12 }}
          >
            <Button
              onClick={() => setModalDetail(true)}
              aria-label="Edit requirements"
            >
              <EditIcon />
            </Button>
          </Box>
        </Grid>

        <Modal
          className={classes.modal}
          open={modalIntro}
          onClose={() => setModalIntro(false)}
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
        >
          <TeacherIntroEditor
            closeModal={() => setModalIntro(false)}
            {...teacherProfile}
          />
        </Modal>

        <Modal
          className={classes.modal}
          open={modalDetail}
          onClose={() => setModalDetail(false)}
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
        >
          <TeacherDetailEditor
            closeModal={() => setModalDetail(false)}
            {...teacherProfile}
          />
        </Modal>
      </Container>

      <Container maxWidth="lg" className={classes.container}>
        <Grid container spacing={2} sx={{ justifyContent: "center" }}>
          <Grid size={{ xs: 12 }}>
            <Typography
              variant="h4"
              className={classes.headerText}
              color="secondary"
            >
              Comments:
            </Typography>
          </Grid>
        </Grid>

        <Grid container spacing={2} sx={{ justifyContent: "center" }}>
          {(() => {
            if (props.cmt) {
              return props.cmt.map((comment, i) => {
                return (
                  <Grid size={{ xs: 12 }} key={i}>
                    <TeacherProfileComment cmt={comment} />
                  </Grid>
                );
              });
            }
          })()}
        </Grid>
      </Container>
    </Container>
  );
};
const TeacherProfileTeacherInfo = (props) => {
  const { profiles, updateProfile, comments, fetchComments } = props;
  useEffect(() => {
    async function fetchData() {
      return await fetchComments();
    }
    fetchData();
  }, []);
  if (!profiles.profiles || profiles.isLoading) {
    return (
      <div className="container">
        <div className="row">
          <Loading />
        </div>
      </div>
    );
  } else {
    const cmt = comments.comments.filter(
      (comment) => comment.commentTo === profiles.profiles.teacherProfile._id,
    );
    const rate = (
      profiles.profiles.teacherProfile.rate /
      profiles.profiles.teacherProfile.commentCount
    ).toFixed(1);
    return (
      <TeacherProfileRenderUI
        profile={profiles.profiles}
        updateProfile={updateProfile}
        cmt={cmt}
        rating={rate}
      />
    );
  }
};
const TeacherProfile = connect(
  selectTeacherProfileState,
  teacherProfileActions,
)(TeacherProfileTeacherInfo);
/* PublicStudentProfile */

const publicStudentProfileActions = (dispatch) => ({
  fetchTeacherAwait: () => dispatch(fetchTeacherAwait()),
  removeTeacherAwait: (connecting) => dispatch(removeTeacherAwait(connecting)),
  teacherAwait: (connecting) => dispatch(teacherAwait(connecting)),
  fetchStudentReg: () => dispatch(fetchStudentReg()),
});
const usePublicStudentProfileStyles = createStyles((theme) => ({
  main: { backgroundColor: "#f5f5f5", minHeight: "100vh" },
  container: { padding: "20px 0px" },
  root: { flexGrow: 1, padding: "20px 100px" },
  profileImg: { height: "300px", width: "300px" },
  paperStyle: { padding: 20, height: "50vh", width: 280, margin: "20px auto" },
  modal: { display: "flex", alignItems: "center", justifyContent: "center" },
  normalText: {
    fontFamily: "Segoe UI",
    fontWeight: "medium",
    fontSize: "1.5rem",
  },
  headerText: { fontWeight: "bold", fontFamily: "Roboto" },
  regButton: {
    backgroundColor: "#ffc334",
    color: "white",
    "&:hover": { backgroundColor: "#f2a900" },
  },
}));
const publicStudentProfileHandleRegister = (
  register,
  studentId,
  auth,
  teacherId,
) => {
  const connecting = { studentId: studentId, teacherId: teacherId };
  if (!auth) {
    toast.error("You need to login!");
  } else if (!teacherId) {
    toast.error("Only teacher can register");
  } else {
    register(connecting);
    toast.success("Register successfully");
  }
};
const PublicStudentProfileRenderUI = (props) => {
  const classes = usePublicStudentProfileStyles();
  const { stuProfile } = props;
  const handleRemove = () => {
    const obj = { studentId: stuProfile._id };
    return props.remove(obj);
  };
  let teacherId = "";
  if (props.profile && props.profile.teacherProfile) {
    teacherId = props.profile.teacherProfile._id;
  }
  const grade = stuProfile.grade ? stuProfile.grade.join(", ") : "";
  const subject = stuProfile.subject ? stuProfile.subject.join(", ") : "";
  const district = stuProfile.district ? stuProfile.district.join(", ") : "";
  var fee = stuProfile.fee ? stuProfile.fee.toLocaleString() : 0;
  return (
    <Container maxWidth={false} className={classes.main}>
      <Container maxWidth="lg" className={classes.container}>
        <Grid container direction="row" spacing={2}>
          <Grid size={{ md: 12, lg: 3 }}>
            <Avatar
              className={classes.profileImg}
              src={avatarUrl + stuProfile.imgPath}
              alt="Student Avatar"
            />
          </Grid>

          <Grid size={{ md: 10, lg: 8 }}>
            <Typography variant="h3" className={classes.headerText}>
              {stuProfile.name}
            </Typography>
            <Typography variant="h6" className={classes.normalText}>
              <MailIcon /> Email : {stuProfile.email}
            </Typography>
            <Typography variant="h6" className={classes.normalText}>
              <PhoneIcon /> Phone : {stuProfile.telnum}
            </Typography>

            <Divider />

            <Typography variant="h5" className={classes.normalText}>
              Description: {stuProfile.description}
            </Typography>
          </Grid>
          <Grid size={{ md: 2, lg: 1 }}>
            {props.isStudentId ? (
              <Button
                variant="contained"
                onClick={handleRemove}
                className={classes.regButton}
              >
                Disconnect
              </Button>
            ) : (
              <Button
                color="secondary"
                variant="contained"
                onClick={() =>
                  publicStudentProfileHandleRegister(
                    props.register,
                    stuProfile._id,
                    props.auth,
                    teacherId,
                  )
                }
                disabled={isDemo}
              >
                Connect
              </Button>
            )}
          </Grid>

          <Grid size={{ md: 12 }}>
            <Divider />
          </Grid>
        </Grid>

        <Grid container direction="row" spacing={2}>
          <Grid size={{ md: 6 }}>
            <Typography
              variant="h4"
              className={classes.headerText}
              color="secondary"
            >
              Class required information
            </Typography>
            <Typography variant="body1" className={classes.normalText}>
              <b>Grade: </b>
              {grade}
            </Typography>
            <Typography variant="body1" className={classes.normalText}>
              <b>Subject: </b>
              {subject}
            </Typography>
            <Typography variant="body1" className={classes.normalText}>
              <b>District: </b>
              {district}
            </Typography>
            <Typography variant="body1" className={classes.normalText}>
              <b>Tuition Fee: </b>
              {fee}
            </Typography>
            <Typography variant="body1" className={classes.normalText}>
              <b>Address: </b>
              {stuProfile.address}{" "}
              <Link
                to={`/addresses/${encodeURIComponent(stuProfile.address || "")}`}
              >
                Find!
              </Link>
            </Typography>
          </Grid>
          <Grid size={{ md: 4 }}>
            <Typography
              variant="h4"
              className={classes.headerText}
              color="secondary"
            >
              Finding teacher:
            </Typography>
            <RadioGroup
              row
              aria-label="position"
              name="available"
              defaultValue="top"
              defaultChecked={stuProfile.available}
            >
              <FormControlLabel
                value="true"
                control={
                  <Radio
                    name="available"
                    checked={stuProfile.available === true}
                  />
                }
                label="Yes"
                labelPlacement="top"
              />

              <FormControlLabel
                value="false"
                control={
                  <Radio
                    name="available"
                    checked={stuProfile.available === false}
                  />
                }
                label="No"
                labelPlacement="top"
              />
            </RadioGroup>
          </Grid>
        </Grid>
      </Container>
    </Container>
  );
};
const PublicStudentProfileViewStudentInfo = (props) => {
  const { studentRegs, profileId, fetchStudentReg, profiles, awaiting } = props;
  const ownerId = profiles.profiles?.teacherProfile?._id;
  useEffect(() => {
    if (ownerId) props.fetchTeacherAwait();
  }, [ownerId]);
  useEffect(() => {
    async function fetchData() {
      return await fetchStudentReg();
    }
    fetchData();
  }, []);
  if (studentRegs.isLoading) {
    return <Loading />;
  } else {
    const stuProfile = studentRegs.studentRegs.filter(
      (student) => student._id === profileId,
    )[0];
    if (!stuProfile) return <p role="alert">Student profile not found.</p>;
    const awaitObj = awaiting.awaiting.find(
      (entry) =>
        (entry.studentId?._id || entry.studentId) === stuProfile._id &&
        (entry.teacherId?._id || entry.teacherId) ===
          profiles.profiles?.teacherProfile?._id,
    );
    const isStudentId = awaitObj ? true : false;
    return (
      <PublicStudentProfileRenderUI
        stuProfile={stuProfile}
        remove={props.removeTeacherAwait}
        isStudentId={isStudentId}
        register={props.teacherAwait}
        auth={props.auth.isAuthenticated}
        profile={props.profiles.profiles}
      />
    );
  }
};
const PublicStudentProfile = connect(
  selectStudentDirectoryState,
  publicStudentProfileActions,
)(PublicStudentProfileViewStudentInfo);
/* PublicTeacherProfile */
const selectPublicTeacherProfileState = (state) => {
  return {
    teacherRegs: state.teacherRegs,
    auth: state.auth,
    profiles: state.profiles,
    awaiting: state.awaiting,
    comments: state.comments,
  };
};
const publicTeacherProfileActions = (dispatch) => ({
  fetchStudentAwait: () => dispatch(fetchStudentAwait()),
  removeStudentAwait: (connecting) => dispatch(removeStudentAwait(connecting)),
  studentAwait: (connecting) => dispatch(studentAwait(connecting)),
  fetchTeacherReg: () => dispatch(fetchTeacherReg()),
  postComment: (commentTo, rating, comment) =>
    dispatch(postComment(commentTo, rating, comment)),
  fetchComments: () => dispatch(fetchComments()),
});
const usePublicTeacherProfileStyles = createStyles((theme) => ({
  main: { backgroundColor: "#f5f5f5", minHeight: "100vh" },
  container: { padding: "20px 0px" },
  root: { flexGrow: 1 },
  profileImg: { height: "300px", width: "300px" },
  paperStyle: { padding: 20, height: "50vh", width: 280, margin: "20px auto" },
  modal: { display: "flex", alignItems: "center", justifyContent: "center" },
  normalText: {
    fontFamily: "Segoe UI",
    fontWeight: "medium",
    fontSize: "1.5rem",
  },
  headerText: { fontWeight: "bold", fontFamily: "Roboto" },
  cmt: { fontFamily: "Segoe UI", fontWeight: "medium" },
  paper: { padding: "2px", maxWidth: "100%", backgroundColor: "#f5f5f5" },
  star: { width: "25px", height: "25px" },
  regButton: {
    backgroundColor: "#ffc334",
    color: "white",
    "&:hover": { backgroundColor: "#f2a900" },
  },
}));
const PublicTeacherProfileRenderCheckBox = (props) => {
  const { value, label, weekly } = props;
  return (
    <FormControlLabel
      control={<Checkbox value={value} checked={weekly.includes(value)} />}
      label={label}
      labelPlacement="top"
    />
  );
};
const publicTeacherProfileHandleRegister = (
  register,
  teacherId,
  auth,
  studentId,
) => {
  const connecting = { studentId: studentId, teacherId: teacherId };
  if (!auth) {
    toast.error("You need to login!");
  } else if (!studentId) {
    toast.error("Only student can register");
  } else {
    register(connecting);
    toast.success("Register successfully");
  }
};
const PublicTeacherProfileComment = ({ cmt }) => {
  const classes = usePublicTeacherProfileStyles();
  return (
    <div className={classes.root}>
      <Paper className={classes.paper} variant="outlined">
        <Grid container sx={{ alignItems: "center" }}>
          <Grid size={{ sm: 1 }} container sx={{ justifyContent: "center" }}>
            <Avatar alt="avatar" src={avatarUrl + cmt.commenter.imgPath} />
          </Grid>
          <Grid size={{ sm: 10 }} container sx={{ alignItems: "center" }}>
            <Grid>
              <Typography variant="subtitle1" className={classes.headerText}>
                {cmt.commenter.name}
              </Typography>
              <Typography variant="body1" className={classes.cmt}>
                rate: {cmt.rating}/5
              </Typography>
              <Typography variant="body2" className={classes.cmt}>
                {cmt.comment}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </Paper>
    </div>
  );
};
const PublicTeacherProfileRenderUI = (props) => {
  const classes = usePublicTeacherProfileStyles();
  const [commentModal, setCommentModal] = React.useState(false);
  const { teaProfile } = props;
  const handleRemove = () => {
    const obj = { teacherId: teaProfile._id };
    return props.remove(obj);
  };
  let studentId = "";
  if (props.profile && props.profile.studentProfile) {
    studentId = props.profile.studentProfile._id;
  }
  const handleComment = () => {
    if (!props.auth || !studentId) {
      toast.error("Only student account can leave comment");
    } else {
      return setCommentModal(true);
    }
  };
  const grade = teaProfile.grade ? teaProfile.grade.join(", ") : "";
  const subject = teaProfile.subject ? teaProfile.subject.join(", ") : "";
  const district = teaProfile.district ? teaProfile.district.join(", ") : "";
  var fee = teaProfile.fee ? teaProfile.fee.toLocaleString() : 0;
  return (
    <Container maxWidth={false} className={classes.main}>
      <Container maxWidth="lg" className={classes.container}>
        <Grid container direction="row" spacing={2}>
          <Grid size={{ md: 12, lg: 3 }}>
            <Avatar
              className={classes.profileImg}
              src={avatarUrl + teaProfile.imgPath}
              alt="Teacher Avatar"
            />
          </Grid>

          <Grid size={{ md: 10, lg: 8 }}>
            <Typography variant="h3" className={classes.headerText}>
              {teaProfile.name}
            </Typography>
            <StarRating rating={props.rating} />
            <Typography variant="h6" className={classes.normalText}>
              <MailIcon /> Email : {teaProfile.email}
            </Typography>
            <Typography variant="h6" className={classes.normalText}>
              <PhoneIcon /> Phone : {teaProfile.telnum}
            </Typography>

            <Divider />

            <Typography variant="h5" className={classes.normalText}>
              Description: {teaProfile.description}
            </Typography>
          </Grid>
          <Grid size={{ md: 2, lg: 1 }}>
            {props.isTeacherId ? (
              <Button
                variant="contained"
                onClick={handleRemove}
                className={classes.regButton}
              >
                Disconnect
              </Button>
            ) : (
              <Button
                color="secondary"
                variant="contained"
                onClick={() =>
                  publicTeacherProfileHandleRegister(
                    props.register,
                    teaProfile._id,
                    props.auth,
                    studentId,
                  )
                }
                disabled={isDemo}
              >
                Connect
              </Button>
            )}
          </Grid>

          <Grid size={{ md: 12 }}>
            <Divider />
          </Grid>
        </Grid>

        <Grid container direction="row" spacing={2}>
          <Grid size={{ md: 12, lg: 6 }}>
            <Typography
              variant="h4"
              className={classes.headerText}
              color="secondary"
            >
              Class information
            </Typography>
            <Typography variant="body1" className={classes.normalText}>
              <b>Grade: </b>
              {grade}
            </Typography>
            <Typography variant="body1" className={classes.normalText}>
              <b>Subject: </b>
              {subject}
            </Typography>
            <Typography variant="body1" className={classes.normalText}>
              <b>District: </b> {district}
            </Typography>
            <Typography variant="body1" className={classes.normalText}>
              <b>Tuition Fee: </b> {fee}
            </Typography>
          </Grid>

          <Grid size={{ md: 12, lg: 5 }}>
            <Typography
              variant="h4"
              className={classes.headerText}
              color="secondary"
            >
              Schedule
            </Typography>
            {teacherProfileCheckBoxValues.map((obj, index) => (
              <PublicTeacherProfileRenderCheckBox
                label={obj.label}
                value={obj.value}
                weekly={teaProfile.weekly}
                key={index}
              />
            ))}
            <Grid size={{ xs: 12 }}>
              <Typography
                variant="h4"
                className={classes.headerText}
                color="secondary"
              >
                Available:{" "}
              </Typography>
              <RadioGroup
                row
                aria-label="position"
                name="available"
                defaultValue="top"
                defaultChecked={teaProfile.available}
              >
                <FormControlLabel
                  value="true"
                  control={
                    <Radio
                      name="available"
                      checked={teaProfile.available === true}
                    />
                  }
                  label="Yes"
                  labelPlacement="top"
                />

                <FormControlLabel
                  value="false"
                  control={
                    <Radio
                      name="available"
                      checked={teaProfile.available === false}
                    />
                  }
                  label="No"
                  labelPlacement="top"
                />
              </RadioGroup>
            </Grid>
          </Grid>
          <Grid size={{ md: 12 }}>
            <Divider />
          </Grid>
        </Grid>

        <Modal
          className={classes.modal}
          open={commentModal}
          onClose={() => setCommentModal(false)}
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
        >
          <ReviewForm
            closeModal={() => setCommentModal(false)}
            postComment={props.postComment}
            id={teaProfile._id}
          />
        </Modal>
      </Container>

      <Container maxWidth="lg" className={classes.container}>
        <Grid container spacing={2} sx={{ justifyContent: "center" }}>
          <Grid size={{ xs: 10 }}>
            <Typography
              variant="h4"
              className={classes.headerText}
              color="secondary"
            >
              Comments:
            </Typography>
          </Grid>
          <Grid size={{ xs: 2 }}>
            <Button
              onClick={handleComment}
              disabled={isDemo}
              color="secondary"
              variant="contained"
            >
              Submit Comment
            </Button>
          </Grid>
        </Grid>

        <Grid container spacing={2} sx={{ justifyContent: "center" }}>
          {(() => {
            if (props.cmt) {
              return props.cmt.map((comment, i) => {
                return (
                  <Grid size={{ xs: 12 }} key={i}>
                    <PublicTeacherProfileComment cmt={comment} />
                  </Grid>
                );
              });
            }
          })()}
        </Grid>
      </Container>
    </Container>
  );
};
const PublicTeacherProfileViewTeacherInfo = (props) => {
  const {
    teacherRegs,
    profileId,
    fetchTeacherReg,
    profiles,
    awaiting,
    comments,
    postComment,
    fetchComments,
  } = props;
  const ownerId = profiles.profiles?.studentProfile?._id;
  useEffect(() => {
    if (ownerId) props.fetchStudentAwait();
  }, [ownerId]);
  useEffect(() => {
    async function fetchData() {
      await fetchComments();
      return await fetchTeacherReg();
    }
    fetchData();
  }, []);
  if (teacherRegs.isLoading) {
    return <Loading />;
  } else {
    const teaProfile = teacherRegs.teacherRegs.filter(
      (teacher) => teacher._id === profileId,
    )[0];
    if (!teaProfile) return <p role="alert">Teacher profile not found.</p>;
    const awaitObj = awaiting.awaiting.find(
      (entry) =>
        (entry.teacherId?._id || entry.teacherId) === teaProfile._id &&
        (entry.studentId?._id || entry.studentId) ===
          profiles.profiles?.studentProfile?._id,
    );
    const isTeacherId = awaitObj ? true : false;
    const cmt = comments.comments.filter(
      (comment) => comment.commentTo === teaProfile._id,
    );
    const rate = (teaProfile.rate / teaProfile.commentCount).toFixed(1);
    return (
      <PublicTeacherProfileRenderUI
        teaProfile={teaProfile}
        remove={props.removeStudentAwait}
        isTeacherId={isTeacherId}
        register={props.studentAwait}
        auth={props.auth.isAuthenticated}
        profile={props.profiles.profiles}
        cmt={cmt}
        postComment={postComment}
        rating={rate}
      />
    );
  }
};
const PublicTeacherProfile = connect(
  selectPublicTeacherProfileState,
  publicTeacherProfileActions,
)(PublicTeacherProfileViewTeacherInfo);
export {
  AdminAccountList,
  AdminPage,
  AdminStudentList,
  AdminTeacherList,
  CourseDetailPage,
  CoursesPage,
  HomePage,
  AddressPage,
  PublicStudentProfile,
  PublicTeacherProfile,
  StudentConnections,
  StudentDirectory,
  StudentProfile,
  TeacherConnections,
  TeacherDirectory,
  TeacherProfile,
};
