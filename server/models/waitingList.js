const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const waitingListSchema = new Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "StudentReg",
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TeacherReg",
  },
});

var WaitingLists = mongoose.model("WaitingList", waitingListSchema);
module.exports = WaitingLists;
