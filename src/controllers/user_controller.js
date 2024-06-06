import asyncHandler from "../utils/asyncHandler.js"
import ApiError from "../utils/apiClass.js"
import {User} from "../models/user_models.js";
import uploadOnCloudinary from "../utils/filehandling.js";
import apiResponse from "../utils/apiResponse.js"
import ApiResponse from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";


const generateAccessTokenandRefreshToken=async (userid)=>
{
    try{
        const user=await User.findById(userid);
        const accessToken=user.generateRefreshToken();
        const refreshToken=user.generateAccessToken();
        user.refreshToken=refreshToken
        await user?.save({validateBeforeSave:false});
        return {accessToken,refreshToken};
    }
    catch(error)
    {   
        throw new ApiError(500,"Something went wrong while generating access and refresh token")
    }
}
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
    // console.log(fullname,email,username,password)
    if([fullname,email,username,password].some((field)=>field?.trim()===""))
    {
        throw new ApiError(400,"All fields are required");
    }
        const existedUser=await User.findOne(
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
        // const localCoverImagePath=req.files?.CoverImage[0]?.path

        let localCoverImagePath;
        if(req.files && Array.isArray(req.files.CoverImage) && req.files.CoverImage.length>0)
            {
                localCoverImagePath=req.files.CoverImage[0].path
            }
        if(!localAvatarPath)
        {
            throw new ApiError(400,"Avatar required");
        }
        const avatar=await uploadOnCloudinary(localAvatarPath)
        const coverImage=await uploadOnCloudinary(localCoverImagePath);
        if(!avatar)
        {
            throw new ApiError(404,"Avatar upload failed");
        }
        const user=await User.create(
            {
                fullname:fullname,
                Avatar:avatar.url,
                CoverImage:coverImage?.url||"",
                email:email,
                username:username.toLowerCase(),
                password:password

            }
        )
        const createdUser=await User.findById(user._id).select("-password -avatar -coverImage")
        if(!createdUser)
        {
            throw ApiError(404,"User cannot be inserted")
        }
        else
        {
            return res.status(201).json(
                    new apiResponse(201,createdUser,"User registered successfully")
            )
        }
    
})

const loginUser=asyncHandler(async(req,res)=>
{
    //Accept username,email and password
    //Check if user is already there in db or not by matching username,email and password
    //If so, respond with status ok and send refresh and access tokens as cookies
    //Else throw error that user has to register first
    const {password,username,email}=req.body
    if([username,email].some((field)=>
    {
        field?.trim()===""
    }))
    {
        throw new ApiError(400,"Username or email is missing");
    }
    const existedUser=await User.findOne(
        {
            $or:[{email},{username}]
        }
    )
    if(!existedUser)
    {
        throw new ApiError(400,"User is not registered");
    }
    let flag=await existedUser.checkPassword(password);
    if(!flag)
    {
        throw new ApiError(400,"Enter valid password");
    }
    const {accessToken,refreshToken}=await generateAccessTokenandRefreshToken(existedUser._id)
    const existedUser2=await User.findById(existedUser._id).select("-password -refreshToken");
    const options=
    {
        httpOnly:true,
        secure:true
    }
    return res.status(200).cookie("Access token",accessToken,options
    ).cookie("Refresh token",refreshToken,options).json(new ApiResponse(200,{
        user:existedUser2,
        accessToken:accessToken,
        refreshToken:refreshToken
    },"User logged in successfully"))
})

const logoutUser=asyncHandler(async (req,res)=>
{
    User.findByIdAndUpdate(
        req?.user?._id,
        {
            $set:
            {
                refreshToken:undefined
            }
        },
    )
    const options =
    {
        httpOnly: true,
        secure: true
    }

    return res.status(200).clearCookie("Access token",options)
    .clearCookie("Refresh token",options)
    .json(new ApiResponse(200,{},"User logged out successfully"))
})

const refreshAccessToken=asyncHandler(async (req,res)=>
{
    const IncomingRefreshToken=req?.cookies.refreshToken||req.body.refreshToken;
    if(!IncomingRefreshToken)
    {
        throw new ApiError(400,"Unauthorized access");
    }
    const decoded_token = jwt.verify(IncomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

    const LoggedInUser=await User.findById(decoded_token?._id);
    const refreshToken=LoggedInUser.refreshToken;
    if(!LoggedInUser)
    {
        throw new ApiError(400,"Refresh Token does not match");
    }
    if(IncomingRefreshToken!==LoggedInUser.refreshToken)
    {
        throw new ApiError(401,"Refresh token expired or already has been used")
    }
    const options=
    {
        httpOnly:true,
        secure:true
    }
    const newAccessToken=await LoggedInUser.generateAccessToken();
    return res.status(200).cookie("Access Token",newAccessToken,options).cookie("Refresh Token",refreshToken,options).json(
        {
            message:"Access token refreshed successfully",
            LoggedInUser,
            accessToken:newAccessToken,
            refreshToken:IncomingRefreshToken
        }
    )
})
export 
{
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
}