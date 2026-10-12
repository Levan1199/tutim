const { test } = require("node:test");
const assert = require("node:assert/strict");

test("demo data is fictional, independent of returned objects, and rejects account access and writes", async () => {
  const { demoRequest, demoCourses } =
    await import("../client/src/demoData.js");
  const teachers = demoRequest("teacherReg");
  assert.equal(teachers.length, 12);
  assert.ok(teachers.every((p) => p.email.endsWith("@example.invalid")));
  assert.ok(teachers.some((p) => !p.available));
  assert.ok(
    teachers.some(
      (p) =>
        p.available &&
        p.subject.includes("Maths") &&
        p.grade.includes("Grade 10"),
    ),
  );
  teachers[0].name = "Changed only in the returned copy";
  assert.notEqual(demoRequest("teacherReg")[0].name, teachers[0].name);
  assert.equal(
    demoRequest("course/" + encodeURIComponent(demoCourses[0].name))._id,
    demoCourses[0]._id,
  );
  for (const method of ["POST", "PUT", "PATCH", "DELETE"])
    assert.throws(() => demoRequest("course", { method }), { status: 403 });
  for (const path of ["profile", "users", "admin/teacher"])
    assert.throws(() => demoRequest(path), { status: 401 });
  assert.throws(() => demoRequest("teacherReg/missing"), { status: 404 });
});
