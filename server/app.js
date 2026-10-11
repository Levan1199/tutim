require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env"),
  quiet: true,
});
const express = require("express");
const helmet = require("helmet");
const passport = require("passport");
const mongoose = require("mongoose");
const path = require("path");
const app = express();
app.disable("x-powered-by");
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(require("./routes/cors").corsWithOptions);
app.use(express.json({ limit: "64kb" }));
app.use(express.urlencoded({ extended: false, limit: "64kb" }));
app.use(
  express.static(process.env.PUBLIC_DIR || path.join(__dirname, "public")),
);
app.use(passport.initialize());
app.get("/", (_, res) => res.json({ name: "TUTIM classic API" }));
app.get("/health", (_, res) =>
  res
    .status(mongoose.connection.readyState === 1 ? 200 : 503)
    .json({
      status:
        mongoose.connection.readyState === 1 ? "ok" : "database unavailable",
    }),
);
for (const [route, file] of Object.entries({
  users: "users",
  comments: "commentRouter",
  teacherReg: "teacherRegRouter",
  studentReg: "studentRegRouter",
  profile: "profileRouter",
  course: "courseRouter",
  awaiting: "waitingListRouter",
  admin: "adminRouter",
}))
  app.use("/" + route, require("./routes/" + file));
app.use((req, res) => res.status(404).json({ message: "Not found" }));
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  let status = err.status || err.statusCode || 500;
  if (
    ["ValidationError", "CastError", "SyntaxError", "MulterError"].includes(
      err.name,
    )
  )
    status = err.code === "LIMIT_FILE_SIZE" ? 413 : 400;
  if (err.code === 11000 || err.name === "UserExistsError") status = 409;
  if (status >= 500) console.error(err.name + ": " + err.message);
  res
    .status(status)
    .json({
      message:
        status >= 500 ? "The request could not be completed." : err.message,
    });
});
module.exports = app;
