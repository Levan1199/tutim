const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const studentRegSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      default: "",
    },
    telnum: {
      type: String,
      default: "",
    },
    district: [
      {
        type: String,
        default: "",
      },
    ],
    address: {
      type: String,
      default: "",
    },
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
    description: {
      type: String,
      default: "",
    },
    imgPath: {
      type: String,
      default: "",
    },
    available: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

var StudentReg = mongoose.model("StudentReg", studentRegSchema);

module.exports = StudentReg;
