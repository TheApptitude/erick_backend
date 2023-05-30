import taskModel from "../model/taskModel.js"
import userModel from "../model/userModel.js";


//create task


export const createTask = async (req, res) => {
    try {
      const {user_id}=req.user;
      const { title, description, assignedUsers, scheduledDateTime,day } = req.body;
  
      
      const existingTasks = await taskModel.find({
        assignedUsers: { $in: assignedUsers },
        scheduledDateTime: scheduledDateTime,
        day:day
      });
  
      if (existingTasks.length > 0) {
        return res.status(400).json({
          success: false,
          message: "User is already assigned to a task at the same time",
        });
      }

            // Check if assignedUsers is empty or not provided
      if (!assignedUsers || assignedUsers.length === 0) {
        return res.status(400).json({
          success: false,
          message: "At least one user ID must be provided to create a task",
        });
      }
  
      // Validate assignedUsers
      const validUsers = await userModel.find({ _id: { $in: assignedUsers } });
  
      if (validUsers.length !== assignedUsers.length) {
        return res.status(400).json({
          success: false,
          message: "One or more invalid user IDs were provided",
        });
      }
  
      // Create the task
      const create = new taskModel({
        title,
        description,
        assignedUsers,
        day,
        createdBy:user_id,
        scheduledDateTime
      });
  
      const savedTask = await create.save();
  
//       const savedTask = await create.save();
  
      console.log(savedTask);
  
      // Update user models of assigned users with the task ID
      const updateTasksInUsers = await userModel.updateMany(
        { _id: { $in: assignedUsers } },
        { $push: { tasks: savedTask._id } }
      );


      return res.status(200).json({
        success: true,
        message: "Task created successfully and assigned to the task",
        data: savedTask
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message
      });
    }
  };



  
  
//get task
export const getTask = async (req, res) => {
  try {
    const { user_id } = req.user;
    const foundTasks = await taskModel.find({ createdBy: user_id }).populate(["assignedUsers", "createdBy", "subTasks"]);

    if (!foundTasks || foundTasks.length === 0) {
      return res.status(404).json({
        success: false,
        message: "task id not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Tasks found successfully",
      data: foundTasks,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
 


//get task by id


export const getTaskById = async (req, res) => {
  try {
    const { user_id } = req.user;
    const { id } = req.params;

    const foundTaskById = await taskModel.findOne({ _id: id, createdBy: user_id }).populate(["assignedUsers", "createdBy", "subtasks"]);

    if (!foundTaskById) {
      return res.status(400).json({
        success: false,
        message: "Task ID not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Task found successfully",
      data: foundTaskById,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};


//update task 

export const updateTask=async(req,res)=>{
 
  
  try {
  
    const {id}=req.params;
    const {user_id}=req.user;
    const {title,description,assignedUsers,day,scheduledDateTime}=req.body;


    const existingTasks = await taskModel.find({
      assignedUsers: { $in: assignedUsers },
      scheduledDateTime: scheduledDateTime,
      day:day
    });

    if (existingTasks.length > 0) {
      return res.status(400).json({
        success: false,
        message: "User is already assigned to a task at the same time",
      });
    }

       // Check if assignedUsers is empty or not provided
       if (!assignedUsers || assignedUsers.length === 0) {
        return res.status(400).json({
          success: false,
          message: "At least one user ID must be provided to create a task",
        });
      }
  
      // Validate assignedUsers
      const validUsers = await userModel.find({ _id: { $in: assignedUsers } });
  
      if (validUsers.length !== assignedUsers.length) {
        return res.status(400).json({
          success: false,
          message: "One or more invalid user IDs were provided",
        });
      }

    const update=await taskModel.findByIdAndUpdate(id,{


      title,
      description,
      assignedUsers,
      day,
      scheduledDateTime,
      createdBy:user_id

    },
    {
      new:true
    })   
     

    if(!update){
      return res.status(400).json({
        success:false,
        message:"task not update"
      })
    }

    return res.status(200).json({
      success:true,
      message:"task update successfully",
      data:update
    }) 

  }
  
  catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}


//delete task


export const deleteTask=async(req,res)=>{
  try {
    const {user_id}=req.user;
    const {id}=req.params;

    const task=await taskModel.findOne({_id:id,createdBy:user_id});


    console.log(task);
    if(!task){
      return res.status(400).json({
        success:false,
        message:"task not found"
      })
    }


    //delete task

    const Task=await taskModel.findByIdAndDelete(id);

    //remove task id in user model

    await userModel.updateMany(
      {_id:{$in:task.assignedUsers}},
      {$pull:{tasks:id}}
    )

    return res.status(200).json({
      success:true,
      message:"task delete successfully"
    })

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}

