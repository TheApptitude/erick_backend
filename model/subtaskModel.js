import mongoose from "mongoose";

const subtasksSchema=new mongoose.Schema({


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

    task: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'tasks',
      },
      
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

const subtaskModel=mongoose.model("subtasks",subtasksSchema);

export default subtaskModel;