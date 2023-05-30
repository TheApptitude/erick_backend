import subtaskModel from "../model/subtaskModel.js";
import userModel from "../model/userModel.js";
import taskModel from "../model/taskModel.js";




//create subtask


export const createSubtask = async (req, res) => {
  try {
    const { user_id } = req.user;
    const { subTaskTitle, subTaskDescription, task, scheduledDateTime } = req.body;

    const existingTask = await taskModel.findOne({ _id: task });

    if (!existingTask) {
      return res.status(400).json({
        success: false,
        message: "Task id not found",
      });
    }

    const existingTasks = await subtaskModel.find({
      task,
      scheduledDateTime,
    });

    if (existingTasks.length > 0) {
      return res.status(400).json({
        success: false,
        message: "User is already assigned to a task at the same time",
      });
    }

    const create = new subtaskModel({
      subTaskTitle,
      subTaskDescription,
      task,
      scheduledDateTime,
      createdBy: user_id,
    });

    const savedSubTask = await create.save();

    const updateTask = await taskModel.findByIdAndUpdate(
      task,
      { $push: { subTasks: savedSubTask._id } },
      { new: true }
    );

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
