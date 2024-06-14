import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video_models.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/filehandling.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    if([page,limit,query,sortBy,sortType,userId].some((field)=>
    {
        field?.trim()===""
    }))
    {
        throw new ApiError(404,"All fields not available")
    }
    try
    {   
        if(query?.toLowerCase().trim()==="duration"){
            const videosAggregate = await Video.aggregate([
                {
                    $match:
                    {
                        owner: userId
                    },
                }
            ]).sort(
                {
                    duration:parseInt(sortType)
                }
            )
            const videos = await Video.aggregatePaginate({
                page: page,
                limit: limit
            }, videosAggregate)
            return res.status(200).json(new ApiResponse(200,videos,"All videos retrieved"));
        }
        else if(query?.toLowerCase().trim()==="views"){
            const videosAggregate = await Video.aggregate([
                {
                    $match:
                    {
                        owner: userId
                    },
                }
            ]).sort(
                {
                    views: parseInt(sortType)
                }
            )
            const videos=await Video.aggregatePaginate({
                page:page,
                limit:limit
            },videosAggregate)
            return res.status(200).json(new ApiResponse(200, videos, "All videos retrieved"));
        }
    }
    catch(error)
    {
        throw new ApiError(500,error)
    }
        
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    // TODO: get video, upload to cloudinary, create video
    const videofilepath=req.videoFile[0]?.path
    const thumbnailpath=req.thumbnail[0]?.path
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
    if(isValidObjectId(videoId)){
        throw new ApiError(404,"Video ID not valid");
    }
    const thumbnaillocalpath=req?.thumbnail[0]?.path
    if(!thumbnaillocalpath){
        throw new ApiError(404,"No thumbnail provided");
    }
    try
    {
        const updatedthumbnail = await uploadOnCloudinary(thumbnaillocalpath);
        const updatedVideo = await Video.findByIdAndUpdate(videoId,
            {
                $set:[{title:req.body?.title},
                    {
                        description:req.body?.description
                    },
                    {
                        thumbnail:updatedthumbnail
                    }
                ]
            }
        )
        return res.status(200).json(new ApiResponse(200,updatedVideo,"Video updated"))
    }
    catch(error)
    {
        throw new ApiError(500,error)
    }


})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    if(!videoId){
        throw new ApiError(404,"No video id provided");
    }
    const deletedVideo=await Video.findByIdAndDelete(videoId)
    if(!deletedVideo){
        throw new ApiError(400,"No video found");
    }
    return res.status(200).json(new ApiResponse(200,deletedVideo,"Video deleted successfully"))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if(isValidObjectId(videoId)){
        throw new ApiError(404,"Not valid video id");
    }
    const video=await Video.findById(videoId);
    if(!video){
        throw new ApiError(400,"Video does not exist");
    }
    const published=video.isPublished;
    let updatedVideo;
    if(published)
    {
        updatedVideo=await Video.findByIdAndUpdate(videoId,{
            $set:
            {
                isPublished:false
            }
        })
    }
    else{
        updatedVideo = await Video.findByIdAndUpdate(videoId, {
            $set:
            {
                isPublished: true
            }
        })
    }
    return res.status(200).json(new ApiResponse(200,updatedVideo,"Video published status updated successfully"));
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}