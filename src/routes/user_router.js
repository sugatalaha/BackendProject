import express from "express";
import registerUser from "../controllers/user_controller.js";
import { upload } from "../middlewares/multer_middle.js";

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

export default userRouter