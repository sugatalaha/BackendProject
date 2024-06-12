import mongoose from "mongoose"
import { Video } from "../models/video_models.js"
import { Subscription } from "../models/subscription_models.js"
import { Like } from "../models/like_models.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const user=req?.user;
    if(!user){
        throw new ApiError(404,"Unauthorized access");
    }
    const videos=await Video.aggregate([
        {
            $match:
            {
                owner:user?._id
            }
        }
    ])
    const total_videos=videos.length
    const total_views=videos.reduce((x,y)=>{return x.views+y.views})
    const subscribers=await Subscription.aggregate(
        [
            {
                $match:
                {
                    channel:user?._id
                }
            }
        ]
    )
    const total_subscribers=subscribers.length
    let total_likes=0;
    videos.forEach(async(video)=>
    {
        const likes=await Like.aggregate(
           [
            {
                $match:
                {
                    video:video?._id
                }
            }
           ] 
        )
        if(likes){
            total_likes+=likes.length
        }
    })
    return res.status(200).json(new ApiResponse(200,{
        total_likes:total_likes,
        total_views:total_views,
        total_videos:total_videos,
        total_subscribers:total_subscribers
    },"All data retrieved successfully"))  
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const userId=req?.user?._id;
    if(!userId){
        throw new ApiError(404,"No user id provided");
    }
    const videoAggregate=Video.aggregate(
        [
            {
                $match:
                {
                    owner:userId
                }
            }
        ]
    )
    const options=
    {
        page:1,
        limit:10
    }
    Video.aggregatePaginate(videoAggregate,options)
    return res.status(200).json(new ApiResponse(200,videoAggregate,"Videos retrieved successfully"))
})

export {
    getChannelStats,
    getChannelVideos
}