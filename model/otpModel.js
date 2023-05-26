import mongoose from "mongoose";


const otpSchema=new mongoose.Schema({

user:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
},
otpKey:{
    type:String,
    required:true
},
otpUsed: {
    type: Boolean,
    default: false,
    enum: [true, false],
  },

},
{
    timestamps: true,
    expires: 3600,
});


const otpModel=mongoose.model("otp",otpSchema);

export default otpModel;