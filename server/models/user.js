var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var passportLocalMongoose = require("passport-local-mongoose").default;

var User = new Schema({
  admin: { type: Boolean, default: false },
  isDisable: { type: Boolean, default: false },
  teacherProfile: { type: mongoose.Schema.Types.ObjectId, ref: "TeacherReg" },
  studentProfile: { type: mongoose.Schema.Types.ObjectId, ref: "StudentReg" },
  isTeacher: { type: Boolean },
  isStudent: { type: Boolean },
});

// Explicit v1 PBKDF2 parameters retain compatibility with every existing salt/hash.
User.plugin(passportLocalMongoose, {
  iterations: 25000,
  keylen: 512,
  digestAlgorithm: "sha256",
  saltlen: 32,
});
User.set("toJSON", {
  transform(doc, value) {
    delete value.hash;
    delete value.salt;
    return value;
  },
});

module.exports = mongoose.model("User", User);
