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
    ref: 'User',
}],

subtasks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'subtasks',
}],

 day: {
    type: String,
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
  
},
{
    timestamps:true
}
)

const taskModel=mongoose.model("tasks",taskSchema);

export default taskModel;