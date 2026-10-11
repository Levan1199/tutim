const mongoose = require("mongoose");
exports.fail = (status, message) => {
  throw Object.assign(new Error(message), { status });
};
exports.id = (value) => {
  if (typeof value !== "string" || !mongoose.isObjectIdOrHexString(value))
    exports.fail(400, "Invalid document ID.");
  return value;
};
exports.required = (value) => {
  if (!value) exports.fail(404, "Document not found.");
  return value;
};
exports.pick = (input, fields) =>
  Object.fromEntries(
    fields
      .filter((key) => Object.hasOwn(input || {}, key))
      .map((key) => [key, input[key]]),
  );
exports.multipart = (body) =>
  Object.fromEntries(
    Object.entries(body || {}).map(([key, value]) => {
      if (["avatar", "courseImg"].includes(key)) return [key, undefined];
      try {
        return [key, JSON.parse(value)];
      } catch {
        exports.fail(400, "Invalid field: " + key);
      }
    }),
  );
exports.profileFields = require("../../shared/options.json").profileFields;
