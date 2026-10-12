export const UI_PREFERENCE_KEY = "tutim-ui";

export function readInterface() {
  try {
    return localStorage.getItem(UI_PREFERENCE_KEY) === "legacy"
      ? "legacy"
      : "modern";
  } catch {
    return "modern";
  }
}

export function rememberInterface(mode) {
  try {
    localStorage.setItem(UI_PREFERENCE_KEY, mode);
  } catch {
    // Switching still works when browser storage is unavailable.
  }
}

// Keep equivalent pages open when their URLs differ between v1 and v2.
export function routeForInterface(
  { pathname, search = "", hash = "" },
  mode,
  { user, courses = [] } = {},
) {
  let path = pathname;
  const role = user?.admin
    ? "admin"
    : user?.teacherProfile
      ? "teacher"
      : user?.studentProfile
        ? "student"
        : "unassigned";
  if (mode === "legacy") {
    const routes = {
      "/": "/home",
      "/teachers": "/teacherList",
      "/students": "/studentList",
      "/admin": "/admin/view",
      "/profile":
        role === "admin"
          ? "/admin/view"
          : role === "unassigned"
            ? "/stepper"
            : "/profile/" + role,
      "/connections":
        role === "teacher"
          ? "/teaAwaiting"
          : role === "student"
            ? "/awaiting"
            : "/admin/view",
      "/signin": "/home",
      "/signup": "/home",
    };
    path = routes[path] || path;
    const profile = pathname.match(/^\/(teachers|students)\/([^/]+)$/);
    if (profile)
      path =
        "/profile/" +
        (profile[1] === "teachers" ? "teacher" : "student") +
        "/" +
        profile[2];
    const course = pathname.match(/^\/courses\/([^/]+)$/);
    if (course) {
      const match = courses.find(
        (item) => item._id === decodeURIComponent(course[1]),
      );
      path = match
        ? "/courseDetail/" + encodeURIComponent(match.name)
        : "/courses";
    }
    if (pathname === "/teachers") {
      const params = new URLSearchParams(search);
      if (params.get("subject"))
        path += "/" + encodeURIComponent(params.get("subject"));
    }
  } else {
    const routes = {
      "/home": "/",
      "/teacherList": "/teachers",
      "/studentList": "/students",
      "/admin/view": "/admin",
      "/admin/studentList": "/admin",
      "/admin/teacherList": "/admin",
      "/profile/teacher": "/profile",
      "/profile/student": "/profile",
      "/stepper": "/profile",
      "/awaiting": "/connections",
      "/teaAwaiting": "/connections",
    };
    path = routes[path] || path;
    const profile = pathname.match(/^\/profile\/(teacher|student)\/([^/]+)$/);
    if (profile)
      path =
        "/" +
        (profile[1] === "teacher" ? "teachers" : "students") +
        "/" +
        profile[2];
    const course = pathname.match(/^\/courseDetail\/([^/]+)$/);
    if (course) {
      const match = courses.find(
        (item) => item.name === decodeURIComponent(course[1]),
      );
      path = match ? "/courses/" + match._id : "/courses";
    }
    const subject = pathname.match(/^\/teacherList\/([^/]+)$/);
    if (subject) {
      path = "/teachers";
      const params = new URLSearchParams(search);
      params.set("subject", decodeURIComponent(subject[1]));
      search = "?" + params.toString();
    }
  }
  return path + search + hash;
}
