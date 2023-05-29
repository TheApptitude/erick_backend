import subtaskModel from "../model/subtaskModel.js";
import userModel from "../model/userModel.js";
import taskModel from "../model/taskModel.js";




//create subtask

export const createSubtask = async (req, res) => {
    try {
      const { title, description, assignedUsers,task, createdBy,scheduledDateTime } = req.body;
  
      const existingTask = await taskModel.findOne({ _id: task });

      if (!existingTask) {
        return res.status(400).json({
          success: false,
          message: "Task id not found",
        });
      }

      // Check if any of the assigned users are already assigned to a task at the same time
    const existingTasks = await subtaskModel.find({
        assignedUsers: { $in: assignedUsers },
        scheduledDateTime: scheduledDateTime,
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
          message: "At least one user ID must be provided to create a subtask",
        });
      }
  
      const validUsers = await userModel.find({ _id: { $in: assignedUsers } });      
  
      if (validUsers.length !== assignedUsers.length) {
        return res.status(400).json({
          success: false,
          message: "One or more invalid user IDs were provided",
        });
      }
  
      // Create subtask
      const create = new subtaskModel({
        title,
        description,
        assignedUsers,
        task,
        scheduledDateTime,
        createdBy,
      });
  
      const savedSubTask = await create.save();
  
      // Update task model with the subtask ID
      const updateTask = await taskModel.findByIdAndUpdate(
        task,
        { $push: { subtasks: savedSubTask._id } },
        { new: true }
      );

      // Update user models of assigned users with the task ID
      const updateTasksInUsers = await userModel.updateMany(
        { _id: { $in: assignedUsers } },
        { $push: { subtasks: savedSubTask._id } }
      );
  
    //   console.log(updateTasksInUsers);
  
      if (!updateTask) {
        return res.status(400).json({
          success: false,
          message: "Failed to update the corresponding task with the subtask ID",
        });
      }
  
      console.log(updateTask);
  
      return res.status(200).json({
        success: true,
        message: "Subtask created successfully and assigned to the task",
        data: savedSubTask,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  };
  

  //get subtask

export const getSubTask = async(req,res)=>{

    try {
        const foundsubtask=await subtaskModel.find().populate(["assignedUsers","createdBy"]);

        if(!foundsubtask){
            return res.status(400).json({
                success:false,
                message:"sub task not found"
            })
        }

        return res.status(200).json({
            success:true,
            message:"sub task found successfully",
            data:foundsubtask
        })
    } catch (error) {
        return res.status(500).json({
          success: false,
          message: "Internal server error",
          error: error.message,
        });
      }

};  