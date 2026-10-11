const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const teacherRegSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    telnum: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      default: "",
    },
    district: [
      {
        type: String,
        default: "",
      },
    ],
    grade: [
      {
        type: String,
        default: "",
      },
    ],
    subject: [
      {
        type: String,
        default: "",
      },
    ],
    fee: {
      type: Number,
      default: 0,
    },
    weekly: [
      {
        type: Number,
        default: 0,
      },
    ],
    available: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      default: "",
    },
    imgPath: {
      type: String,
      default: "",
    },
    rate: {
      type: Number,
      default: 3,
    },
    commentCount: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  },
);

var TeacherReg = mongoose.model("TeacherReg", teacherRegSchema);

module.exports = TeacherReg;
