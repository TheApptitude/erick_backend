import taskModel from "../model/taskModel.js"
import userModel from "../model/userModel.js";


//create task


export const createTask = async (req, res) => {
    try {
      const { title, description, assignedUsers, scheduledDateTime,day,createdBy } = req.body;
  
      
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
        createdBy,
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
export const getTask=async(req,res)=>{
    try {
    
        const foundtask=await taskModel.find().populate(["assignedUsers","createdBy","subtasks"]);

        if(!foundtask){
            return res.status(400).json({
                success:false,
                message:"task not found"
            })
        }

        return res.status(200).json({
            success:true,
            message:"task found succesfully",
            data:foundtask
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