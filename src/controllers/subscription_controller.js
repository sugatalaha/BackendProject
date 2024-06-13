import mongoose, { isValidObjectId } from "mongoose"
import { User } from "../models/user_models.js"
import { Subscription } from "../models/subscription_models.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    // TODO: toggle subscription
    if(!isValidObjectId(channelId)){
        throw new ApiError(404,"Not valid channel id");
    }
    if(!req?.user){
        throw new ApiError(400,"Unauthorized user")
    }
    const channel = User.findById(channelId)
    if(!channel){
        throw new ApiError(404,"Channel does not exist");
    }
    const subscription=await Subscription.findOne({
        $and:[{channel:channelId},{subscriber:req?.user?._id}]
    })
    if(subscription){
        const subscription_id=subscription._id
        const deletedSubscription=await Subscription.findByIdAndDelete(subscription_id);
        return res.status(200).json(new ApiResponse(200,deletedSubscription,"Subscription removed"))
    }
    else{
        const createdSubscription=await Subscription.create(
            {
                channel:channel?._id,
                subscriber:req?.user?._id
            }
        )
        return res.status(200).json(new ApiResponse(200,createdSubscription,"Subscription added"));
    }
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    if(isValidObjectId(channelId)){
        throw new ApiError(400,"Not valid channel id");
    }
    const subscriptionAggregate=await Subscription.aggregate([
        {
            $match:{channel:mongoose.Schema.Types.ObjectId(channelId)}
        }
    ])
    const subscribers=subscriptionAggregate?.length
    return res.status(200).json(new ApiResponse(200,{subscribers:subscribers},"Number of subscribers retrieved"))
})
// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    if(isValidObjectId(subscriberId)){
        throw new ApiError(400,"Not valid subscriber id");
    }
    const subscriptionAggregate=Subscription.aggregate([
        {
            $match:{subscriber:mongoose.Schema.Types.ObjectId(subscriberId)}
        }
    ])
    return res.status(200).json(new ApiResponse(200,subscriptionAggregate?.length,"Channels subscribed to retrieved"));
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}