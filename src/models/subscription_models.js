import mongoose from 'mongoose'

const subscriptionSchema=new mongoose.Schema(
    {
        subsciber://one who is subscribing
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true
        },
        channel: // user whose channel is subscribed
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        
    },
    {
        timestamps:true
    }
)
export const Subscription=mongoose.model("Subsciption",subscriptionSchema)