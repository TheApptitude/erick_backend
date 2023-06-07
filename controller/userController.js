import userModel from "../model/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { config } from "dotenv";
import { randomInt } from "crypto";
import otpModel from "../model/otpModel.js";
import { sendEmails } from "../utils/sendEmail.js";
import { handleMultipartData } from "../utils/multiPartData.js";



//user register
export const userRegister = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "provide name",
      });
    }
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "provide email",
      });
    }
    if (!password) {
      return res.status(400).json({
        success: false,
        message: "provide password",
      });
    }

   
    // Check if the user exists in the database
    const userCheck = await userModel.find({ email: email });

    if (userCheck.length !== 0) {
    
      return res.status(200).json({
        message: "user email already exists",
        success: false,
      });
    }

    // Create user
    const user = new userModel({
      name,
      email,
      password: bcrypt.hashSync(password, 10),
    });

    const token = jwt.sign({ user_id: user._id }, process.env.SECRET_KEY, {
      expiresIn: "1d",
    });

    // Save user token
    user.userToken = token;

    // Save user to the database
    const saveUser = await user.save();

    if (!saveUser) {
      return res.status(400).json({
        success: false,
        message: "user not created",
      });
    }



    return res.status(200).json({
      success: true,
      message: "user created successfully",
      data: saveUser,
    });
  } catch (error) {
    // Handle any errors that occur during registration
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal server error",error:error.message });
  }
};




//user login
export const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email not provided",
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password not provided",
      });
    }

    const user = await userModel.findOne({ email: email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email not found",
      });
    }

    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({
        success: false,
        message: "Please enter the correct password",
      });
    }

    const token = jwt.sign({ user_id: user._id }, process.env.SECRET_KEY, {
      expiresIn: "1d",
    });

    user.userToken = token;
    await user.save();

    
    const profile = { ...user._doc, userToken: token };

    // Return the response with user data and token
    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: profile
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};





//forget password
export const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await userModel.findOne({ email: email }).populate('otpEmail');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    const OTP = randomInt(10000, 99999);

    // Create a new OTP document
    const newOTP = new otpModel({
      otpKey: OTP,
      otpUsed: false,
    });

    // Save the new OTP document
    const savedOTP = await newOTP.save();

    // Assign the OTP document reference to the user's otpEmail field
    user.otpEmail = savedOTP._id;
    await user.save();

    // Send the OTP to the user's email
    sendEmails(user.email, "Code sent successfully", `<h5>Your code is ${OTP}</h5>`);

    return res.status(200).json({
      success: true,
      message: "Code sent successfully",
      data: OTP
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};




export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await userModel.findOne({ email }).populate("otpEmail");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    const OTP = user.otpEmail;

    if (!OTP) {
      return res.status(400).json({
        success: false,
        message: "OTP not found",
      });
    } else if (OTP.otpUsed) {
      return res.status(400).json({
        success: false,
        message: "OTP already used",
      });
    }

    if (OTP.otpKey !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    const currentTime = new Date();
    const OTPTime = OTP.createdAt;
    const diff = currentTime.getTime() - OTPTime.getTime();
    const minutes = Math.floor(diff / 1000 / 60);
    if (minutes > 60) {
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    // Generate token
    const token = jwt.sign({ user_id: user._id }, process.env.SECRET_KEY, {
      expiresIn: "1d",
    });

    user.userToken = token;
    await user.save();

    OTP.otpUsed = true;
    await OTP.save();

    user.otpVerified = true;
    user.otpEmail = null;
    await user.save();

    const profile = { ...user._doc, userToken: token };

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      data: profile,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};




//reset password
export const resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const { user_id } = req.user;

    const userResetPassword = await userModel.findByIdAndUpdate(
      user_id,
      {
        password: bcrypt.hashSync(password, 10),
      },
      { new: true }
    );

    if (!userResetPassword) {
      return res.status(400).json({
        success: false,
        message: "Password not reset",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
      data: userResetPassword,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};



//update image
export const updateImage = [
  handleMultipartData.fields([
    {
      name: "image",
      maxCount: 1,
    },
  ]),

  async (req, res) => {
    try {
      const { user_id } = req.user;
      const { files } = req;
      const filesArray = (filesObj, type) => {
        if (!filesObj[type].length) {
          return "";
        }
        const file = filesObj[type][0]; // Get the first file from the array
        const imagePath = file.path.replace(/\\/g, '/').replace('public/', '');
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const fullImagePath = `${baseUrl}/${imagePath}`;
        return fullImagePath;
      };

      const user = await userModel.findById(user_id);

      if (!user) {
        return res.status(400).json({
          success: false,
          message: "User not found",
        });
      }

      // Update the image in the user document
      user.image = files && files["image"]
        ? filesArray(files, "image")
        : "";

      // Save the updated user document
      const updatedUser = await user.save();

      return res.status(200).json({
        success: true,
        message: "Image updated successfully",
        data: updatedUser,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },
];



export const getUser=async(req,res)=>{
  try {
    const {user_id}=req.user;

    const userFind=await userModel.findOne({_id:user_id});


if(!userFind){
  return res.status(400).json({
    success: false,
    message: "user not found",
  });
}

    const getAllUser=await userModel.find({_id:{$ne:user_id}});
    if(!getAllUser){
      return res.status(400).json({
        success: false,
        message: "users not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "users found successfully",
      data:getAllUser
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}


export const getUserById=async(req,res)=>{
  try {
      
    const {user_id}=req.user;
    const {id}=req.params;

    const userFind=await userModel.findOne({_id:user_id});

    if(!userFind){
      return res.status(400).json({
        success: false,
        message: "user not found",
      });
    }

    const getUser = await userModel.findOne({ _id: { $ne: user_id, $eq: id } });

    if(!getUser){
      return res.status(400).json({
        success: false,
        message: "you cannot found yourself",
      });
    }
   
    return res.status(200).json({
      success: true,
      message: "user found successfully",
      data:getUser
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}

