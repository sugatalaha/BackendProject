import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user_models.js";
import { uploadOnCloudinary } from "../utils/filehandling.js";
import { deleteFromCloudinary } from "../utils/filehandling.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import dotenv from "dotenv"
dotenv.config();

const generateAccessTokenandRefreshToken = async (userid) => {
    try {
        const user = await User.findById(userid);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken
        await user?.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    }
    catch (error) {
        throw new ApiError(500, "Something went wrong while generating access and refresh token")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    //Get user data from the frontend
    //Check if any field remains empty or not
    //Check if avatar is provided or not
    //Check for image
    //Upload image avatar to Cloudinary and get url
    //Store the user in db
    //Check if user is properly stored or not
    //Remove password and refresh token field from response
    //return response
    const { fullname, username, email, password } = req.body
    // console.log(fullname,email,username,password)
    if ([fullname, email, username, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }
    const existedUser = await User.findOne(
        {
            $or: [{ username }, { email }]
        }
    )
    if (existedUser) {
        throw new ApiError(404, "User already exists")
    }
    //Multer gives another attribute to req which is .files similar to express giving .body attribute to req
    const localAvatarPath = req?.files?.Avatar[0]?.path
    let localCoverImagePath;
    if (req.files && Array.isArray(req.files.CoverImage) && req.files.CoverImage.length > 0) {
        localCoverImagePath = req.files.CoverImage[0].path
    }
    if (!localAvatarPath) {
        throw new ApiError(400, "Avatar required");
    }
    const avatar = await uploadOnCloudinary(localAvatarPath)
    const coverImage = await uploadOnCloudinary(localCoverImagePath);
    if (!avatar) {
        throw new ApiError(404, "Avatar upload failed");
    }
    const user = await User.create(
        {
            fullname: fullname,
            Avatar: avatar.url,
            CoverImage: coverImage?.url || "",
            email: email,
            username: username.toLowerCase(),
            password: password

        }
    )
    const createdUser = await User.findById(user._id).select("-password -avatar -coverImage")
    if (!createdUser) {
        throw ApiError(404, "User cannot be inserted")
    }
    else {
        return res.status(201).json(
            new ApiResponse(201, createdUser, "User registered successfully")
        )
    }

})

const loginUser = asyncHandler(async (req, res) => {
    //Accept username,email and password
    //Check if user is already there in db or not by matching username,email and password
    //If so, respond with status ok and send refresh and access tokens as cookies
    //Else throw error that user has to register first
    const { password, username, email } = req.body
    if ([username, email].some((field) => {
        field?.trim() === ""
    })) {
        throw new ApiError(400, "Username or email is missing");
    }
    const existedUser = await User.findOne(
        {
            $or: [{ email }, { username }]
        }
    )
    if (!existedUser) {
        throw new ApiError(400, "User is not registered");
    }
    let flag = await existedUser.checkPassword(password);
    if (!flag) {
        throw new ApiError(400, "Enter valid password");
    }
    const { accessToken, refreshToken } = await generateAccessTokenandRefreshToken(existedUser._id)
    const existedUser2 = await User.findById(existedUser._id).select("-password -refreshToken");
    const options =
    {
        httpOnly: true,
        secure: true
    }
    return res.status(200).cookie("AccessToken", accessToken, options
    ).cookie("RefreshToken", refreshToken, options).json(new ApiResponse(200, {
        user: existedUser2,
        accessToken: accessToken,
        refreshToken: refreshToken
    }, "User logged in successfully"))
})

const logoutUser = asyncHandler(async (req, res) => {
    User.findByIdAndUpdate(
        req?.user?._id,
        {
            $set:
            {
                refreshToken: undefined
            }
        },
    )
    const options =
    {
        httpOnly: true,
        secure: true
    }

    return res.status(200).clearCookie("AccessToken", options)
        .clearCookie("RefreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const IncomingRefreshToken = req?.cookies.RefreshToken || req.body.refreshToken;
    if (!IncomingRefreshToken) {
        throw new ApiError(400, "Unauthorized access");
    }
    const decoded_token = jwt.verify(IncomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

    const LoggedInUser = await User.findById(decoded_token?._id);
    const refreshToken = LoggedInUser.refreshToken;
    if (!LoggedInUser) {
        throw new ApiError(400, "Refresh Token does not match");
    }
    if (IncomingRefreshToken !== LoggedInUser.refreshToken) {
        throw new ApiError(401, "Refresh token expired or already has been used")
    }
    const options =
    {
        httpOnly: true,
        secure: true
    }
    const newAccessToken = await LoggedInUser.generateAccessToken();
    return res.status(200).cookie("Access Token", newAccessToken, options).cookie("Refresh Token", refreshToken, options).json(
        {
            message: "Access token refreshed successfully",
            LoggedInUser,
            accessToken: newAccessToken,
            refreshToken: IncomingRefreshToken
        }
    )
})

const changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const user_id = req.user?._id;
    const user = await User.findById(user_id)
    const isPasswordCorrect = await user?.checkPassword(oldPassword)
    if (!isPasswordCorrect) {
        throw new ApiError(400, "Incorrect password");
    }
    user.password = newPassword
    await user.save({ validateBeforeSave: false });
    return res.status(200).json(
        new ApiResponse(200, {}, "Password changed successfully")
    )
})

const getCurrentUser = asyncHandler(async (req, res) => {
    const currentUser = req?.user
    return res.status(200).json(new ApiResponse(200, currentUser, "Current user fetched successfully!"))
})

const updateUserDetails = asyncHandler(async (req, res) => {
    const { fullname, email, username } = req.body;
    if (!fullname || !email || !username) {
        throw new ApiError(400, "All fields are required");
    }
    const user = await User.findByIdAndUpdate(req?.user?._id,
        {
            $set:
            {
                fullname,
                email,
                username
            }
        },
        {
            new: true
        }
    ).select("-password")
    return res.status(200).json(
        new ApiResponse(200, user, "User details updated successfully")
    )
})

const updateUserAvatar = asyncHandler(async (req, res) => {
    const Avatar = req.file
    const AvatarLocalPath = Avatar?.path
    if (!AvatarLocalPath) {
        throw new ApiError(400, "Avatar is required")
    }
    const prev_url = await User.findById(req?.user?._id).Avatar
    await deleteFromCloudinary(prev_url)
    const object = await uploadOnCloudinary(AvatarLocalPath)
    const url=object.url
    if (!url) {
        throw new ApiError(400, "Avatar Updation failed")
    }

    const AvatarUpdatedUser = await User.findByIdAndUpdate(req?.user?._id,
        {
            $set:
            {
                Avatar: url
            }
        },
        {
            new: true
        }
    ).select("-password")
    res.status(200).json(new ApiResponse(200, AvatarUpdatedUser, "Avatar updated successfully"))
})

const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImagePath = req?.file?.path
    if (!coverImagePath) {
        throw new ApiError(400, "No Cover Image provided")
    }
    const user = await User.findById(req?.user?._id)
    const prev_url=user?.CoverImage
    if (prev_url) {
        await deleteFromCloudinary(prev_url)
    }
    const object= await uploadOnCloudinary(coverImagePath)
    const url=object?.url
    const CoverImageUpdatedUser = await User.findByIdAndUpdate(req?.user?._id,
        {
            $set: { CoverImage: url }
        },
        {
            new: true
        }
    ).select("-password")
    return res.status(200).json(new ApiResponse(200, CoverImageUpdatedUser, "Cover Image is updated successfully"))
})

const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params
    if (!username?.trim()) {
        throw new ApiError(400, "Username is missing")
    }
    const channel = await User.aggregate([
        {
            $match:
            {
                username: username?.toLowerCase(),
            },
        },
        {
            $lookup:
            {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            },
        },
        {            
            $lookup:
            {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subsciber",
                as: "subscribedTo"
            },
        },
        {
            $addFields:
            {
                subscribersCount:
                {
                    $size: "$subscribers"
                },
                channelsSubscribedToCount:
                {
                    $size: "$subscribedTo"
                },
                isSubscribed:
                {
                    $cond:
                    {
                        if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                        then: true,
                        else: false
                    }
                },
            }
        },
        {
            $project:
            {
                fullname: 1,
                username: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                coverImage: 1,
                avatar: 1,
                email: 1
            }
        }
    ])
    if (!channel) {
        throw new ApiError(400, "Channel does not exist")
    }
    return res.status(200).json(new ApiResponse(200, channel[0], "User channel found successfully"))
})

const getWatchHistory = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match:
            {
                _id: req?.user?._id
            },
        },
        {
            $lookup:
            {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline:
                    [
                        {
                            $lookup:
                            {
                                from: "users",
                                localField: "owner",
                                foreignField: "_id",
                                as: "owner",
                                pipeline:
                                    [
                                        {
                                            $project:
                                            {
                                                fullname: 1,
                                                email: 1,
                                                coverImage: 1,
                                                username: 1
                                            }
                                        }
                                    ]
                            },
                        },
                        {
                            $addFields:
                            {
                                owner:
                                {
                                    $first: "$owner"
                                }
                            }
                        }
                    ]

            },
        }
    
    ])
    return res.status(200).json(new ApiResponse(200, user[0]?.watchHistory, "Watch History received successfully"))
})
export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changePassword,
    getCurrentUser,
    updateUserDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
}