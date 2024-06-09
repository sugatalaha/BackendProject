import mongoose from "mongoose"
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
import dotenv from "dotenv"

dotenv.config()

const userSchema=new mongoose.Schema({
    watchHistory:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Video"
        }
    ],
    refreshToken:
    {
        type:String
    },
    email:
    {
        type: String,
        requird: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    fullname:
    {
        type: String,
        requird: true,
        lowercase: true,
        trim: true
    },
    CoverImage:
    {
        type:String,
    },
    Avatar:
    {
        type:String,
        required:true,
    },
    password:
    {
        type:String,
        required:[true,"Password is required"]
    },
    username:
    {
        type:String,
        requried:true,
        unique:true,
        lowercase:true
    }

},{timestamps:true})

userSchema.pre("save",async function(next)
{
    if(this.isModified("password"))
    {
        this.password = await bcrypt.hash(this.password, 10)
    }
    
    next();
})

userSchema.methods.checkPassword= async function(password)
{
    return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken=function()
{
    const accessToken= jwt.sign(
        {
            _id:this._id,
            fullname:this.fullname,
            email:this.email,
            username:this.username
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
    return accessToken
}

userSchema.methods.generateRefreshToken=function()
{
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}
export const User=mongoose.model("User",userSchema)