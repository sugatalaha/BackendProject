import asyncHandler from "../utils/asyncHandler.js"
import ApiError from "../utils/apiClass.js"
import {User} from "../models/user_models.js";
import { upload } from "../middlewares/multer_middle.js";
import uploadOnCloudinary from "../utils/filehandling.js";
import apiResponse from "../utils/apiResponse.js"

const registerUser=asyncHandler(async (req,res)=>
{
    //Get user data from the frontend
    //Check if any field remains empty or not
    //Check if avatar is provided or not
    //Check for image
    //Upload image avatar to Cloudinary and get url
    //Store the user in db
    //Check if user is properly stored or not
    //Remove password and refresh token field from response
    //return response
    const {fullname,username,email,password}=req.body
    console.log(fullname,email,username,password)
    if([fullname,email,username,password].some((field)=>field?.trim()===""))
    {
        throw new ApiError(400,"All fields are required");
    }
    else
    {
        const existedUser=User.findOne(
            {
                $or:[{username},{email}]
            }
        )
        if(existedUser)
        {
            throw new ApiError(404,"User already exists")
        }

        //Multer gives another attribute to req which is .files similar to express giving .body attribute to req
        const localAvatarPath=req.files?.Avatar[0]?.path
        const localCoverImagePath=req.files?.CoverImage[0]?.path
        if(!localAvatarPath)
        {
            throw new ApiError(400,"Avatar required");
        }
        if(!localCoverImagePath)
        {
            throw new ApiError(400,"CoverImage required");
        }
        const avatar=await uploadOnCloudinary(localAvatarPath)
        const coverImage=await uploadOnCloudinary(localCoverImagePath);
        if(!avatar)
        {
            throw new ApiError(404,"Avatar upload failed");
        }
        if(!coverImage)
        {
            throw new ApiError(404,"Cover Image upload failed")
        }
        const user=await User.create(
            {
                fullname:fullname,
                avatar:avatar.url,
                coverImage:coverImage.url||"",
                email:email,
                username:username.toLowerCase(),
                password:password

            }
        )
        const createdUser=User.findById(user._id).select("-password -avatar -coverImage")
        if(!createdUser)
        {
            throw ApiError(404,"User cannot be inserted")
        }
        else
        {
            res.status(201).json(
                    new apiResponse(201,createdUser,"User registered successfully")
            )
        }
    }
    
    return;
    
    
})

export default registerUser