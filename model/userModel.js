import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
  name: {
    type: String,
    default: "",
  },
  email: {
    type: String,
    required: true,
    match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/,
  },
  password: {
    type: String,
    required: true,
  },
  otpEmail: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "otp",
  },
  otpVerified: {
    type: Boolean,
    default: false,
  },
  tasks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "tasks",
  }],
  subtasks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "subtasks",
  }],
});

const userModel = mongoose.model("users", userSchema);
export default userModel;
