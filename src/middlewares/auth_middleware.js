import { User } from "../models/user_models.js";
import ApiError from "../utils/apiClass.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv"
dotenv.config();


export const verifyJWT=asyncHandler(async (req,res,next)=>
{
try {
        const accessToken=req?.cookies?.AccessToken||req?.header('Authorization')?.
        replace('Bearer ',""); //accessToken is a string obtained from either req.cookies or from a header of req. Generally header is sent in the form of "Authorization:Bearer <Token>"
        if(!accessToken)
        {
            throw new ApiError(404,"Unauthorozied access")
        }
        const decoded_token = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        console.log(decoded_token)
        const user=await User.findById(decoded_token?._id).select("-password -refreshToken");
        if(!user)
        {
            throw new ApiError(404,"Invalid access token");
        }
        req.user=user;
        next();
} catch (error) {
    console.log(error)
    throw new ApiError(500,"Internal Server Error")
}

})

export default verifyJWT;