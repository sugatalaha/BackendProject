import mongoose from "mongoose"
import { Comment } from "../models/comment_models.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import {Video} from "../models/video_models.js";

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query
    const commentsAggregate=await Comment.aggregate(
        [   {
                $match:
                {
                     video:mongoose.Schema.Types.ObjectId(videoId)
                },
            },
            {
                $lookup:
                {
                    from:"videos",
                    localField:"video",
                    foreignField:"_id",
                    as:"VideoDetails"
                }
            }
        ]
    )
    const options=
    {
        page:page,
        limit:limit
    }
    const result=await Comment.aggregatePaginate(commentsAggregate,options)
    if(!result)
    {
        throw new ApiError(404,"No comments for the video found");
    }
    return res.status(200).json(new ApiResponse(200,result,"Result received successfully"))
})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {content}=req?.body
    const user=req?.user
    const {videoId}=req?.params
    if(!user)
    {
        throw new ApiError(404,"User not found");
    }
    if(!videoId)
    {
        throw new ApiError(404,"Video ID missing")
    }
    const video=await Video.findById(videoId)
    if(!video)
    {
        throw new ApiError(404,"No such video exists");
    }
    const comment=await Comment.create(
    {
        content:content,
        video:videoId,
        user:user?._id
    })

    const createdComment=await Comment.findById(comment?._id)
    if(!createdComment)
    {
        throw new ApiError(404,"Something went wrong while adding comment");
    }

    return res.status(200).json(new ApiResponse(200,createdComment,"Comment added successfully"))
    
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {comment_id}=req.params
    const {content}=req.body;
    if(!comment_id || !content)
    {
        throw new ApiError(404,"All fields must be filled");
    }
    const comment=await Comment.findByIdAndUpdate(comment_id,
        {
            $set:{content:content}
        },
        {
            new:true
        }
    )
    if(!comment)
    {
        throw new ApiError(404,"No comment found");
    }
    return res.status(200).json(new ApiResponse(200,comment,"Comment updated successfully"))
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {comment_id}=req.params
    if(!comment_id)
    {
        throw new ApiError(404,"No comment id provided");
    }
    const comment=await Comment.findById(comment_id)
    if(!comment)
    {
        throw new ApiError(404,"Comment to be deleted not found");
    }
    await Comment.deleteOne(comment._id)
    return res.status(200).json(new ApiResponse(200,{},"Comment deleted successfully"));
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}