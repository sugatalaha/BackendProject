import mongoose, { isValidObjectId } from "mongoose"
import { Playlist } from "../models/playlist_models.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body
    //TODO: create playlist
    const playlist=await Playlist.create({
        name:name,
        description:description,
        owner:req?.user?._id
    })
    const createdPlayList=await Playlist.findById(playlist._id)
    if(createPlaylist==null)
    {
        throw new ApiError(500,"Playlist creation fails")
    }
    return res.status(200).json(new ApiResponse(200,createdPlayList,"Playlist created successfully"))
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params
    //TODO: get user playlists
    if(!userId)
    {
        throw new ApiError(404,"No user id provided")
    }
    if(!isValidObjectId(userId)){
        throw new ApiError(404,"User id is not valid");
    }
    const playlists=await Playlist.aggregate(
        [
            {
                $match:
                {
                    owner:userId
                }
            }
        ]
    )
    return res.status(200).json(new ApiResponse(200,playlists,"Playlists found successfully"))
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    //TODO: get playlist by id
    if(!playlistId)
    {
        throw new ApiError(404,"No playlist id provided");
    }
    if(!isValidObjectId(playlistId)){
        throw new ApiError(404,"Playlist id not valid")
    }
    const playList=await Playlist.findById(playlistId)
    if(!playList){
        throw new ApiError(404,"No playlist exists")
    }
    return res.status(200).json(new ApiResponse(200,playList,"Playlist found successfully"))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    if(!playlistId){
        throw new ApiError(404,"No playlist id provided");
    }
    if(!videoId){
        throw new ApiError(404,"No video id provided");
    }
    if(!isValidObjectId(videoId) || !isValidObjectId(playlistId)){
        throw new ApiError(404,"Playlist id or video id is not valid")
    }
    const videoids=await Playlist.findById(playlistId).videos;
    if(!Array.isArray(videoids)){
        throw new ApiError(404,"Video cannot be added");
    }
    videoids.push(videoId)
    const updatedPlaylist=await Playlist.findByIdAndUpdate(playlistId,
        {
            $set:
            {
                videos:videoids
            },
        },
        {
            new: true
        }
    )
    if(!updatedPlaylist){
        throw new ApiError(500,"Playlist updation failed!");
    }
    return res.status(200).json(new ApiResponse(200,updatedPlaylist,"Playlist updated successfully"))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    // TODO: remove video from playlist
    if(!playlistId || !videoId){
        throw new ApiError(404,"Either playlist id or video id not provided")
    }
    if (!isValidObjectId(videoId) || !isValidObjectId(playlistId)) {
        throw new ApiError(404, "Playlist id or video id is not valid")
    }
    const videoids=await Playlist.findById(playlistId)?.videos
    if(!Array.isArray(videoids))
    {
        throw new ApiError(404,"Playlist not found");
    }
    try
    {
        index=videoids.indexOf(videoids)
        if(index==-1)
        {
            throw new ApiError(404,"Video id not found")
        }
        videoids.splice(index,1)
        const playList=await Playlist.findByIdAndUpdate(playlistId,
            {
                $set:
                {
                    videos:videoids
                }
            },
            {
                new:true
            }
        )
        return res.status(200).json(new ApiResponse(200,playList,"Video deleted successfully from the playlist"))
    }
    catch(error)
    {
        throw new ApiError(500,"Video deletion fails")
    }
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    // TODO: delete playlist
    if(!playlistId){
        throw new ApiError(404,"No playlist id provided");
    }
    if(!isValidObjectId(playlistId)){
        throw new ApiError(404,"Playlist id not valid")
    }
    try
    {
        await Playlist.findByIdAndDelete(playlistId)
    }
    catch(error)
    {
        throw new ApiError(404,error);
    }
    return res.status(200).json(new ApiResponse(200,{},"Playlist deleted successfully"))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const { name, description } = req.body
    //TODO: update playlist
    if(!playlistId)
    {
        throw new ApiError(404,"No playlist id provided");
    }
    if(!isValidObjectId(playlistId)){
        throw new ApiError(404,"Playlist ID not valid")
    }
    const playlist=await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set:[
                {
                    name:name
                },
                {
                    description:description
                }
            ]
        },
        {
            new:true
        }
    )
    if(!playlist){
        throw new ApiError(500,"Playlist updation failed");
    }
    return res.status(200).json(new ApiResponse(200,playlist,"Playlist updated successfully"));
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}