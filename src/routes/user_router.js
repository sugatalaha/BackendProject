import express from "express";
import { changePassword, getCurrentUser, getUserChannelProfile, getWatchHistory, registerUser, updateUserAvatar, updateUserCoverImage, updateUserDetails } from "../controllers/user_controller.js";
import { upload } from "../middlewares/multer_middle.js";
import {loginUser,logoutUser} from "../controllers/user_controller.js"
import { refreshAccessToken } from "../controllers/user_controller.js";
import { verifyJWT } from "../middlewares/auth_middleware.js"

const userRouter=express.Router()

userRouter.route("/register").post(
    upload.fields(
        [
            {
                name:"Avatar",
                maxCount:1
            },
            {
                name:"CoverImage",
                maxCount:1
            }
        ]
    )
    ,
    registerUser)

userRouter.route("/login").post(loginUser);

userRouter.route("/logout").post(verifyJWT,logoutUser)

userRouter.route("/refresh-access-token").post(refreshAccessToken)

userRouter.route('/change-password').post(verifyJWT,changePassword)

userRouter.route('/current-user').get(verifyJWT,getCurrentUser)

userRouter.route('/update-user').patch(verifyJWT,updateUserDetails)

userRouter.route('/avatar').patch(verifyJWT,upload.single("avatar"),updateUserAvatar)

userRouter.route('/coverimage').patch(verifyJWT,upload.single("coverImage"),updateUserCoverImage)

userRouter.route('/c/:username').get(verifyJWT,getUserChannelProfile)

userRouter.route("/history").get(verifyJWT,getWatchHistory)
export default userRouter