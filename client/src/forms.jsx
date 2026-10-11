import React, { useState } from "react";
import {
  Grid,
  Paper,
  TextField,
  Button,
  Typography,
  InputLabel,
  Avatar,
  CssBaseline,
  Link,
  Container,
  Box,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stepper,
  Step,
  StepLabel,
  FormLabel,
  Checkbox,
  Rating,
} from "@mui/material";
import {
  createStyles,
  ImageUploader,
  Multiselect,
  OptionSelect,
} from "./components.jsx";
import { Formik, Form, Field, ErrorMessage, useFormikContext } from "formik";
import * as Yup from "yup";
import { connect, useDispatch } from "react-redux";
import {
  postCourse,
  updateCourse,
  postProfile,
  updateProfile,
} from "./store.js";
import { useNavigate, Link as Link2 } from "react-router-dom";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import * as FilterField from "./store.js";
import StarIcon from "@mui/icons-material/Star";
import { toast } from "react-toastify";
/* Shared form fields and modal actions */
const useEditorStyles = createStyles((theme) => ({
  paperStyle: { padding: 20, width: "60%", margin: "20px auto" },
  btn: { marginTop: "15px", backgroundColor: theme.palette.secondary.light },
  inputBar: { marginTop: 0, marginBottom: "10px" },
  label: { fontWeight: "medium", color: theme.palette.primary.dark },
}));
function EditorField({ name, label, classes, rows }) {
  const form = useFormikContext();
  return (
    <>
      <InputLabel className={classes.label} htmlFor={name}>
        {label}
      </InputLabel>
      <TextField
        id={name}
        name={name}
        type="text"
        placeholder={"Input " + label}
        className={classes.inputBar}
        fullWidth
        margin="normal"
        value={form.values[name] ?? ""}
        onChange={form.handleChange}
        onBlur={form.handleBlur}
        error={Boolean(form.touched[name] && form.errors[name])}
        helperText={form.errors[name]}
        {...(rows ? { multiline: true, rows } : {})}
      />
    </>
  );
}
function EditorImage({ name, label }) {
  const form = useFormikContext();
  return (
    <ImageUploader
      withPreview
      buttonText={label}
      onChange={(files) => form.setFieldValue(name, files[0])}
    />
  );
}
function EditorActions({ classes, closeModal }) {
  const { isSubmitting } = useFormikContext();
  return (
    <Grid container direction="row" sx={{ justifyContent: "space-evenly" }}>
      <Grid size={{ md: 4 }}>
        <Button
          className={classes.btn}
          type="submit"
          fullWidth
          disabled={isSubmitting}
        >
          Save
        </Button>
      </Grid>
      <Grid size={{ md: 4 }}>
        <Button className={classes.btn} onClick={closeModal} fullWidth>
          Cancel
        </Button>
      </Grid>
    </Grid>
  );
}

/* Create and edit courses share one editor. */
const courseSchema = Yup.object({
  name: Yup.string().required("This field is required"),
  description: Yup.string().required("This field is required"),
});
function CourseEditor({ course, closeModal }) {
  const classes = useEditorStyles();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const initialValues = {
    name: course?.name || "",
    description: course?.description || "",
    courseImg: "",
  };
  const save = async (values) => {
    const saved = await dispatch(
      course
        ? updateCourse({ ...values, prevName: course.name })
        : postCourse(values),
    );
    if (!saved) return;
    if (course) navigate("/courseDetail/" + encodeURIComponent(values.name));
    closeModal();
  };
  return (
    <Paper elevation={10} className={classes.paperStyle}>
      <Formik
        initialValues={initialValues}
        validationSchema={courseSchema}
        onSubmit={save}
      >
        <Form>
          <Typography variant="h5" color="primary">
            {course ? "Edit Course Information" : "Post Course Information"}
          </Typography>
          <Grid container direction="row" spacing={3}>
            <Grid size={{ sm: 12, md: 3 }}>
              <EditorImage name="courseImg" label="Change course picture" />
            </Grid>
            <Grid size={{ sm: 12, md: 8 }}>
              <Grid container direction="column">
                <Grid>
                  <EditorField
                    name="name"
                    label="Full name"
                    classes={classes}
                  />
                </Grid>
                <Grid>
                  <EditorField
                    name="description"
                    label="Description"
                    rows={7}
                    classes={classes}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <EditorActions classes={classes} closeModal={closeModal} />
        </Form>
      </Formik>
    </Paper>
  );
}
const CreateCourseForm = CourseEditor;
const EditCourseForm = CourseEditor;

/* Teacher and student introductions share fields and save behavior. */
const introSchema = (role) =>
  Yup.object({
    name: Yup.string()
      .required("This field is required")
      .max(36, "Maximum characters are 36"),
    email: Yup.string()
      .required("This field is required")
      .email("The email is invalid"),
    telnum: Yup.number()
      .typeError("you must specify a number")
      .positive("The number must be positive"),
    ...(role === "student"
      ? { description: Yup.string().max(115, "Maximum characters are 115") }
      : {}),
  });
function ProfileIntroEditor({
  role,
  name,
  email,
  telnum,
  description,
  closeModal,
}) {
  const classes = useEditorStyles();
  const dispatch = useDispatch();
  const save = async (values) => {
    if (await dispatch(updateProfile(values))) closeModal();
  };
  return (
    <Paper elevation={10} className={classes.paperStyle}>
      <Formik
        initialValues={{ name, email, telnum, description, avatar: "" }}
        validationSchema={introSchema(role)}
        onSubmit={save}
      >
        <Form>
          <Typography variant="h5" color="primary">
            Edit introduction
          </Typography>
          <Grid container direction="row" spacing={3}>
            <Grid size={{ sm: 12, md: 3 }}>
              <EditorImage name="avatar" label="Change profile picture" />
            </Grid>
            <Grid size={{ sm: 12, md: 8 }}>
              <Grid container direction="column">
                {[
                  ["name", "Full name"],
                  ["email", "Email"],
                  ["telnum", "Phone Number"],
                  ["description", "Description"],
                ].map(([field, label]) => (
                  <Grid key={field}>
                    <EditorField
                      name={field}
                      label={label}
                      classes={classes}
                      rows={
                        field === "description"
                          ? role === "student"
                            ? 3
                            : 5
                          : undefined
                      }
                    />
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
          <EditorActions classes={classes} closeModal={closeModal} />
        </Form>
      </Formik>
    </Paper>
  );
}
function StudentIntroEditor(props) {
  return <ProfileIntroEditor {...props} role="student" />;
}
function TeacherIntroEditor(props) {
  return <ProfileIntroEditor {...props} role="teacher" />;
}

/* SignIn */
const useSignInStyles = createStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "white",
    padding: "15px",
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: "100%",
    // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: { margin: theme.spacing(3, 0, 2) },
}));
const signInInitialValues = { username: "", password: "" };
const signInHandleSubmit = async (values, actions, setOpenModal, loginUser) => {
  const response = await loginUser(values);
  if (response) setOpenModal(false);
};
const signInTextField = ({ field, form, type }) => {
  const { name } = field;
  return (
    <>
      <TextField
        variant="outlined"
        margin="normal"
        required
        fullWidth
        id={name}
        label={name}
        name={name}
        type={type}
        autoComplete={type}
        onChange={(e) => form.setFieldValue(name, e.target.value)}
      />

      <ErrorMessage name={name} />
    </>
  );
};
function SignIn(props) {
  const classes = useSignInStyles();
  // const history = useNavigate();

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>

        <Formik
          initialValues={signInInitialValues}
          onSubmit={(value, action) =>
            signInHandleSubmit(
              value,
              action,
              props.setOpenModal,
              props.loginUser,
            )
          }
        >
          <Form noValidate>
            <Field
              component={signInTextField}
              name="username"
              type="text"
            ></Field>

            <Field
              component={signInTextField}
              name="password"
              type="password"
            ></Field>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
            >
              Sign In
            </Button>

            <Grid container>
              <Grid>
                <Link
                  variant="body2"
                  onClick={() => {
                    props.switchModal();
                  }}
                >
                  {"Don't have an account? Sign Up"}
                </Link>
              </Grid>
            </Grid>
          </Form>
        </Formik>
      </div>
    </Container>
  );
}
/* SignUp */
function SignUpCopyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {"Copyright © "}
      <Link color="inherit" href="https://material-ui.com/">
        Your Website
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}
const useSignUpStyles = createStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "white",
    padding: "15px",
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: "100%",
    // Fix IE 11 issue.
    marginTop: theme.spacing(3),
  },
  submit: { margin: theme.spacing(3, 0, 2) },
}));
const signUpInitialValues = { username: "", password: "" };
const signUpHandleSubmit = async (values, actions, setModalSU, signUp) => {
  const response = await signUp(values);
  if (response) setModalSU(false);
};
const signUpTextField = ({ field, form, type }) => {
  const { name } = field;
  return (
    <>
      <TextField
        variant="outlined"
        margin="normal"
        required
        fullWidth
        id={name}
        label={name}
        name={name}
        type={type}
        autoComplete={type}
        autoFocus
        onChange={(e) => form.setFieldValue(name, e.target.value)}
      />

      <ErrorMessage name={name} />
    </>
  );
};
function SignUp(props) {
  const classes = useSignUpStyles();
  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign up
        </Typography>
        <Formik
          initialValues={signUpInitialValues}
          onSubmit={(value, action) =>
            signUpHandleSubmit(value, action, props.setModalSU, props.signUp)
          }
        >
          <Form noValidate>
            <Field
              component={signUpTextField}
              name="username"
              type="text"
            ></Field>

            <Field
              component={signUpTextField}
              name="password"
              type="password"
            ></Field>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
            >
              Sign Up
            </Button>
            <Grid container sx={{ justifyContent: "flex-end" }}>
              <Grid>
                <Link
                  href="#"
                  variant="body2"
                  onClick={() => {
                    props.switchModal();
                  }}
                >
                  Already have an account? Sign in
                </Link>
              </Grid>
            </Grid>
          </Form>
        </Formik>
      </div>
      <Box sx={{ mt: 5 }}>
        <SignUpCopyright />
      </Box>
    </Container>
  );
}
/* InformationStep */
const useInformationStepStyles = createStyles(() => ({
  form: { padding: "20px" },
}));
function InformationStep(props) {
  const classes = useInformationStepStyles();
  const { name, email, handleBack, handleNext } = props;
  const validationSchema = Yup.object({
    name: Yup.string().required("This field is required"),
    email: Yup.string()
      .email("Email wrong syntax")
      .required("This field is required"),
  });
  return (
    <React.Fragment>
      <Typography variant="h6" gutterBottom>
        Information
      </Typography>
      <Grid container spacing={3}>
        <Formik
          initialValues={{ name, email }}
          validationSchema={validationSchema}
        >
          {({ validateForm, setTouched, values, setFieldValue }) => (
            <>
              <FormControl component="fieldset" fullWidth>
                <Form>
                  <Grid container spacing={3} className={classes.form}>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        required
                        id="name"
                        name="name"
                        label="Full name"
                        fullWidth
                        autoComplete="cc-csc"
                        onChange={(e) => {
                          setFieldValue("name", e.target.value);
                        }}
                      />

                      <ErrorMessage name="name" />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        required
                        id="email"
                        name="email"
                        label="Email"
                        fullWidth
                        autoComplete="cc-csc"
                        onChange={(e) => {
                          setFieldValue("email", e.target.value);
                        }}
                      />

                      <ErrorMessage name="email" />
                    </Grid>
                  </Grid>
                </Form>
              </FormControl>
              <Grid container sx={{ justifyContent: "flex-end" }}>
                <Grid>
                  <Button
                    onClick={() => {
                      handleBack(values);
                    }}
                  >
                    {" "}
                    Back{" "}
                  </Button>
                </Grid>
                <Grid>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() =>
                      validateForm().then((errors) => {
                        if (
                          Object.entries(errors).length === 0 &&
                          errors.constructor === Object
                        ) {
                          handleNext(values);
                        } else {
                          setTouched(errors);
                        }
                      })
                    }
                  >
                    Next
                  </Button>
                </Grid>
              </Grid>
            </>
          )}
        </Formik>
      </Grid>
    </React.Fragment>
  );
}
/* ReviewStep */
const reviewStepActions = (dispatch) => ({
  postProfile: (props) => dispatch(postProfile(props)),
});
const useReviewStepStyles = createStyles((theme) => ({
  normalText: {
    fontFamily: "Segoe UI",
    fontWeight: "medium",
    fontSize: "1.5rem",
  },
  headerText: {
    fontWeight: "bold",
    fontFamily: "Roboto",
    color: theme.palette.primary.main,
  },
}));
const ReviewStepReview = (props) => {
  const classes = useReviewStepStyles();
  const { postProfile } = props;
  const { review, handleBack, setActiveStep, activeStep } = props;
  const { role, name, email } = review;
  return (
    <React.Fragment>
      <Typography variant="h5" gutterBottom className={classes.headerText}>
        Confirmation
      </Typography>
      <Grid container>
        <Grid size={{ xs: 12 }}>
          <Typography gutterBottom variant="h6" className={classes.normalText}>
            <b>You are: </b>
            {role === "isTeacher" ? "Teacher" : "Student"}{" "}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Typography gutterBottom variant="h6" className={classes.normalText}>
            <b>Full name: </b>
            {name}{" "}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Typography gutterBottom variant="h6" className={classes.normalText}>
            <b>Email: </b>
            {email}{" "}
          </Typography>
        </Grid>
      </Grid>
      <Grid container sx={{ justifyContent: "flex-end" }}>
        <Grid>
          <Button
            onClick={() => {
              handleBack();
            }}
          >
            {" "}
            Back{" "}
          </Button>
        </Grid>
        <Grid>
          <Button
            variant="contained"
            color="primary"
            onClick={async () => {
              const saved = await postProfile({ name, email, role });
              if (saved) setActiveStep(activeStep + 1);
            }}
          >
            Save
          </Button>
        </Grid>
      </Grid>
    </React.Fragment>
  );
};
const ReviewStep = connect(null, reviewStepActions)(ReviewStepReview);
/* RoleStep */
function RoleStep(props) {
  const { role, handleNext } = props;
  const validationSchema = Yup.object({
    role: Yup.string().required("This field is required"),
  });
  return (
    <React.Fragment>
      <Typography variant="h6" gutterBottom>
        You are:
      </Typography>
      <Grid container spacing={3}>
        <Formik initialValues={{ role }} validationSchema={validationSchema}>
          {({
            submitForm,
            validateForm,
            setTouched,
            isSubmitting,
            values,
            setFieldValue,
            isValid,
            isInitialValid,
          }) => {
            isInitialValid = false;
            return (
              <>
                <FormControl component="fieldset" fullWidth>
                  <Form>
                    <RadioGroup
                      row
                      aria-label="position"
                      name="role"
                      defaultValue="top"
                      onChange={(e) => {
                        setFieldValue("role", e.target.value);
                        validateForm();
                      }}
                    >
                      <Grid container sx={{ justifyContent: "space-evenly" }}>
                        <Grid>
                          <FormControlLabel
                            value="isStudent"
                            control={<Radio color="primary" />}
                            label="Student"
                          />
                        </Grid>
                        <Grid>
                          <FormControlLabel
                            value="isTeacher"
                            control={<Radio color="primary" />}
                            label="Teacher"
                          />
                        </Grid>
                      </Grid>
                      <ErrorMessage name="role" />
                    </RadioGroup>
                  </Form>
                </FormControl>
                <Grid container sx={{ justifyContent: "flex-end" }}>
                  <Grid>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() =>
                        validateForm().then((errors) => {
                          if (
                            Object.entries(errors).length === 0 &&
                            errors.constructor === Object
                          ) {
                            handleNext(values);
                          } else {
                            setTouched(errors);
                          }
                        })
                      }
                    >
                      Next
                    </Button>
                  </Grid>
                </Grid>
              </>
            );
          }}
        </Formik>
      </Grid>
    </React.Fragment>
  );
}
/* SetupProfile */
const useSetupProfileStyles = createStyles((theme) => ({
  appBar: { position: "relative" },
  layout: {
    width: "auto",
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    [theme.breakpoints.up(600 + 16 * 2)]: {
      width: 600,
      marginLeft: "auto",
      marginRight: "auto",
    },
    height: "100vh",
  },
  paper: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
    padding: theme.spacing(2),
    [theme.breakpoints.up(600 + 24 * 2)]: {
      marginTop: theme.spacing(6),
      marginBottom: theme.spacing(6),
      padding: theme.spacing(3),
    },
  },
  stepper: { padding: theme.spacing(3, 0, 5) },
  buttons: { display: "flex", justifyContent: "flex-end" },
  button: { marginTop: theme.spacing(3), marginLeft: theme.spacing(1) },
  normalText: {
    fontFamily: "Segoe UI",
    fontWeight: "medium",
    fontSize: "1.5rem",
  },
  headerText: {
    fontWeight: "bold",
    fontFamily: "Roboto",
    color: theme.palette.primary.main,
  },
}));
const SetupProfile = (props) => {
  const classes = useSetupProfileStyles();
  const steps = ["Your role", "Information", "Confirmation"];
  const [activeStep, setActiveStep] = useState(0);
  var initialFields = { role: "", name: "", email: "" };
  const [formValues, setFormValues] = useState(initialFields);
  const handleNext = (newValues) => {
    setFormValues({ ...formValues, ...newValues });
    setActiveStep(activeStep + 1);
  };
  const handleBack = (newValues) => {
    setFormValues({ ...formValues, ...newValues });
    setActiveStep(activeStep - 1);
  };
  function getStepContent(step) {
    switch (step) {
      case 0:
        return (
          <RoleStep
            {...formValues}
            handleBack={handleBack}
            handleNext={handleNext}
          />
        );
      case 1:
        return (
          <InformationStep
            {...formValues}
            handleBack={handleBack}
            handleNext={handleNext}
          />
        );
      case 2:
        return (
          <ReviewStep
            review={formValues}
            handleBack={handleBack}
            handleNext={handleNext}
            {...props}
            setActiveStep={setActiveStep}
            activeStep={activeStep}
          />
        );
      default:
        throw new Error("Unknown step");
    }
  }
  return (
    <React.Fragment>
      <main className={classes.layout}>
        <Paper className={classes.paper}>
          <Typography
            component="h1"
            variant="h4"
            align="center"
            className={classes.headerText}
          >
            Checkin
          </Typography>
          <Stepper activeStep={activeStep} className={classes.stepper}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          <React.Fragment>
            {activeStep === steps.length ? (
              <React.Fragment>
                <Typography variant="h5" gutterBottom>
                  Registeration Successfully
                </Typography>
                <Link2 to="/home">
                  <Button variant="contained" color="primary">
                    {" "}
                    Back to home page{" "}
                  </Button>
                </Link2>
              </React.Fragment>
            ) : (
              <React.Fragment>{getStepContent(activeStep)}</React.Fragment>
            )}
          </React.Fragment>
        </Paper>
      </main>
    </React.Fragment>
  );
};
/* StudentDetailEditor */
const studentDetailEditorActions = (dispatch) => ({
  updateProfile: (props) => dispatch(updateProfile(props)),
});
const useStudentDetailEditorStyles = createStyles((theme) => ({
  paperStyle: { padding: "20px", width: "60%", margin: "20px auto" },
  icon: { backgroundColor: theme.palette.primary.main },
  btn: {
    marginTop: "15px",
    backgroundColor: theme.palette.secondary.light,
    variant: "contained",
  },
  inputBar: { marginTop: 0, marginBottom: "10px" },
  label: { fontWeight: "medium", color: theme.palette.primary.main },
  outerColumn: { padding: "5px" },
  checkbox: { color: theme.palette.secondary.main },
}));
const studentDetailEditorValidationSchema = Yup.object({
  fee: Yup.number()
    .typeError("you must specify a number")
    .positive("The number must be positive"),
});
const StudentDetailEditorDetailModal = (props) => {
  const classes = useStudentDetailEditorStyles();
  const {
    grade,
    subject,
    district,
    fee,
    address,
    available,
    updateProfile,
    closeModal,
  } = props;
  async function updateInfo(values) {
    return await updateProfile(values);
  }
  const handleInput = async (values) => {
    const saved = await updateInfo(values);
    if (saved) closeModal();
  };
  const initialValues = {
    grade: grade,
    subject: subject,
    district: district,
    fee: fee,
    address: address,
    available: available,
  };
  const inputBar = ({ field, form, type, label, errors, touched }) => {
    const { name } = field;
    const dfVals = name === "fee" ? fee : address;
    return (
      <>
        <InputLabel className={classes.label} htmlFor={name}>
          {label}
        </InputLabel>
        <TextField
          type={type}
          name={name}
          className={classes.inputBar}
          fullWidth
          margin="normal"
          defaultValue={dfVals}
          onChange={(evt) => form.setFieldValue(name, evt.target.value)}
          error={touched[name] && Boolean(errors[name])}
          helperText={errors[name]}
        />
      </>
    );
  };
  const renderRadio = ({ form }) => {
    return (
      <>
        <RadioGroup
          row
          aria-label="position"
          name="available"
          defaultValue="top"
          defaultChecked={available}
          onChange={(evt) =>
            form.setFieldValue("available", evt.target.value === "true")
          }
        >
          <FormControlLabel
            value="true"
            control={
              <Radio
                name="available"
                checked={form.values.available === true}
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
                checked={form.values.available === false}
              />
            }
            label="No"
            labelPlacement="top"
          />
        </RadioGroup>
      </>
    );
  };
  return (
    <Paper elevation={10} className={classes.paperStyle}>
      <Formik
        initialValues={initialValues}
        onSubmit={handleInput}
        validationSchema={studentDetailEditorValidationSchema}
      >
        {({ errors, touched }) => (
          <Form>
            <Grid container sx={{ justifyContent: "center" }}>
              <Grid size={{ sm: 12 }} className={classes.outerColumn}>
                <Grid container spacing={1}>
                  <Grid size={{ xs: 12 }}>
                    {" "}
                    <Typography variant="h5" color="primary">
                      Edit requirement for the class
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Field
                      component={OptionSelect}
                      name="grade"
                      type="text"
                      label="Grade"
                      option={FilterField.gradOption}
                      storeNames={true}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Field
                      component={OptionSelect}
                      name="subject"
                      type="text"
                      label="Subject"
                      option={FilterField.subjOption}
                      storeNames={true}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Field
                      component={OptionSelect}
                      name="district"
                      type="text"
                      label="District"
                      option={FilterField.distOption}
                      storeNames={true}
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Field
                      component={inputBar}
                      name="fee"
                      type="text"
                      label="Tuition Fee"
                      errors={errors}
                      touched={touched}
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Field
                      component={inputBar}
                      name="address"
                      type="text"
                      label="Address"
                      errors={errors}
                      touched={touched}
                    />
                  </Grid>

                  <Grid size={{ xs: 6 }}>
                    <FormLabel>
                      {" "}
                      <Typography variant="body1" color="primary">
                        Looking for teacher now
                      </Typography>
                    </FormLabel>
                    <Field component={renderRadio} name="available" />
                  </Grid>
                </Grid>
              </Grid>

              <Grid size={{ sm: 12 }}>
                <Grid
                  container
                  direction="row"
                  spacing={1}
                  sx={{ justifyContent: "flex-end" }}
                >
                  <Grid size={{ md: 2 }}>
                    <Button className={classes.btn} type="submit" fullWidth>
                      Save
                    </Button>
                  </Grid>
                  <Grid size={{ md: 2 }}>
                    <Button
                      className={classes.btn}
                      fullWidth
                      onClick={closeModal}
                    >
                      Cancel
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
    </Paper>
  );
};
const StudentDetailEditor = connect(
  null,
  studentDetailEditorActions,
)(StudentDetailEditorDetailModal);
/* TeacherDetailEditor */
const teacherDetailEditorActions = (dispatch) => ({
  updateProfile: (props) => dispatch(updateProfile(props)),
});
const useTeacherDetailEditorStyles = createStyles((theme) => ({
  paperStyle: { padding: "20px", width: "60%", margin: "20px auto" },
  icon: { backgroundColor: theme.palette.primary.main },
  btn: {
    marginTop: "15px",
    backgroundColor: theme.palette.secondary.light,
    variant: "contained",
  },
  inputBar: { marginTop: 0, marginBottom: "10px" },
  label: { fontWeight: "bold", color: theme.palette.primary.dark },
  outerColumn: { borderRight: "1px solid grey", padding: "5px" },
  checkbox: { color: theme.palette.secondary.main },
}));
const teacherDetailEditorCheckBoxValues = [
  { label: "Mon", value: 2 },
  { label: "Tue", value: 3 },
  { label: "Wed", value: 4 },
  { label: "Thu", value: 5 },
  { label: "Fri", value: 6 },
  { label: "Sat", value: 7 },
  { label: "Sun", value: 8 },
];
const TeacherDetailEditorDetailModal = (props) => {
  const classes = useTeacherDetailEditorStyles();
  const {
    grade,
    subject,
    district,
    fee,
    weekly,
    available,
    updateProfile,
    closeModal,
  } = props;
  async function updateInfo(values) {
    return await updateProfile(values);
  }
  const handleInput = async (values) => {
    const saved = await updateInfo(values);
    if (saved) closeModal();
  };
  const initialValues = {
    grade: grade,
    subject: subject,
    district: district,
    fee: fee,
    weekly: weekly,
    available: available,
  };
  const checkBox = ({ field, form, label, value }) => {
    const { name } = field;
    return (
      <FormControlLabel
        control={
          <Checkbox
            value={value}
            name={name}
            onChange={(evt) => {
              const data = field.value;
              const numLoc = data.indexOf(parseInt(evt.target.value));
              if (numLoc === -1) {
                data.push(parseInt(evt.target.value));
              } else if (numLoc !== -1) {
                data.splice(numLoc, 1);
              }
              form.setFieldValue(name, data);
            }}
            checked={form.values.weekly.includes(value)}
          />
        }
        label={label}
        labelPlacement="top"
        className={classes.checkbox}
      />
    );
  };
  const inputBar = ({ field, form, type, label, errors, touched }) => {
    const { name } = field;
    const helpText = "Input " + label;
    return (
      <>
        <InputLabel className={classes.label} htmlFor={name}>
          {label}
        </InputLabel>
        <TextField
          type={type}
          name={name}
          placeholder={helpText}
          className={classes.inputBar}
          fullWidth
          margin="normal"
          defaultValue={fee}
          onChange={(evt) => form.setFieldValue(name, evt.target.value)}
          error={touched[name] && Boolean(errors[name])}
          helperText={errors[name]}
        />
      </>
    );
  };
  const renderRadio = ({ form }) => {
    return (
      <>
        <RadioGroup
          row
          aria-label="position"
          name="available"
          defaultValue="top"
          defaultChecked={available}
          onChange={(evt) =>
            form.setFieldValue("available", evt.target.value === "true")
          }
        >
          <FormControlLabel
            value="true"
            control={
              <Radio
                name="available"
                checked={form.values.available === true}
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
                checked={form.values.available === false}
              />
            }
            label="No"
            labelPlacement="top"
          />
        </RadioGroup>
      </>
    );
  };
  return (
    <Paper elevation={10} className={classes.paperStyle}>
      <Formik
        initialValues={initialValues}
        onSubmit={handleInput}
        validationSchema={studentDetailEditorValidationSchema}
      >
        {({ errors, touched }) => (
          <Form>
            <Grid container spacing={2}>
              <Grid
                size={{ sm: 12, md: 6 }}
                className={classes.outerColumn}
                container
                spacing={1}
              >
                <Typography variant="h5" color="primary">
                  Edit requirement for the class
                </Typography>
                <Grid size={{ xs: 12 }}>
                  <Field
                    component={OptionSelect}
                    name="grade"
                    type="text"
                    label="Grade"
                    option={FilterField.gradOption}
                    storeNames={true}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Field
                    component={OptionSelect}
                    name="subject"
                    type="text"
                    label="Subject"
                    option={FilterField.subjOption}
                    storeNames={true}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Field
                    component={OptionSelect}
                    name="district"
                    type="text"
                    label="District"
                    option={FilterField.distOption}
                    storeNames={true}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Field
                    component={inputBar}
                    name="fee"
                    type="text"
                    label="Tuition Fee"
                    errors={errors}
                    touched={touched}
                  />
                </Grid>
              </Grid>

              <Grid size={{ sm: 12, md: 6 }}>
                <Typography variant="h5" color="primary">
                  {" "}
                  Available Schedule
                </Typography>
                <Grid>
                  <Typography className={classes.label}>Workday</Typography>
                  {teacherDetailEditorCheckBoxValues.map((obj, idx) => (
                    <Field
                      key={idx}
                      component={checkBox}
                      name="weekly"
                      label={obj.label}
                      value={obj.value}
                    />
                  ))}
                </Grid>
                <Grid>
                  <FormLabel className={classes.label}>Available</FormLabel>
                  <Field component={renderRadio} name="available" />
                </Grid>
              </Grid>
              <Grid size={{ sm: 12 }}>
                <Grid
                  container
                  direction="row"
                  spacing={1}
                  sx={{ justifyContent: "flex-end" }}
                >
                  <Grid size={{ md: 2 }}>
                    <Button className={classes.btn} type="submit" fullWidth>
                      Save
                    </Button>
                  </Grid>
                  <Grid size={{ md: 2 }}>
                    <Button
                      className={classes.btn}
                      fullWidth
                      onClick={props.closeModal}
                    >
                      Cancel
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
    </Paper>
  );
};
const TeacherDetailEditor = connect(
  null,
  teacherDetailEditorActions,
)(TeacherDetailEditorDetailModal);
/* ReviewForm */
const useReviewFormStyles = createStyles((theme) => ({
  paperStyle: { padding: 20, width: "60%", margin: "20px auto" },
  icon: { backgroundColor: theme.palette.primary.main },
  btn: {
    marginTop: "15px",
    backgroundColor: theme.palette.secondary.light,
    variant: "contained",
  },
  inputBar: { marginTop: 0, marginBottom: "10px" },
  label: { fontWeight: "medium", color: theme.palette.primary.dark },
  upload: { height: "100%", widht: "100%", backgroundColor: "#FF0000" },
  star: { width: "25px", height: "25px" },
}));
const ReviewForm = (props) => {
  const classes = useReviewFormStyles();
  const [rating, setRating] = useState(null);
  const [comment, setComment] = useState("");
  const handleSubmit = async () => {
    if (rating === null || comment === "") {
      toast.error("You need to rate and comment");
    } else {
      const saved = await props.postComment(props.id, rating, comment);
      if (saved) props.closeModal();
    }
  };
  return (
    <Paper elevation={10} className={classes.paperStyle}>
      <Typography variant="h5" color="primary">
        Your comment
      </Typography>
      <Grid
        container
        direction="row"
        spacing={1}
        sx={{ justifyContent: "center" }}
      >
        <Grid size={{ sm: 12 }} container sx={{ justifyContent: "center" }}>
          <Rating
            name="teacher-rating"
            value={rating || 0}
            onChange={(_, value) => setRating(value)}
            emptyIcon={<StarIcon sx={{ color: "#e4e5e9" }} />}
            sx={{ fontSize: 25, color: "#ffc107" }}
          />
        </Grid>
        <Grid size={{ sm: 12 }} container sx={{ justifyContent: "center" }}>
          <Typography variant="body2">The rating is {rating}/5</Typography>
        </Grid>

        <Grid size={{ sm: 12 }}>
          <TextField
            className={classes.inputBar}
            required
            error={comment === "" ? true : false}
            // helperText="Required"
            name="comment"
            placeholder="Comment is required"
            variant="outlined"
            fullWidth
            onChange={(evt) => setComment(evt.target.value)}
            multiline
            rows={5}
          />
        </Grid>
      </Grid>

      <Grid container direction="row" sx={{ justifyContent: "space-evenly" }}>
        <Grid size={{ md: 4 }}>
          <Button
            className={classes.btn}
            type="submit"
            fullWidth
            onClick={handleSubmit}
          >
            {" "}
            Submit
          </Button>
        </Grid>
        <Grid size={{ md: 4 }}>
          <Button className={classes.btn} onClick={props.closeModal} fullWidth>
            Cancel
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};
export {
  CreateCourseForm,
  EditCourseForm,
  InformationStep,
  ReviewForm,
  ReviewStep,
  RoleStep,
  SetupProfile,
  SignIn,
  SignUp,
  StudentDetailEditor,
  StudentIntroEditor,
  TeacherDetailEditor,
  TeacherIntroEditor,
};
