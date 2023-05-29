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
        ref: 'users',
    }],

    task: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'tasks',
      },
      
   
      scheduledDateTime: {
        type: Date,
        required: true,
      },

    createdBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
    },

      

},

)

const subtaskModel=mongoose.model("subtasks",subtasksSchema);

export default subtaskModel;