import { configureStore } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import options from "../../shared/options.json" with { type: "json" };
export const centerAddress = options.centerAddress;
export const gradOption = options.grades.map((name) => ({ name }));
export const subjOption = options.subjects.map((name) => ({ name }));
export const distOption = options.districts.map((name) => ({ name }));
export const stuInit = { district: [], grade: [], subject: [] };
export const teachInit = { ...stuInit };

// API paths and requests
import { apiRequest, imageForm } from "./api.js";
export { apiRequest, imageForm, baseUrl } from "./api.js";
export const avatarUrl = "/images/";
export const courseUrl = "/coursesImg/";
export const homeUrl = "/homeImg/";

// Session and profile state

// The auth reducer. The starting state sets authentication
// based on a token being in local storage. In a real app,
// we would also want a util to check if the token is expired.
function savedUser() {
  try {
    const previous = JSON.parse(localStorage.getItem("creds"));
    if (!previous) return null;
    const safe = { username: previous.username };
    localStorage.setItem("creds", JSON.stringify(safe));
    return safe;
  } catch {
    localStorage.removeItem("creds");
    return null;
  }
}
export const Auth = (
  state = {
    isLoading: false,
    isAuthenticated: localStorage.getItem("token") ? true : false,
    token: localStorage.getItem("token"),
    user: savedUser(),
    errMess: null,
  },
  action,
) => {
  switch (action.type) {
    case "LOGIN_REQUEST":
      return {
        ...state,
        isLoading: true,
        isAuthenticated: false,
        user: action.creds,
      };
    case "LOGIN_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        errMess: "",
        token: action.token,
      };
    case "LOGIN_FAILURE":
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        errMess: action.message,
      };
    case "LOGOUT_REQUEST":
      return { ...state, isLoading: true, isAuthenticated: true };
    case "LOGOUT_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        token: "",
        user: null,
      };
    default:
      return state;
  }
};

export const Profiles = (
  state = { isLoading: true, isEmpty: false, errMess: null, profiles: null },
  action,
) => {
  switch (action.type) {
    case "ADD_PROFILE":
      return {
        ...state,
        isLoading: false,
        errMess: null,
        profiles: action.payload,
        isEmpty: false,
      };

    case "PROFILE_LOADING":
      return {
        ...state,
        isLoading: true,
        errMess: null,
        profiles: null,
        isEmpty: false,
      };

    case "PROFILE_FAILED":
      return {
        ...state,
        isLoading: false,
        errMess: action.payload,
        profiles: null,
        isEmpty: false,
      };

    case "EMPTY_PROFILE":
      return {
        ...state,
        isLoading: false,
        errMess: null,
        profiles: null,
        isEmpty: true,
      };
    case "LOGOUT_PROFILE":
      return {
        ...state,
        isLoading: false,
        errMess: null,
        profiles: null,
        isEmpty: false,
      };

    default:
      return state;
  }
};

// List resources share loading, failure, replacement, and append behavior.
function listReducer(
  key,
  add,
  loading,
  failed,
  {
    initialLoading = true,
    clearLoading = true,
    append,
    clearAppendError = true,
  } = {},
) {
  const initial = { isLoading: initialLoading, errMess: null, [key]: [] };
  return (state = initial, action) => {
    if (action.type === add)
      return {
        ...state,
        isLoading: false,
        errMess: null,
        [key]: action.payload,
      };
    if (action.type === loading)
      return {
        ...state,
        isLoading: true,
        errMess: null,
        ...(clearLoading ? { [key]: [] } : {}),
      };
    if (action.type === failed)
      return { ...state, isLoading: false, errMess: action.payload, [key]: [] };
    if (append && action.type === append)
      return {
        ...state,
        isLoading: false,
        ...(clearAppendError ? { errMess: null } : {}),
        [key]: state[key].concat(action.payload),
      };
    return state;
  };
}
export const ConfigureStore = () =>
  configureStore({
    reducer: {
      profiles: Profiles,
      auth: Auth,
      teacherRegs: listReducer(
        "teacherRegs",
        "ADD_TEACHERREG",
        "TEACHERREG_LOADING",
        "TEACHERREG_FAILED",
      ),
      studentRegs: listReducer(
        "studentRegs",
        "ADD_STUDENTREG",
        "STUDENTREG_LOADING",
        "STUDENTREG_FAILED",
      ),
      courseInfo: listReducer(
        "courseInfo",
        "ADD_COURSEINFO",
        "COURSEINFO_LOADING",
        "COURSEINFO_FAILED",
        { append: "ADD_ONECOURSE" },
      ),
      awaiting: listReducer(
        "awaiting",
        "ADD_AWAITING",
        "AWAITING_LOADING",
        "AWAITING_FAILED",
      ),
      managerProfiles: listReducer(
        "managerProfiles",
        "MANAGERPROFILE_ADD",
        "MANAGERPROFILE_LOADING",
        "MANAGERPROFILE_FAILED",
      ),
      managerStudentProfiles: listReducer(
        "managerStudentProfiles",
        "MANAGERSTUDENT_ADD",
        "MANAGERSTUDENT_LOADING",
        "MANAGERSTUDENT_FAILED",
      ),
      comments: listReducer(
        "comments",
        "ADD_COMMENTS",
        "LOADING_COMMENTS",
        "COMMENTS_FAILED",
        {
          initialLoading: false,
          clearLoading: false,
          append: "ADD_COMMENT",
          clearAppendError: false,
        },
      ),
    },
  });

// Backend actions
const action = (type) => (payload) => ({ type, payload });
export const addComment = action("ADD_COMMENT");
export const loadComment = action("LOADING_COMMENTS");
export const addComments = action("ADD_COMMENTS");
export const commentsFailed = action("COMMENTS_FAILED");
export const emptyProfile = action("EMPTY_PROFILE");
export const addProfile = action("ADD_PROFILE");
export const profileFailed = action("PROFILE_FAILED");
export const profileLoading = action("PROFILE_LOADING");
export const logoutEmptyProfile = action("LOGOUT_PROFILE");
export const addTeacherReg = action("ADD_TEACHERREG");
export const teacherRegFailed = action("TEACHERREG_FAILED");
export const teacherRegLoading = action("TEACHERREG_LOADING");
export const addStudentReg = action("ADD_STUDENTREG");
export const studentRegFailed = action("STUDENTREG_FAILED");
export const studentRegLoading = action("STUDENTREG_LOADING");
export const addCourseInfo = action("ADD_COURSEINFO");
export const courseInfoFailed = action("COURSEINFO_FAILED");
export const courseInfoLoading = action("COURSEINFO_LOADING");
export const addOneCourse = action("ADD_ONECOURSE");
export const addAwaiting = action("ADD_AWAITING");
export const awaitingFailed = action("AWAITING_FAILED");
export const awaitingLoading = action("AWAITING_LOADING");
export const addManagerProfile = action("MANAGERPROFILE_ADD");
export const failedManagerProfile = action("MANAGERPROFILE_FAILED");
export const loadingManagerProfile = action("MANAGERPROFILE_LOADING");
export const addManagerStudent = action("MANAGERSTUDENT_ADD");
export const failedManagerStudent = action("MANAGERSTUDENT_FAILED");
export const loadingManagerStudent = action("MANAGERSTUDENT_LOADING");
export const requestLogout = action("LOGOUT_REQUEST");
export const receiveLogout = action("LOGOUT_SUCCESS");

export const requestLogin = (creds) => ({
  type: "LOGIN_REQUEST",
  creds: { username: creds.username },
});
export const receiveLogin = (response) => ({
  type: "LOGIN_SUCCESS",
  token: response.token,
});
export const loginError = (message) => ({ type: "LOGIN_FAILURE", message });
const load = (path, loading, success, failed) => () => async (dispatch) => {
  dispatch(loading());
  try {
    const data = await apiRequest(path);
    dispatch(success(data));
    return data;
  } catch (error) {
    dispatch(failed(error.message));
    return null;
  }
};
const change =
  (path, method, body, refresh, failed, message) => async (dispatch) => {
    try {
      const data = await apiRequest(path, { method, body });
      if (refresh) await dispatch(refresh());
      if (message) toast.success(message);
      return data;
    } catch (error) {
      dispatch(failed(error.message));
      toast.error(error.message);
      return null;
    }
  };
export const fetchComments = load(
  "comments",
  loadComment,
  addComments,
  commentsFailed,
);
export const fetchTeacherReg = load(
  "teacherReg",
  teacherRegLoading,
  addTeacherReg,
  teacherRegFailed,
);
export const fetchStudentReg = load(
  "studentReg",
  studentRegLoading,
  addStudentReg,
  studentRegFailed,
);
export const fetchCourseInfo = load(
  "course",
  courseInfoLoading,
  addCourseInfo,
  courseInfoFailed,
);
export const fetchTeacherAcc = load(
  "admin/teacher",
  loadingManagerProfile,
  addManagerProfile,
  failedManagerProfile,
);
export const fetchStudentAcc = load(
  "admin/student",
  loadingManagerStudent,
  addManagerStudent,
  failedManagerStudent,
);
const loadConnections = (role) => () => async (dispatch, getState) => {
  const profile = getState().profiles.profiles;
  if (!localStorage.getItem("token") || !profile?.[role + "Profile"]) {
    dispatch(addAwaiting([]));
    return [];
  }
  return load(
    "awaiting/" + role,
    awaitingLoading,
    addAwaiting,
    awaitingFailed,
  )()(dispatch);
};
export const fetchStudentAwait = loadConnections("student");
export const fetchTeacherAwait = loadConnections("teacher");
export const fetchProfile = () => async (dispatch) => {
  if (!localStorage.getItem("token")) {
    dispatch(logoutEmptyProfile());
    return null;
  }
  dispatch(profileLoading());
  try {
    const user = await apiRequest("profile");
    dispatch(
      user && (user.admin || user.teacherProfile || user.studentProfile)
        ? addProfile(user)
        : emptyProfile(),
    );
    return user;
  } catch (error) {
    if (error.status === 401) dispatch(logoutUser());
    else dispatch(profileFailed(error.message));
    return null;
  }
};
export const logoutUser = () => (dispatch) => {
  dispatch(requestLogout());
  localStorage.removeItem("token");
  localStorage.removeItem("creds");
  dispatch(logoutEmptyProfile());
  dispatch(receiveLogout());
};
async function finishLogin(response, dispatch, username) {
  localStorage.setItem("token", response.token);
  if (username) localStorage.setItem("creds", JSON.stringify({ username }));
  await dispatch(fetchProfile());
  dispatch(receiveLogin(response));
  toast.success("Login successfully!");
  return response;
}
export const loginUser = (creds) => async (dispatch) => {
  dispatch(requestLogin(creds));
  try {
    return await finishLogin(
      await apiRequest("users/login", {
        method: "POST",
        body: creds,
        token: null,
      }),
      dispatch,
      creds.username,
    );
  } catch (error) {
    dispatch(loginError(error.message));
    toast.error(error.message);
    return null;
  }
};
export const signUp = (creds) => async (dispatch) => {
  try {
    await apiRequest("users/signup", {
      method: "POST",
      body: creds,
      token: null,
    });
    return await dispatch(loginUser(creds));
  } catch (error) {
    dispatch(loginError(error.message));
    toast.error(error.message);
    return null;
  }
};
export const postProfile = (values) =>
  change(
    "profile",
    "POST",
    {
      ...values,
      isTeacher: values.role === "isTeacher",
      isStudent: values.role !== "isTeacher",
    },
    fetchProfile,
    profileFailed,
  );
export const updateProfile = (values) =>
  change(
    "profile",
    "PUT",
    imageForm(values, "avatar"),
    fetchProfile,
    profileFailed,
    "Your profile updated successfully",
  );
export const fetchCourseDetail = (name) =>
  load(
    "course/" + encodeURIComponent(name),
    courseInfoLoading,
    addOneCourse,
    courseInfoFailed,
  )();
export const deleteCourseDetail = (name) =>
  change(
    "course/" + encodeURIComponent(name),
    "DELETE",
    undefined,
    fetchCourseInfo,
    courseInfoFailed,
  );
export const updateCourse = (values) =>
  change(
    "course/" + encodeURIComponent(values.prevName),
    "PUT",
    imageForm(values, "courseImg"),
    fetchCourseInfo,
    courseInfoFailed,
  );
export const postCourse = (values) =>
  change(
    "course",
    "POST",
    imageForm(values, "courseImg"),
    fetchCourseInfo,
    courseInfoFailed,
  );
export const postComment = (commentTo, rating, comment) =>
  change(
    "comments",
    "POST",
    { commentTo, rating, comment },
    fetchComments,
    commentsFailed,
    "Comment posted successfully",
  );
export const studentAwait = (body) =>
  change("awaiting/student", "POST", body, fetchStudentAwait, awaitingFailed);
export const teacherAwait = (body) =>
  change("awaiting/teacher", "POST", body, fetchTeacherAwait, awaitingFailed);
export const removeStudentAwait = (body) =>
  change(
    "awaiting/student",
    "DELETE",
    body,
    fetchStudentAwait,
    awaitingFailed,
    "Disconnect successfully",
  );
export const removeTeacherAwait = (body) =>
  change(
    "awaiting/teacher",
    "DELETE",
    body,
    fetchTeacherAwait,
    awaitingFailed,
    "Disconnect successfully",
  );
export const disableTeacherAcc = (id) =>
  change(
    "admin/teacher/" + id,
    "PUT",
    undefined,
    fetchTeacherAcc,
    failedManagerProfile,
  );
export const disableStudentAcc = (id) =>
  change(
    "admin/student/" + id,
    "PUT",
    undefined,
    fetchStudentAcc,
    failedManagerStudent,
  );
