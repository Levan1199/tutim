const router = require("express").Router();
const User = require("../models/user");
const Teacher = require("../models/teacherReg");
const Student = require("../models/studentReg");
const auth = require("../authenticate");
const upload = require("./uploadRouter");
const { fail, required, pick, multipart, profileFields } = require("./helpers");
const profile = (id) =>
  User.findById(id).populate("teacherProfile studentProfile");
router.use(auth.verifyUser);
router.get("/", async (req, res) => res.json(await profile(req.user._id)));
router.post("/", async (req, res) => {
  const user = req.user;
  if (user.admin || user.teacherProfile || user.studentProfile)
    fail(409, "This account already has a role.");
  const teacher = req.body.isTeacher === true,
    student = req.body.isStudent === true;
  if (teacher === student) fail(400, "Choose either student or teacher.");
  const entry = await (teacher ? Teacher : Student).create(
    pick(req.body, ["name", "email"]),
  );
  user.isTeacher = teacher;
  user.isStudent = student;
  user[teacher ? "teacherProfile" : "studentProfile"] = entry._id;
  try {
    await user.save();
  } catch (error) {
    await entry.deleteOne();
    throw error;
  }
  res.json(await profile(user._id));
});
router.put("/", upload.single("avatar"), async (req, res) => {
  const user = req.user,
    teacher = Boolean(user.isTeacher);
  const ref = user[teacher ? "teacherProfile" : "studentProfile"];
  if (!ref) fail(403, "Create a profile first.");
  const fields = pick(multipart(req.body), profileFields);
  if (req.file) fields.imgPath = req.file.filename;
  required(
    await (teacher ? Teacher : Student).findByIdAndUpdate(
      ref,
      { $set: fields },
      { returnDocument: "after", runValidators: true },
    ),
  );
  res.json(await profile(user._id));
});
module.exports = router;
