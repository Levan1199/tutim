const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentSchema = new Schema(
  {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
    commenter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentReg",
    },
    commentTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TeacherReg",
    },
  },
  {
    timestamps: true,
  },
);

var Comments = mongoose.model("Comment", commentSchema);
module.exports = Comments;
