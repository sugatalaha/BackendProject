import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video_models.js"
import { User } from "../models/user_models.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/filehandling.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    // TODO: get video, upload to cloudinary, create video
    const videofilepath=req.videofile?.path
    const thumbnailpath=req.thumbnail?.path
    const existedVideo=await Video.find(
        {
            title:title
        }
    )
    if(existedVideo){
        throw new ApiError(400,"Give some different name");
    }
    if(thumbnailpath?.trim()==""){
        throw new ApiError(500,"No thumbnail path provided");
    }
    if(videofilepath?.trim()==""){
        throw new ApiError(500,"No videofile path provided");
    }
    try
    {
        const videofile_cloudinary=await uploadOnCloudinary(videofilepath)
        const thumbnail_cloudinary=await uploadOnCloudinary(thumbnailpath)
        const createdVideo=await Video.create(
            {
                title:title,
                owner:req?.user?._id,
                VideoFile:videofile_cloudinary?.url,
                thumbnail:thumbnail_cloudinary?.url,
                description:description,
                duration:req.videofile?.duration
            }
        )
        if(!createdVideo){
            throw new ApiError(500,"Video creation failed");
        }
        return res.status(200).json(new ApiResponse(200,createdVideo,"Video created successfully"));
    }
    catch(error)
    {
        throw new ApiError(500,error);
    }
    
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    if(!isValidObjectId(videoId)){
        throw new ApiError(404,"Not valid video id");
    }
    const video=await Video.findById(videoId);
    return res.status(200).json(new ApiResponse(200,video,"Video retrieved successfully"))
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    if(!videoId){
        throw new ApiError(404,"No video id provided");
    }
    const deletedVideo=await Video.findByIdAndDelete(videoId)
    if(!deleteVideo){
        throw new ApiError(400,"No video found");
    }
    return res.status(200).json(new ApiResponse(200,{},"Video deleted successfully"))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}