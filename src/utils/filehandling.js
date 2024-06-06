import {v2 as cloudinary} from "cloudinary";
import { log } from "console";
import dotenv from "dotenv"
import fs from "fs"
dotenv.config()
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_USERNAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary=async (localfilepath)=>
    {
        try
        {
            if(!localfilepath)return null
            const response= await cloudinary.uploader.upload(localfilepath);
            console.log("File has been uploaded successfully,url:",response.url)
            return response 
        }
        catch(error)
        {
            console.log(error)
            fs.unlinkSync(localfilepath)
            return null;
        }
    }

export default uploadOnCloudinary;