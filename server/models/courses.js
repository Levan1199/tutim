const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const courseSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
  imgPath: {
    type: String,
    default: "",
  },
});

var Course = mongoose.model("Course", courseSchema);

module.exports = Course;
