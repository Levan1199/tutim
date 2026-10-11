const router = require("express").Router();
const Course = require("../models/courses");
const auth = require("../authenticate");
const upload = require("./uploadRouter");
const { required, pick, multipart } = require("./helpers");
function fields(req) {
  const data = pick(multipart(req.body), ["name", "description"]);
  if (req.file) data.imgPath = req.file.filename;
  return data;
}
router.get("/", async (req, res) => res.json(await Course.find()));
router.get("/:courseName", async (req, res) =>
  res.json(required(await Course.findOne({ name: req.params.courseName }))),
);
router.post(
  "/",
  auth.verifyUser,
  auth.verifyAdmin,
  upload.single("courseImg"),
  async (req, res) => {
    await Course.create(fields(req));
    res.json(await Course.find());
  },
);
router.put(
  "/:courseName",
  auth.verifyUser,
  auth.verifyAdmin,
  upload.single("courseImg"),
  async (req, res) => {
    required(
      await Course.findOneAndUpdate(
        { name: req.params.courseName },
        { $set: fields(req) },
        { runValidators: true, returnDocument: "after" },
      ),
    );
    res.json(await Course.find());
  },
);
router.delete(
  "/:courseName",
  auth.verifyUser,
  auth.verifyAdmin,
  async (req, res) => {
    required(await Course.findOneAndDelete({ name: req.params.courseName }));
    res.json({ success: true });
  },
);
module.exports = router;
