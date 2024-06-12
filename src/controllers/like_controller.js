import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like_models.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: toggle like on video
    if(!isValidObjectId(videoId)){
        throw new ApiError(404,"Video ID not provided properly")
    }
    const user=req?.user;
    if(!user){
        throw new ApiError(404,"Unauthorized user")
    }
    const like=await Like.findOne({
        $or:[{video:videoId}]
    })
    if(!like){
        const createdLike=await Like.create(
            {
                video:videoId
            }
        )
        if(!createdLike){
            throw new ApiError(500,"Error while liking video")
        }
        return res.status(200).json(new ApiResponse(200,createdLike,"Video liked"))
    }
    else{
        const deletedLike=await Like.findOneAndDelete(
            {
                $or:[{video:videoId}]
            }
        )
        if(!deletedLike){
            throw new ApiError(500,"Video disliking failed");
        }
        return res.status(200).json(new ApiResponse(200,{},"Like deleted successfully"))
    }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    //TODO: toggle like on comment
    if (!isValidObjectId(commentId)) {
        throw new ApiError(404, "Comment ID not provided properly")
    }
    const user = req?.user;
    if (!user) {
        throw new ApiError(404, "Unauthorized user")
    }
    const like = await Like.findOne({
        $or: [{ comment:commentId }]
    })
    if (!like) {
        const createdLike = await Like.create(
            {
                comment:commentId
            }
        )
        if (!createdLike) {
            throw new ApiError(500, "Error while liking comment")
        }
        return res.status(200).json(new ApiResponse(200, createdLike, "comment liked"))
    }
    else {
        const deletedLike = await Like.findOneAndDelete(
            {
                $or: [{ comment:commentId }]
            }
        )
        if (!deletedLike) {
            throw new ApiError(500, "Comment disliking failed");
        }
        return res.status(200).json(new ApiResponse(200, {}, "Like deleted successfully"))
    }


})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    //TODO: toggle like on tweet
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(404, "Tweet ID not provided properly")
    }
    const user = req?.user;
    if (!user) {
        throw new ApiError(404, "Unauthorized user")
    }
    const like = await Like.findOne({
        $or: [{ tweet: tweetId }]
    })
    if (!like) {
        const createdLike = await Like.create(
            {
                tweet: tweetId
            }
        )
        if (!createdLike) {
            throw new ApiError(500, "Error while liking tweet")
        }
        return res.status(200).json(new ApiResponse(200, createdLike, "tweet liked"))
    }
    else {
        const deletedLike = await Like.findOneAndDelete(
            {
                $or: [{ tweet: tweetId }]
            }
        )
        if (!deletedLike) {
            throw new ApiError(500, "Tweet disliking failed");
        }
        return res.status(200).json(new ApiResponse(200, {}, "Like deleted successfully"))
    }
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const user=req?.user;
    if(!user){
        throw new ApiError(404,"Unauthorized user");
    }
    const videos=Like.aggregate(
        [
            {
                $match:"likedby"
            },
            {
                $project:
                {
                    videos:1
                }
            }
        ]
    )
    return res.status(200).json(new ApiResponse(200,videos,"Liked video found successfully"))
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}