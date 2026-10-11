const cors = require("cors");
const allowed = new Set(
  (
    process.env.CORS_ORIGINS ||
    "http://localhost:3001,http://127.0.0.1:3001,http://host.docker.internal:3001"
  ).split(","),
);
exports.corsWithOptions = cors({
  origin(origin, done) {
    if (!origin || allowed.has(origin)) done(null, true);
    else
      done(Object.assign(new Error("Origin is not allowed."), { status: 403 }));
  },
});
