import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

//app.use() is used for middleware or configuration settings
app.use(cors(
    {
        origin:process.env.CORS_ORIGIN,
        credentials:true
    }
))
app.use(express.json({limit:"16kb",}))
app.use(express.urlencoded({extended:true,
    limit:"16kb"
}))
app.use(express.static('public'))
app.use(cookieParser())

//importing Router

import userRouter from "./routes/user_router.js";

//Configuring app with the Router
app.use('/api/v1/users',userRouter)


//http://localhost:3000/api/v1/users
export default app;