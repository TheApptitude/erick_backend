import subtaskModel from "../model/subtaskModel.js";
import taskModel from "../model/taskModel.js";
import userModel from "../model/userModel.js";

//create task

export const createTask = async (req, res) => {
  try {
    const { user_id } = req.user;
    const { title, description, assignedUsers, scheduledDateTime, day } =
      req.body;
    console.log("userId:", user_id);

    const findUser=await userModel.findOne({_id:user_id});

    if(!findUser){
      return res.status(400).json({
        success: false,
        message: "user not found",
      });
    }

    const existingTasks = await taskModel.find({
      assignedUsers: { $in: assignedUsers },
      scheduledDateTime: scheduledDateTime,
      // day: day,
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
    const createdTask = new taskModel({
      title,
      description,
      assignedUsers,
      day,
      createdBy: user_id,
      scheduledDateTime,
    });

    const saveTask = await createdTask.save();

    // Update user models of assigned users with the task ID
    const updateTasksInUsers = await userModel.updateMany(
      { _id: { $in: assignedUsers } },
      { $push: { tasks: saveTask._id } }
    );

    return res.status(200).json({
      success: true,
      message: "Task created successfully and assigned to the user",
      data: saveTask,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

//get task
export const getTask = async (req, res) => {
  try {
    const { user_id } = req.user;

     const userfind=await userModel.findById(user_id);
     if(!userfind){
      return res.status(400).json({
        success:false,
        message:"user not found"
      })
     }
    const foundTasks = await taskModel
      .find({ createdBy: user_id })
      .populate(["assignedUsers", "createdBy", "subTasks"]);

    if (!foundTasks || foundTasks.length === 0) {
      return res.status(404).json({
        success: false,
        message: "user is not found",
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

    const findUser=await userModel.findOne({_id:user_id});

    if(!findUser){
      return res.status(400).json({
        success: false,
        message: "user not found",
      });
    }

    const findTask=await taskModel.findOne({_id:id});

    if(!findTask){
      return res.status(400).json({
        success: false,
        message: "task id not found",
      });
    }
    const foundTaskById = await taskModel
      .findOne({ _id: id, createdBy: user_id })
      .populate(["assignedUsers", "createdBy", "subTasks"]);

    // if (!foundTaskById) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Task ID not found",
    //   });
    // }

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

export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.user;
    const { title, description, assignedUsers, day, scheduledDateTime } =
      req.body;

    // const existingTasks = await taskModel.find({
    //   assignedUsers: { $in: assignedUsers },
    //   scheduledDateTime: scheduledDateTime,
    //   day:day
    // });

    // if (existingTasks.length > 0) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "User is already assigned to a task at the same time",
    //   });
    // }
    
    //find user

    const findUser=await userModel.findOne({_id:user_id});

    if(!findUser){
      return res.status(400).json({
        success:false,
        message:"user not found"
      })
    }

    //check task found or not
    const findTask=await taskModel.findOne({_id:id});
    if(!findTask || findTask.length===0){
      return res.status(400).json({
        success:false,
        message:"Task ID not found"
      })
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

      // Remove task ID from previous assigned users
      await userModel.updateMany(
        { tasks: id },
        { $pull: { tasks: id } }
      )
    const update = await taskModel.findByIdAndUpdate(
      id,
      {
        title,
        description,
        assignedUsers,
        day,
        scheduledDateTime,
        createdBy: user_id,
      },
      {
        new: true,
      }
    );

    
    // Add the task ID to the assigned users in userModel
    await userModel.updateMany(
      { _id: { $in: assignedUsers } },
      { $push: { tasks: id } }
    );

    if (!update) {
      return res.status(400).json({
        success: false,
        message: "task not update",
      });
    }

    return res.status(200).json({
      success: true,
      message: "task update successfully",
      data: update,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

//delete task

export const deleteTask = async (req, res) => {
  try {
    const { user_id } = req.user;
    const { id } = req.params;


    //find user

    const findUser=await userModel.findOne({_id:user_id});

    if(!findUser){
      return res.status(400).json({
        success:false,
        message:"user not found"
      })
    }


    const task = await taskModel.findOne({ _id: id, createdBy: user_id });

    if (!task) {
      return res.status(400).json({
        success: false,
        message: "Task ID not found",
      });
    }

    // Delete associated subtasks
    await subtaskModel.deleteMany({ _id: { $in: task.subTasks } });

    // Delete task
    await taskModel.findByIdAndDelete(id);

    // Remove task ID from user model
    await userModel.updateMany(
      { _id: { $in: task.assignedUsers } },
      { $pull: { tasks: id } }
    );
    // Remove task ID from user model
    // await userModel.updateMany(
    //   { _id: { $in: task.assignedUsers } },
    //   { $pull: { subtasks: id } }
    // );

    // Remove sub task ID associeted with task from user model
    await userModel.updateMany(
      { _id: { $in: task.assignedUsers } },
      { $pull: { tasks: id, subtasks: { $in: task.subTasks } } }
    );

    return res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
