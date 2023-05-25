import mongoose from "mongoose";

const userSchema=new mongoose.Schema({

name:{
    type: String,
    default: "",
},

email:{
    type: String,
    require: true,
    match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/,
},
password:{
    type: String,
    require: true,
},



});

const userModel=mongoose.model("users",userSchema);
export default userModel;