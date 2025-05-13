import { Router } from "express";
import { rigesterUser } from "../controllers/user.controller.js";
import upload from "../middleware/multer.middleware.js"

const router = Router()

router.route("/rigester").post(
    upload.fields([
        {
            name : "avatar",
            maxCount : 1
        },
        {
            name : "coverImage",
            maxCount : 1
        }
    ]),
    rigesterUser
)


export default router