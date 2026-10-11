const router = require("express").Router();
const passport = require("passport");
const { rateLimit } = require("express-rate-limit");
const User = require("../models/user");
const auth = require("../authenticate");
const { fail } = require("./helpers");
const limit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 50,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Too many sign-in attempts. Please try again later." },
});
router.get("/", auth.verifyUser, auth.verifyAdmin, async (req, res) =>
  res.json(await User.find().populate("teacherProfile studentProfile")),
);
router.post("/signup", limit, async (req, res) => {
  const { username, password } = req.body || {};
  if (
    typeof username !== "string" ||
    !username.trim() ||
    username.length > 100 ||
    typeof password !== "string" ||
    !password ||
    password.length > 256
  )
    fail(400, "Enter a username and password.");
  await User.register(new User({ username: username.trim() }), password);
  res.json({ success: true, status: "Registration Successful" });
});
router.post("/login", limit, (req, res, next) =>
  passport.authenticate("local", { session: false }, (error, user) => {
    if (error) return next(error);
    if (!user || user.isDisable)
      return res
        .status(401)
        .json({ message: "Wrong password or username, or account disabled." });
    res.json({
      success: true,
      status: "Login Successful",
      token: auth.getToken(user),
    });
  })(req, res, next),
);
router.get("/checkJWTToken", auth.verifyUser, (req, res) =>
  res.json({ success: true, status: "JWT valid!", user: req.user }),
);
router.get("/logout", (req, res) => res.json({ success: true }));
module.exports = router;
