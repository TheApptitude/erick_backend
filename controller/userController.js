import userModel from "../model/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { config } from "dotenv";
import { randomInt } from "crypto";
import otpModel from "../model/otpModel.js";
import { sendEmails } from "../utlis/sendEmail.js";
config();
//user register
export const userRegister=async(req,res)=>{
    try {
        const { name, email, password } = req.body;
        

         if(!name){
            return res.status(400).json({
                success:false,
                message:"provide name"
            })
         }            
         if(!email){
            return res.status(400).json({
                success:false,
                message:"provide email"
            })
         } 
         if(!password){
            return res.status(400).json({
                success:false,
                message:"provide password"
            })
         } 
         const usercheck = await userModel.find({
           email:email
        })
        if (usercheck.length != 0) {
            return res
                .status(200)
                .json({ message: "user email already exist", success: false });
        }

         //create user
        const user=new userModel({
        name,
        email,
        password:bcrypt.hashSync(password,10)
        });

        const token = jwt.sign({ user_id: user._id }, process.env.SECRET_KEY, {
            expiresIn: "1d",
        });
        // save user token
        user.userToken = token; 
        //save user
        const saveuser=await user.save();

        if(!saveuser){

            return res.status(400).json({
                success:false,
                message:"user not create"
            })
        }
    
        return res.status(200).json({
            success:true,
            message:"user create succesfully",
            data:saveuser
        })
        
      } catch (error) {
        // Handle any errors that occur during registration
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
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
    
    if(!user){
      return res.status(401).json({
        success: false,
        message: "email not found",
      });
    }
    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({
        success: false,
        message: "Please enter correct password",
      });
    }

    const token = jwt.sign({ user_id: user._id }, process.env.SECRET_KEY, {
      expiresIn: "7d",
    });

    user.userToken = token;
    await user.save();

    // Return the response with user data and token
    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          userToken: user.userToken,
        },
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};


//forget password
export const forgetPassword=async(req,res)=>{

try {
  const {email}=req.body;

  const user=await userModel.findOne({email:email});

  if(!user){
    return res.status(400).json({
      success:false,
      message:"user not found"
    })
  }


  const OTP=randomInt(10000,99999);


  //store otp in db


  const otp=await otpModel.create({

    user:user._id,
    createdAt:new Date(),
    otpKey:OTP,
    expireAt: new Date(new Date().getTime() + 60 * 60 * 1000),
  })
      //set otp in user detail

  user.otpEmail=otp;
  await user.save();

  sendEmails(user.email, "code sent succesfully", `<h5>Your code is ${OTP}</h5>`);
  // console.log(user.email);
// console.log(sendEmails());
  return res.status(200).json({
    success:true,
    message:"code sent succesfully",
    data:OTP
  })

} catch (error) {
  
  return res.status(500).json({
    success:false,
    message:"Internal server error"
  })
}
};


//verify otp
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await userModel.findOne({ email }).populate('otpEmail');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "user not found",
      });
    }
    console.log(user);
    const OTP = user.otpEmail;

    if (!OTP) {
      return res.status(400).json({
        success: false,
        message: "otp not found",
      });
    } else if (OTP.otpUsed) {
      return res.status(400).json({
        success: false,
        message: "otp already used",
      });
    }

    if (OTP.otpKey !== otp) {
      return res.status(400).json({
        success: false,
        message: "invalid otp",
      });
    }

    const currentTime = new Date();
    const OTPTime = OTP.createdAt;
    const diff = currentTime.getTime() - OTPTime.getTime();
    const minutes = Math.floor(diff / 1000 / 60);
    if (minutes > 60) {
      return res.status(400).json({
        success: false,
        message: "otp expired",
      });
    }

    // Generate token
    const token = jwt.sign({ user_id: user._id }, process.env.SECRET_KEY, {
      expiresIn: "7d",
    });

    user.userToken = token;
    await user.save();

    OTP.otpUsed = true;
    await OTP.save();

    user.isVerified = true;
    user.otpEmail = null;
    await user.save();

    const profile = { ...user._doc, userToken: token };

    return res.status(200).json({
      success: true,
      message: "otp verified successfully",
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
export const resetPassword=async(req,res)=>{
 try {
  
    const {password}=req.body;
    const { user_id } = req.user;
    console.log("User ID:", user_id);
    console.log("password:",password);
    const userResetPassword=await userModel.findByIdAndUpdate(
      user_id,
     {
      password: bcrypt.hashSync(password,10)
     },
     {new:true}
    );
console.log(userResetPassword);
    if(!userResetPassword){
      return res.status(400).json({
        success:false,
        message:"password not reset"
      })
    }

    return res.status(200).json({
      success:true,
      message:"password reset successfully",
      data:userResetPassword
    })


 } catch (error) {
  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
 } 
};


