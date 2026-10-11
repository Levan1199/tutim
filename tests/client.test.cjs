const { test, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const originalFetch = global.fetch;
global.localStorage = { getItem: () => null };
afterEach(() => {
  global.fetch = originalFetch;
});
test("shared resource state keeps lists isolated and preserves comments while refreshing", async () => {
  const {
    ConfigureStore,
    addTeacherReg,
    addStudentReg,
    addComments,
    loadComment,
    commentsFailed,
    addCourseInfo,
    addOneCourse,
  } = await import("../client/src/store.js");
  const store = ConfigureStore();
  store.dispatch(addTeacherReg([{ _id: "teacher-1" }]));
  store.dispatch(addStudentReg([{ _id: "student-1" }]));
  assert.deepEqual(store.getState().teacherRegs.teacherRegs, [
    { _id: "teacher-1" },
  ]);
  assert.deepEqual(store.getState().studentRegs.studentRegs, [
    { _id: "student-1" },
  ]);
  store.dispatch(addComments([{ _id: "review-1" }]));
  store.dispatch(loadComment());
  assert.equal(store.getState().comments.isLoading, true);
  assert.deepEqual(store.getState().comments.comments, [{ _id: "review-1" }]);
  store.dispatch(commentsFailed("Connection lost"));
  assert.deepEqual(store.getState().comments.comments, []);
  assert.equal(store.getState().comments.errMess, "Connection lost");
  store.dispatch(addCourseInfo([{ name: "Maths" }]));
  store.dispatch(addOneCourse({ name: "English" }));
  assert.deepEqual(store.getState().courseInfo.courseInfo, [
    { name: "Maths" },
    { name: "English" },
  ]);
});
test("request helper encodes JSON, preserves multipart, reports API errors and handles 204", async () => {
  const { apiRequest, imageForm } = await import("../client/src/store.js");
  let sent;
  global.fetch = async (url, options) => {
    sent = { url, ...options };
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  };
  await apiRequest("profile", {
    method: "POST",
    body: { name: "Test" },
    token: "jwt",
  });
  assert.equal(sent.url, "/api/profile");
  assert.equal(sent.headers.Authorization, "Bearer jwt");
  assert.equal(sent.headers["Content-Type"], "application/json");
  assert.deepEqual(JSON.parse(sent.body), { name: "Test" });
  const file = new File(["image"], "test.png", { type: "image/png" }),
    form = imageForm(
      { avatar: file, name: "Test", missing: undefined },
      "avatar",
    );
  await apiRequest("profile", { method: "PUT", body: form });
  assert.equal(sent.body, form);
  assert.equal(sent.headers["Content-Type"], undefined);
  assert.equal(form.get("missing"), null);
  global.fetch = async () => new Response(null, { status: 204 });
  assert.equal(await apiRequest("profile"), null);
  global.fetch = async () =>
    new Response(JSON.stringify({ message: "Account disabled" }), {
      status: 403,
    });
  await assert.rejects(() => apiRequest("profile"), {
    message: "Account disabled",
    status: 403,
  });
  global.fetch = async () => new Response("Unavailable", { status: 503 });
  await assert.rejects(() => apiRequest("profile"), {
    message: "Request failed (503)",
    status: 503,
  });
});
