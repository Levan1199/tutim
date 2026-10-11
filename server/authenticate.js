const passport = require("passport");
const { Strategy: LocalStrategy } = require("passport-local");
const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");
const jwt = require("jsonwebtoken");
const User = require("./models/user");
const config = require("./config");
if (!config.secretKey) throw new Error("Set JWT_SECRET in the root .env file.");
passport.use(new LocalStrategy(User.authenticate()));
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.secretKey,
      algorithms: ["HS256"],
    },
    async (payload, done) => {
      try {
        const user = await User.findById(payload._id);
        done(null, user && !user.isDisable ? user : false);
      } catch (error) {
        done(error, false);
      }
    },
  ),
);
exports.getToken = (user) =>
  jwt.sign({ _id: String(user._id) }, config.secretKey, {
    algorithm: "HS256",
    expiresIn: 3600,
  });
exports.verifyUser = passport.authenticate("jwt", { session: false });
exports.verifyAdmin = (req, res, next) =>
  req.user?.admin
    ? next()
    : res.status(403).json({ message: "Administrator access required." });
