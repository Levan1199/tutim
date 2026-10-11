import { apiRequest, imageForm } from "../api.js";

export function normalizeProfile(profile) {
  if (!profile || typeof profile !== "object") return profile;
  return {
    ...profile,
    district: profile.district || [],
    grade: profile.grade || [],
    subject: profile.subject || [],
    weekly: profile.weekly || [],
  };
}

export function normalizeUser(user) {
  if (!user) return null;
  return {
    ...user,
    role: user.admin
      ? "admin"
      : user.teacherProfile
        ? "teacher"
        : user.studentProfile
          ? "student"
          : "unassigned",
    teacherProfile: normalizeProfile(user.teacherProfile),
    studentProfile: normalizeProfile(user.studentProfile),
  };
}

function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("creds");
}

async function currentUser() {
  if (!localStorage.getItem("token")) return null;
  try {
    return normalizeUser(await apiRequest("profile"));
  } catch (error) {
    if (error.status !== 401) throw error;
    clearSession();
    return null;
  }
}

async function login(body) {
  const result = await apiRequest("users/login", {
    method: "POST",
    body,
    token: null,
  });
  localStorage.setItem("token", result.token);
  localStorage.setItem("creds", JSON.stringify({ username: body.username }));
  return currentUser();
}

async function findCourse(id) {
  const courses = await apiRequest("course");
  const course = courses.find((item) => item._id === id || item.name === id);
  if (!course)
    throw Object.assign(new Error("Course not found."), { status: 404 });
  return course;
}

async function connections() {
  const user = await currentUser();
  if (!user || user.role === "unassigned") return [];
  const items = await apiRequest(
    "awaiting" + (user.role === "admin" ? "" : "/" + user.role),
  );
  return items.map((item) => ({
    ...item,
    teacherId: normalizeProfile(item.teacherId),
    studentId: normalizeProfile(item.studentId),
  }));
}

// Adapt the imported v2 screens to the existing API and database schemas.
// Both interfaces use the same JWT and save through the same endpoints.
export async function modernRequest(operation, args) {
  switch (operation) {
    case "getMe":
      return currentUser();
    case "login":
      return login(args);
    case "register":
      await apiRequest("users/signup", {
        method: "POST",
        body: args,
        token: null,
      });
      return login(args);
    case "logout":
      clearSession();
      return { success: true };
    case "getTeachers":
      return (await apiRequest("teacherReg")).map(normalizeProfile);
    case "getStudents":
      return (await apiRequest("studentReg")).map(normalizeProfile);
    case "getTeacher":
      return normalizeProfile(
        await apiRequest("teacherReg/" + encodeURIComponent(args)),
      );
    case "getStudent":
      return normalizeProfile(
        await apiRequest("studentReg/" + encodeURIComponent(args)),
      );
    case "getCourses":
      return apiRequest("course");
    case "getCourse":
      return findCourse(args);
    case "saveCourse": {
      const { id, file, ...values } = args;
      const previous = id ? await findCourse(id) : null;
      return apiRequest(
        "course" + (previous ? "/" + encodeURIComponent(previous.name) : ""),
        {
          method: previous ? "PUT" : "POST",
          body: imageForm({ ...values, courseImg: file }, "courseImg"),
        },
      );
    }
    case "deleteCourse": {
      const course = await findCourse(args);
      return apiRequest("course/" + encodeURIComponent(course.name), {
        method: "DELETE",
      });
    }
    case "getReviews": {
      const items = await apiRequest("comments");
      return args
        ? items.filter(
            (item) => String(item.commentTo?._id || item.commentTo) === args,
          )
        : items;
    }
    case "addReview": {
      const { teacherId, ...values } = args;
      return apiRequest("comments", {
        method: "POST",
        body: { ...values, commentTo: teacherId },
      });
    }
    case "saveProfile": {
      const { role, file, ...values } = args;
      const user = await currentUser();
      if (user?.role === "unassigned")
        await apiRequest("profile", {
          method: "POST",
          body: {
            name: values.name,
            email: values.email,
            isTeacher: role === "teacher",
            isStudent: role === "student",
          },
        });
      return normalizeUser(
        await apiRequest("profile", {
          method: "PUT",
          body: imageForm({ ...values, avatar: file }, "avatar"),
        }),
      );
    }
    case "getConnections":
      return connections();
    case "connect": {
      const user = await currentUser();
      return apiRequest("awaiting/" + user.role, {
        method: "POST",
        body: { [user.role === "student" ? "teacherId" : "studentId"]: args },
      });
    }
    case "disconnect": {
      const user = await currentUser();
      if (user.role === "admin")
        return apiRequest("awaiting/" + args, { method: "DELETE" });
      const item = (await connections()).find((entry) => entry._id === args);
      if (!item)
        throw Object.assign(new Error("Connection not found."), {
          status: 404,
        });
      const key = user.role === "student" ? "teacherId" : "studentId";
      return apiRequest("awaiting/" + user.role, {
        method: "DELETE",
        body: { [key]: item[key]?._id || item[key] },
      });
    }
    case "getUsers":
      return (await apiRequest("users")).map(normalizeUser);
    case "setDisabled":
      return apiRequest("admin/accounts/" + args.id, {
        method: "PATCH",
        body: { isDisable: args.isDisable },
      });
    case "deleteUser":
      return apiRequest("admin/accounts/" + args, { method: "DELETE" });
    default:
      throw new Error("Unknown operation: " + operation);
  }
}
