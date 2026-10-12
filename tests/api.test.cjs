const { test, after } = require("node:test");
const assert = require("node:assert/strict");
const { pbkdf2Sync } = require("node:crypto");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
process.env.JWT_SECRET = "isolated-test-secret-never-used-by-running-app";
const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../server/app");
const User = require("../server/models/user");
const Waiting = require("../server/models/waitingList");
const Teacher = require("../server/models/teacherReg");
const name = "tutim_v1_test_" + Date.now() + "_" + process.pid;
const uri =
  (process.env.TEST_MONGO_BASE || "mongodb://host.docker.internal:27017") +
  "/" +
  name;
let uploadDir;
after(async () => {
  if (mongoose.connection.readyState === 1) {
    assert.equal(mongoose.connection.name, name);
    assert.match(name, /^tutim_v1_test_\d+_\d+$/);
    await mongoose.connection.dropDatabase();
  }
  await mongoose.disconnect();
  if (uploadDir) await fs.rm(uploadDir, { recursive: true, force: true });
});
test("v1 workflows retain schema/password compatibility and enforce ownership", async (t) => {
  await mongoose.connect(uri, { autoIndex: false });
  uploadDir = await fs.mkdtemp(path.join(os.tmpdir(), "tutim-v1-uploads-"));
  process.env.PUBLIC_DIR = uploadDir;
  const api = request(app);
  await t.test("removed social sign-in endpoint returns 404", async () => {
    await api.get("/users/facebook/token").expect(404);
  });
  const salt = "legacy-test-salt";
  const legacy = await User.create({
    username: "legacy-admin",
    admin: true,
    salt,
    hash: pbkdf2Sync(
      "old-thesis-password",
      salt,
      25000,
      512,
      "sha256",
    ).toString("hex"),
  });
  let adminToken,
    teacherToken,
    studentToken,
    otherToken,
    teacher,
    student,
    studentUser;
  const login = async (username, password = "test-password") => {
    const res = await api
      .post("/users/login")
      .send({ username, password })
      .expect(200);
    assert.equal(res.body.success, true);
    assert.equal(typeof res.body.token, "string");
    return res.body.token;
  };
  const auth = (token) => ({ Authorization: "Bearer " + token });
  await t.test(
    "legacy PBKDF2 account logs in without changing its hash",
    async () => {
      adminToken = await login("legacy-admin", "old-thesis-password");
      assert.equal(
        (await User.collection.findOne({ _id: legacy._id })).hash ===
          legacy.hash,
        true,
        "Legacy password hash must remain unchanged",
      );
      await api
        .post("/users/login")
        .send({ username: "legacy-admin", password: "wrong" })
        .expect(401);
      const res = await api.get("/profile").set(auth(adminToken)).expect(200);
      assert.equal(res.body.admin, true);
      assert.equal(res.body.hash, undefined);
      assert.equal(res.body.salt, undefined);
      await api.get("/health").expect(200);
    },
  );
  await t.test(
    "signup ignores privileged fields, rejects duplicates, and returns empty profiles",
    async () => {
      for (const username of ["teacher-test", "student-test", "other-test"])
        await api
          .post("/users/signup")
          .send({
            username,
            password: "test-password",
            admin: true,
            isDisable: true,
          })
          .expect(200);
      await api
        .post("/users/signup")
        .send({ username: "student-test", password: "test-password" })
        .expect(409);
      teacherToken = await login("teacher-test");
      studentToken = await login("student-test");
      otherToken = await login("other-test");
      const res = await api.get("/profile").set(auth(studentToken)).expect(200);
      assert.equal(res.body.admin, false);
      assert.equal(res.body.teacherProfile, undefined);
      studentUser = res.body._id;
      await api.get("/admin/teacher").set(auth(studentToken)).expect(403);
      await api
        .post("/profile")
        .set(auth(studentToken))
        .send({ name: "Bad role", isTeacher: true, isStudent: true })
        .expect(400);
    },
  );
  await t.test(
    "profile creation and multipart update finish before returning data",
    async () => {
      teacher = (
        await api
          .post("/profile")
          .set(auth(teacherToken))
          .send({
            name: "Test Teacher",
            email: "teacher@example.test",
            isTeacher: true,
            isStudent: false,
          })
          .expect(200)
      ).body.teacherProfile;
      student = (
        await api
          .post("/profile")
          .set(auth(studentToken))
          .send({
            name: "Test Student",
            email: "student@example.test",
            isStudent: true,
            isTeacher: false,
          })
          .expect(200)
      ).body.studentProfile;
      await api
        .post("/profile")
        .set(auth(studentToken))
        .send({ name: "Duplicate", isStudent: true })
        .expect(409);
      const res = await api
        .put("/profile")
        .set(auth(teacherToken))
        .field("fee", "125000")
        .field("subject", '["Maths"]')
        .field("available", "true")
        .expect(200);
      assert.equal(res.body.teacherProfile.fee, 125000);
      assert.deepEqual(res.body.teacherProfile.subject, ["Maths"]);
      assert.equal(res.body.teacherProfile.available, true);
      await api
        .put("/profile")
        .set(auth(teacherToken))
        .field("subject", "bad-json")
        .expect(400);
      await api.get("/teacherReg/not-an-id").expect(400);
      await api
        .put("/teacherReg/" + teacher._id)
        .set(auth(studentToken))
        .send({ name: "Hijacked" })
        .expect(403);
    },
  );
  await t.test(
    "image upload accepts image bytes and rejects disguised files",
    async () => {
      const png = Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a9l8AAAAASUVORK5CYII=",
        "base64",
      );
      const res = await api
        .put("/profile")
        .set(auth(teacherToken))
        .attach("avatar", png, {
          filename: "../../avatar.png",
          contentType: "image/png",
        })
        .expect(200);
      assert.match(res.body.teacherProfile.imgPath, /^[\w-]+\.png$/);
      assert.equal(
        (
          await fs.readFile(
            path.join(uploadDir, "images", res.body.teacherProfile.imgPath),
          )
        ).equals(png),
        true,
      );
      await api
        .put("/profile")
        .set(auth(teacherToken))
        .attach("avatar", Buffer.from("not an image"), {
          filename: "fake.png",
          contentType: "image/png",
        })
        .expect(400);
      await api
        .put("/profile")
        .set(auth(teacherToken))
        .attach("avatar", Buffer.alloc(1048577), {
          filename: "large.png",
          contentType: "image/png",
        })
        .expect(413);
    },
  );
  await t.test(
    "connections respond, deduplicate, and reject another account identity",
    async () => {
      const body = { teacherId: teacher._id, studentId: student._id };
      await api
        .post("/awaiting/student")
        .set(auth(studentToken))
        .send(body)
        .expect(200);
      await api
        .post("/awaiting/student")
        .set(auth(studentToken))
        .send(body)
        .expect(200);
      assert.equal(await Waiting.countDocuments(), 1);
      const res = await api
        .get("/awaiting/student")
        .set(auth(studentToken))
        .expect(200);
      assert.equal(res.body[0].teacherId.name, "Test Teacher");
      await api
        .post("/awaiting/student")
        .set(auth(otherToken))
        .send(body)
        .expect(403);
      await api
        .post("/awaiting/teacher")
        .set(auth(teacherToken))
        .send({ ...body, teacherId: new mongoose.Types.ObjectId().toString() })
        .expect(403);
      await api
        .delete("/awaiting/student")
        .set(auth(studentToken))
        .send(body)
        .expect(200);
      assert.equal(await Waiting.countDocuments(), 0);
    },
  );
  await t.test(
    "student comments are validated and teacher rating updates are awaited",
    async () => {
      const before = await Teacher.findById(teacher._id);
      const res = await api
        .post("/comments")
        .set(auth(studentToken))
        .send({ commentTo: teacher._id, rating: 4, comment: "Helpful teacher" })
        .expect(200);
      assert.equal(res.body.commenter.name, "Test Student");
      const after = await Teacher.findById(teacher._id);
      assert.equal(after.rate, before.rate + 4);
      assert.equal(after.commentCount, before.commentCount + 1);
      await api
        .post("/comments")
        .set(auth(studentToken))
        .send({ commentTo: teacher._id, rating: 6, comment: "Invalid" })
        .expect(400);
      await api
        .post("/comments")
        .set(auth(teacherToken))
        .send({ commentTo: teacher._id, rating: 4, comment: "Not a student" })
        .expect(403);
    },
  );
  await t.test("admin course lifecycle and account disable work", async () => {
    await api
      .post("/course")
      .set(auth(studentToken))
      .field("name", '"Unauthorised"')
      .expect(403);
    let res = await api
      .post("/course")
      .set(auth(adminToken))
      .field("name", '"Test Maths"')
      .field("description", '"Intro"')
      .expect(200);
    assert.equal(res.body[0].name, "Test Maths");
    await api.get("/course/Test%20Maths").expect(200);
    res = await api
      .put("/course/Test%20Maths")
      .set(auth(adminToken))
      .field("name", '"Updated Maths"')
      .expect(200);
    assert.equal(res.body[0].name, "Updated Maths");
    await api
      .delete("/course/Updated%20Maths")
      .set(auth(adminToken))
      .expect(200);
    await api.get("/course/Updated%20Maths").expect(404);
    res = await api.get("/admin/student").set(auth(adminToken)).expect(200);
    assert.equal(res.body[0].hash, undefined);
    await api
      .put("/admin/student/" + studentUser)
      .set(auth(adminToken))
      .expect(200);
    await api.get("/profile").set(auth(studentToken)).expect(401);
    await api
      .post("/users/login")
      .send({ username: "student-test", password: "test-password" })
      .expect(401);
    await api
      .put("/admin/student/" + studentUser)
      .set(auth(adminToken))
      .expect(200);
    await login("student-test");
  });
  await t.test(
    "JSON errors and CORS origin restriction are consistent",
    async () => {
      await api.get("/unknown").expect(404).expect("Content-Type", /json/);
      await api
        .get("/course")
        .set("Origin", "https://untrusted.example")
        .expect(403);
      await api
        .options("/course")
        .set("Origin", "http://localhost:3001")
        .set("Access-Control-Request-Method", "POST")
        .expect(204);
    },
  );
  await t.test(
    "modern account actions enforce admin access and explicit disable state",
    async () => {
      await api
        .patch("/admin/accounts/" + studentUser)
        .set(auth(studentToken))
        .send({ isDisable: true })
        .expect(403);
      await api
        .patch("/admin/accounts/" + legacy._id)
        .set(auth(adminToken))
        .send({ isDisable: true })
        .expect(403);
      await api
        .delete("/admin/accounts/" + legacy._id)
        .set(auth(adminToken))
        .expect(403);
      await api
        .patch("/admin/accounts/" + studentUser)
        .set(auth(adminToken))
        .send({ isDisable: "true" })
        .expect(400);
      for (let i = 0; i < 2; i++) {
        const res = await api
          .patch("/admin/accounts/" + studentUser)
          .set(auth(adminToken))
          .send({ isDisable: true })
          .expect(200);
        assert.equal(res.body.isDisable, true);
      }
      await api
        .patch("/admin/accounts/" + studentUser)
        .set(auth(adminToken))
        .send({ isDisable: false })
        .expect(200);
    },
  );
  await t.test(
    "modern admin can inspect and remove one connection without removing others",
    async () => {
      const entry = await Waiting.create({
        studentId: student._id,
        teacherId: teacher._id,
      });
      const res = await api.get("/awaiting").set(auth(adminToken)).expect(200);
      assert.ok(
        res.body.find((item) => item._id === String(entry._id)).teacherId.name,
      );
      await api
        .delete("/awaiting/" + entry._id)
        .set(auth(studentToken))
        .expect(403);
      await api
        .delete("/awaiting/" + entry._id)
        .set(auth(adminToken))
        .expect(200);
      assert.equal(await Waiting.countDocuments({ _id: entry._id }), 0);
    },
  );
  await t.test(
    "modern deletion removes the account's profile, reviews and connections",
    async () => {
      const Student = require("../server/models/studentReg");
      const Comments = require("../server/models/comments");
      const profile = await Student.create({ name: "Disposable account" });
      const account = await User.register(
        new User({
          username: "delete-me",
          isStudent: true,
          studentProfile: profile._id,
        }),
        "test-password",
      );
      await Waiting.create({ teacherId: teacher._id, studentId: profile._id });
      await Comments.create({
        commenter: profile._id,
        commentTo: teacher._id,
        rating: 2,
        comment: "Disposable review",
      });
      await api
        .delete("/admin/accounts/" + account._id)
        .set(auth(studentToken))
        .expect(403);
      await api
        .delete("/admin/accounts/" + account._id)
        .set(auth(adminToken))
        .expect(200);
      assert.equal(await User.findById(account._id), null);
      assert.equal(await Student.findById(profile._id), null);
      assert.equal(
        await Comments.countDocuments({ commenter: profile._id }),
        0,
      );
      assert.equal(await Waiting.countDocuments({ studentId: profile._id }), 0);
      const reviews = await Comments.find({ commentTo: teacher._id });
      const updated = await Teacher.findById(teacher._id);
      assert.equal(updated.commentCount, reviews.length);
      assert.equal(
        updated.rate,
        reviews.reduce((sum, review) => sum + review.rating, 0),
      );
    },
  );
});
