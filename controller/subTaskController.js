import subtaskModel from "../model/subtaskModel.js";
import userModel from "../model/userModel.js";
import taskModel from "../model/taskModel.js";




//create subtask




export const createSubtask = async (req, res) => {
  try {
    const { user_id } = req.user;
    const { subTaskTitle, subTaskDescription, task, scheduledDateTime } = req.body;
    console.log("userId:",user_id);

    const existingTask = await taskModel.findOne({ _id: task });

    if (!existingTask) {
      return res.status(400).json({
        success: false,
        message: "Task id not found",
      });
    }

    const create = new subtaskModel({
      subTaskTitle,
      subTaskDescription,
      task,
      scheduledDateTime,
      createdBy: user_id, // Store the user ID of the creator in createdBy
    });

    const savedSubTask = await create.save();

    const updateTask = await taskModel.findByIdAndUpdate(
      task,
      { $push: { subTasks: savedSubTask._id } },
      { new: true }
    );

    // Update user models of assigned users with the subtask ID
    const updateUsers = await userModel.updateMany(
      { _id: { $in: existingTask.assignedUsers } },
      { $push: { subtasks: savedSubTask._id } }
    );

    if (!updateTask || !updateUsers) {
      return res.status(400).json({
        success: false,
        message: "Failed to update the corresponding task or users with the subtask ID",
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
      const {user_id}=req.user;
        const subtask=await subtaskModel.find({createdBy:user_id})
        .populate({
          path: "task",
          populate: {
            path: "assignedUsers",
          },
        });
        
        

        if(!subtask){
            return res.status(400).json({
                success:false,
                message:"sub task not found"
            })
        }

        return res.status(200).json({
            success:true,
            message:"sub task found successfully",
            data:subtask
        })
    } catch (error) {
        return res.status(500).json({
          success: false,
          message: "Internal server error",
          error: error.message,
        });
      }

};


export const getSubTaskById=async(req,res)=>{
  try {
    
    const {user_id}=req.user;
    const {id}=req.params;

    const foundSubTask=await subtaskModel.findOne({_id:id,createdBy:user_id}).populate(["task","createdBy"]);

    if(!foundSubTask){

      return res.status(400).json({
        success:false,
        message:"not found sub task"
      })
    }


    return res.status(200).json({
      success:true,
      message:"found subtask successfully",
      data:foundSubTask
    })


  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}


export const updateSubTask = async (req, res) => {
  try {
    const { user_id } = req.user;
    const { id } = req.params;
    const { subTaskTitle, subTaskDescription, task, scheduledDateTime } = req.body;

    // Check if the sub task ID exists
    const existingTask = await subtaskModel.findOne({_id:id});

    if (!existingTask) {
      return res.status(400).json({
        success: false,
        message: "Task ID not found",
      });
    }

    const update = await subtaskModel.findByIdAndUpdate(
      id,
      {
        subTaskTitle,
        subTaskDescription,
        task,
        scheduledDateTime,
        createdBy: user_id,
      },
      { new: true }
    );

    if (!update) {
      return res.status(400).json({
        success: false,
        message: "Subtask not found or not updated",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Subtask updated successfully",
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

export const deleteSubTask = async (req, res) => {
  try {
    const { user_id } = req.user;
    const { id } = req.params;

    // Check if the subtask ID exists
    const existingSubTask = await subtaskModel.findById(id);

    if (!existingSubTask) {
      return res.status(400).json({
        success: false,
        message: "Subtask ID not found",
      });
    }

    // Remove subtask ID from user model
    await userModel.updateMany(
      { _id: { $in: existingSubTask.assignedUsers } },
      { $pull: { subtasks: id } }
    );

    // Remove subtask ID from task model
    const task = await taskModel.findOneAndUpdate(
      { subTasks: id },
      { $pull: { subTasks: id } },
      { new: true }
    );

    if (!task) {
      return res.status(400).json({
        success: false,
        message: "Task not found or subtask ID not present in the task",
      });
    }

    // Delete the subtask
    const removeSubTask = await subtaskModel.findByIdAndDelete(id);

    if (!removeSubTask) {
      return res.status(400).json({
        success: false,
        message: "Subtask not deleted",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Subtask deleted successfully",
      data: removeSubTask,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};



