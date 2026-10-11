const router = require("express").Router();
const Comments = require("../models/comments");
const Teacher = require("../models/teacherReg");
const auth = require("../authenticate");
const { fail, id, required } = require("./helpers");
router.get("/", async (req, res) =>
  res.json(await Comments.find().populate("commenter")),
);
router.post("/", auth.verifyUser, async (req, res) => {
  if (!req.user.studentProfile)
    fail(403, "A student profile is required to review a teacher.");
  const { commentTo, rating, comment } = req.body || {};
  const teacher = required(await Teacher.findById(id(commentTo)));
  if (
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5 ||
    typeof comment !== "string" ||
    !comment.trim() ||
    comment.length > 5000
  )
    fail(400, "Enter a rating from 1 to 5 and a comment.");
  const entry = await Comments.create({
    commenter: req.user.studentProfile,
    commentTo: teacher._id,
    rating,
    comment: comment.trim(),
  });
  await Teacher.updateOne(
    { _id: teacher._id },
    { $inc: { rate: rating, commentCount: 1 } },
  );
  res.json(await Comments.findById(entry._id).populate("commenter"));
});
router.delete("/", auth.verifyUser, auth.verifyAdmin, async (req, res) =>
  res.json(await Comments.deleteMany()),
);
module.exports = router;
