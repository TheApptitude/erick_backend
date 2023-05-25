import jwt from "jsonwebtoken";

import { config } from "dotenv";
config();


const verifyToken=async(req,res,next)=>{
    const token = req.body.token || req.query.token || req.headers["x-access-token"];

if (!token || token === "null" || token === "undefined" || token === "false" || token === null) {
    return res.status(401).json({
        success: false,
        message: "A token is required for authentication"
    });
}

try {
    const decode=jwt.verify(token,process.env.SECRET_KEY);
    req.user=decode;
} catch (error) {
    return res.status(401).send("Invalid Token")};
    next();

}
module.exports=verifyToken;