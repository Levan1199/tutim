const router = require("express").Router();
const Waiting = require("../models/waitingList");
const Teacher = require("../models/teacherReg");
const Student = require("../models/studentReg");
const auth = require("../authenticate");
const { fail, id, required } = require("./helpers");
router.use(auth.verifyUser);
router.get("/", auth.verifyAdmin, async (req, res) =>
  res.json(await Waiting.find()),
);
router.delete("/", auth.verifyAdmin, async (req, res) =>
  res.json(await Waiting.deleteMany()),
);
for (const role of ["student", "teacher"]) {
  const own = role + "Id",
    other = role === "student" ? "teacherId" : "studentId";
  function owner(req) {
    const ref = req.user[role + "Profile"];
    if (!ref) fail(403, "This account does not have a " + role + " profile.");
    return ref;
  }
  function filter(req) {
    const self = owner(req);
    if (req.body?.[own] && String(req.body[own]) !== String(self))
      fail(403, "You can only manage your own connections.");
    return { [own]: self, [other]: id(req.body?.[other]) };
  }
  router.get("/" + role, async (req, res) =>
    res.json(await Waiting.find({ [own]: owner(req) }).populate(other)),
  );
  router.post("/" + role, async (req, res) => {
    const values = filter(req);
    required(
      await (role === "student" ? Teacher : Student).findById(values[other]),
    );
    let entry = await Waiting.findOne(values);
    if (!entry) entry = await Waiting.create(values);
    res.json(entry);
  });
  router.delete("/" + role, async (req, res) => {
    await Waiting.deleteOne(filter(req));
    res.json({ success: true });
  });
}
module.exports = router;
