import { configureStore } from "@reduxjs/toolkit";
import { createApi } from "@reduxjs/toolkit/query/react";
import { modernRequest } from "./requests.js";

const definitions = {
  getMe: ["query", ["Session"]],
  login: ["mutation", ["Session", "Connections", "Users"]],
  register: ["mutation", ["Session"]],
  logout: ["mutation", ["Session", "Connections", "Users"]],
  getTeachers: ["query", ["Teachers"]],
  getStudents: ["query", ["Students"]],
  getTeacher: ["query", ["Teachers"]],
  getStudent: ["query", ["Students"]],
  getCourses: ["query", ["Courses"]],
  getCourse: ["query", ["Courses"]],
  saveCourse: ["mutation", ["Courses"]],
  deleteCourse: ["mutation", ["Courses"]],
  getReviews: ["query", ["Reviews"]],
  addReview: ["mutation", ["Reviews", "Teachers"]],
  saveProfile: [
    "mutation",
    ["Session", "Teachers", "Students", "Users", "Connections"],
  ],
  getConnections: ["query", ["Connections"]],
  connect: ["mutation", ["Connections"]],
  disconnect: ["mutation", ["Connections"]],
  getUsers: ["query", ["Users"]],
  setDisabled: ["mutation", ["Users", "Teachers", "Students", "Connections"]],
  deleteUser: [
    "mutation",
    ["Users", "Teachers", "Students", "Reviews", "Connections"],
  ],
};
export const api = createApi({
  reducerPath: "modernApi",
  baseQuery: async ({ operation, args }) => {
    try {
      return { data: await modernRequest(operation, args) };
    } catch (error) {
      return {
        error: {
          status: error.status || "CUSTOM_ERROR",
          data: { message: error.message },
        },
      };
    }
  },
  tagTypes: [
    "Session",
    "Teachers",
    "Students",
    "Courses",
    "Reviews",
    "Connections",
    "Users",
  ],
  endpoints: (builder) =>
    Object.fromEntries(
      Object.entries(definitions).map(([operation, [kind, tags]]) => [
        operation,
        builder[kind]({
          query: (args) => ({ operation, args }),
          [kind === "query" ? "providesTags" : "invalidatesTags"]: tags,
        }),
      ]),
    ),
});
export const {
  useGetMeQuery,
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGetTeachersQuery,
  useGetStudentsQuery,
  useGetTeacherQuery,
  useGetStudentQuery,
  useGetCoursesQuery,
  useGetCourseQuery,
  useSaveCourseMutation,
  useDeleteCourseMutation,
  useGetReviewsQuery,
  useAddReviewMutation,
  useSaveProfileMutation,
  useGetConnectionsQuery,
  useConnectMutation,
  useDisconnectMutation,
  useGetUsersQuery,
  useSetDisabledMutation,
  useDeleteUserMutation,
} = api;
export function createStore() {
  return configureStore({
    reducer: { [api.reducerPath]: api.reducer },
    middleware: (getDefault) => getDefault().concat(api.middleware),
  });
}
export function useSession() {
  const query = useGetMeQuery();
  return {
    user: query.data || null,
    loading: query.isLoading || query.isFetching,
  };
}
