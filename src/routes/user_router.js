import express from "express";
import { registerUser } from "../controllers/user_controller.js";
import { upload } from "../middlewares/multer_middle.js";
import {loginUser,logoutUser} from "../controllers/user_controller.js"
import { refreshAccessToken } from "../controllers/user_controller.js";
import authmiddleware from "../middlewares/auth_middleware.js"

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

userRouter.route("/logout").post(authmiddleware,logoutUser)

userRouter.route("/refresh-access-token").post(refreshAccessToken)

export default userRouter