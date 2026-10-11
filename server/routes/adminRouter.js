const router = require("express").Router();
const User = require("../models/user");
const auth = require("../authenticate");
const { id, required } = require("./helpers");
router.use(auth.verifyUser, auth.verifyAdmin);
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
