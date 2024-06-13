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
import tweetRouter from "./routes/tweet_router.js"
import subscriptionRouter from "./routes/subscription_router.js"
import videoRouter from "./routes/video_router.js"
import commentRouter from "./routes/comment_router.js"
import likeRouter from "./routes/like_router.js"
import playlistRouter from "./routes/playlist_router.js"
import dashboardRouter from "./routes/dashboard_router.js"


//Configuring app with the Router
app.use('/api/v1/users',userRouter)
app.use("/api/v1/tweets", tweetRouter)
app.use("/api/v1/subscriptions", subscriptionRouter)
app.use("/api/v1/videos", videoRouter)
app.use("/api/v1/comments", commentRouter)
app.use("/api/v1/likes", likeRouter)
app.use("/api/v1/playlist", playlistRouter)
app.use("/api/v1/dashboard", dashboardRouter)


//http://localhost:3000/api/v1/users
export default app;