import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const playlistSchema=new mongoose.Schema({
    videos:
    [
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Video"
        }
    ],
    name:
    {
        type:String,
        required:true,
    },
    description:
    {
        type:String
    },
    owner:
    {
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }

},{timestamps:true})

export const Playlist=mongoose.model("Playlist",playlistSchema)