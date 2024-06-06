import mongoose from "mongoose"
import { DB_NAME } from "../constants.js";
import dotenv from 'dotenv';
dotenv.config();
const connectDB=async ()=>
{
    try{
        const connection = await mongoose.connect(`${process.env.MONGO_DB_URL}/${DB_NAME}?retryWrites=true&w=majority`)
        
    console.log(`MongoDB connected at ${connection.connection.host}`)
    }
    catch(error)
    {
        console.log(`Error in connecting MongoDB:${error}`)
        process.exit(1)
    }
}

export default connectDB