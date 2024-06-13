import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet_models.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {content}=req.body;
    if(!content){
        throw new ApiError(400,"No tweet created");
    }
    const tweet=await Tweet.create({content:content,owner:req?.user?._id});
    if(!tweet){
        throw new ApiError(500,"Tweet creation failed");
    }
    return res.status(200).json(new ApiResponse(200,tweet,"Tweet created successfully"));
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const {userid}=req.params;
    if(!isValidObjectId(userid)){
        throw new ApiError(400,"Not valid user id");
    }
     const tweets=await Tweet.aggregate(
        [
            {
                $match:
                {
                    owner:mongoose.Schema.Types.ObjectId(userid)
                }
            }
        ]
     )
     return res.status(200).json(new ApiResponse(200,tweets,"User tweets received successfully"))
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const { userid } = req.params;
    if (!isValidObjectId(userid)) {
        throw new ApiError(400, "Not valid user id");
    }
    const {content}=req.body;
    if(!content){
        throw new ApiError("Content is empty");
    }
    const updatedTweet=await Tweet.findOneAndUpdate({
        owner:userid,
    },
    {
        $set:
        {
            content:content
        }
    },
    {
        new:true
    })
    if(!updatedTweet){
        throw new ApiError(500,"Tweet updation failed");
    }
    return res.status(200).json(new ApiResponse(200,updatedTweet,"Tweet updated successfully"));
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetid}=req.params;
    if(!isValidObjectId(tweetid)){
        throw new ApiError(400,"Invalid tweet id")
    }
    const deletedTweet=await Tweet.findByIdAndDelete(tweetid)
    if(!deletedTweet){
        throw new ApiError(500,"Tweet deletion failed");
    }
    return res.status(200).json(new ApiResponse(200,deletedTweet,"Tweet deleted successfully"))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}