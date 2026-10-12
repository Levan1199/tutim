const { test } = require("node:test");
const assert = require("node:assert/strict");

test("interface URLs preserve profiles, subject filters, course identity and account pages", async () => {
  const { routeForInterface } = await import("../client/src/uiPreference.js");
  const courses = [{ _id: "course-1", name: "Music & Art" }];
  const convert = (pathname, mode, extra = {}, search = "") =>
    routeForInterface({ pathname, search }, mode, { courses, ...extra });
  assert.equal(
    convert("/teachers/teacher-1", "legacy"),
    "/profile/teacher/teacher-1",
  );
  assert.equal(
    convert("/profile/student/student-1", "modern"),
    "/students/student-1",
  );
  assert.equal(
    convert("/courses/course-1", "legacy"),
    "/courseDetail/Music%20%26%20Art",
  );
  assert.equal(
    convert("/courseDetail/Music%20%26%20Art", "modern"),
    "/courses/course-1",
  );
  assert.equal(
    convert("/teachers", "legacy", {}, "?subject=Maths"),
    "/teacherList/Maths?subject=Maths",
  );
  assert.equal(
    convert("/teacherList/Maths", "modern"),
    "/teachers?subject=Maths",
  );
  assert.equal(
    convert("/profile", "legacy", { user: { teacherProfile: {} } }),
    "/profile/teacher",
  );
  assert.equal(
    convert("/connections", "legacy", { user: { studentProfile: {} } }),
    "/awaiting",
  );
  assert.equal(
    convert("/profile", "legacy", { user: { admin: true } }),
    "/admin/view",
  );
  assert.equal(convert("/profile", "legacy"), "/stepper");
  assert.equal(
    convert("/addresses", "legacy", {}, "?address=Demo"),
    "/addresses?address=Demo",
  );
  assert.equal(convert("/courses/missing", "legacy"), "/courses");
});
