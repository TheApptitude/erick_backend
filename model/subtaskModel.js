import mongoose from "mongoose";

const subtasksSchema = new mongoose.Schema({
  subTaskTitle: {
    type: String,
    required: true,
  },

  subTaskDescription: {
    type: String,
    required: true,
  },

  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "tasks",
  },

  scheduledDateTime: {
    type: Date,
    required: true,
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  },
});

const subtaskModel = mongoose.model("subtasks", subtasksSchema);

export default subtaskModel;
