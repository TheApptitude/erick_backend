import userModel from "../model/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { config } from "dotenv";
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
  
      if (user && bcrypt.compareSync(password, user.password)) {
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
      } else {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
  
  
  