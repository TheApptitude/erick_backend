import mongoose from "mongoose";

const taskSchema=new mongoose.Schema({


title:{
    type:String,
    required:true
},

description:{
    type:String,
    required:true
},

assignedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
}],

subTasks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'subtasks',
}],

createdBy:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
},

  day: {
    type: String,
    required: true,
  },

  scheduledDateTime: {
    type: Date,
    required: true,
  },

  
},

)

const taskModel=mongoose.model("tasks",taskSchema);

export default taskModel;