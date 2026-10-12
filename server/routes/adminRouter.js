const router = require("express").Router();
const User = require("../models/user");
const auth = require("../authenticate");
const Teacher = require("../models/teacherReg");
const Student = require("../models/studentReg");
const Comments = require("../models/comments");
const Waiting = require("../models/waitingList");
const { fail, id, required } = require("./helpers");
router.use(auth.verifyUser, auth.verifyAdmin);
// The modern dashboard uses explicit account state instead of toggling blindly.
router.patch("/accounts/:userId", async (req, res) => {
  const user = required(await User.findById(id(req.params.userId)));
  if (user.admin) fail(403, "Admin accounts cannot be disabled.");
  if (typeof req.body.isDisable !== "boolean")
    fail(400, "Choose whether the account is disabled.");
  user.isDisable = req.body.isDisable;
  await user.save();
  res.json(user);
});
router.delete("/accounts/:userId", async (req, res) => {
  const user = required(await User.findById(id(req.params.userId)));
  if (user.admin) fail(403, "Admin accounts cannot be deleted.");
  const affectedTeachers = user.studentProfile
    ? await Comments.find({ commenter: user.studentProfile }).distinct(
        "commentTo",
      )
    : [];
  if (user.teacherProfile) {
    await Waiting.deleteMany({ teacherId: user.teacherProfile });
    await Comments.deleteMany({ commentTo: user.teacherProfile });
    await Teacher.deleteOne({ _id: user.teacherProfile });
  }
  if (user.studentProfile) {
    await Waiting.deleteMany({ studentId: user.studentProfile });
    await Comments.deleteMany({ commenter: user.studentProfile });
    await Student.deleteOne({ _id: user.studentProfile });
    for (const teacherId of affectedTeachers) {
      const reviews = await Comments.find({ commentTo: teacherId });
      await Teacher.updateOne(
        { _id: teacherId },
        {
          $set: {
            rate: reviews.reduce((sum, review) => sum + review.rating, 0),
            commentCount: reviews.length,
          },
        },
      );
    }
  }
  await user.deleteOne();
  res.json({ success: true });
});
for (const role of ["student", "teacher"]) {
  const flag = role === "student" ? "isStudent" : "isTeacher",
    ref = role + "Profile";
  router.get("/" + role, async (req, res) =>
    res.json(await User.find({ [flag]: true }).populate(ref)),
  );
  router.get("/" + role + "/:userId", async (req, res) =>
    res.json(
      required(
        await User.findOne({
          _id: id(req.params.userId),
          [flag]: true,
        }).populate(ref),
      ),
    ),
  );
  router.put("/" + role + "/:userId", async (req, res) => {
    const user = required(
      await User.findOne({ _id: id(req.params.userId), [flag]: true }),
    );
    user.isDisable = !user.isDisable;
    await user.save();
    res.json(user);
  });
  router.delete("/" + role, async (req, res) =>
    res.json(await User.deleteMany({ [flag]: true, admin: false })),
  );
}
module.exports = router;
