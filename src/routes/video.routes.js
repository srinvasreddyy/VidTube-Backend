import upload from "../middleware/multer.middleware.js"
import {verifyToken} from "../middleware/authMiddleware.js"
import { Router } from "express";
import {
    uploadVideo,
    getVideos,
    getVideoById,
    updateVideoDetails,
    deleteVideo,
    togglePublishStatus
} from "../controllers/video.controller.js";

const router = Router()

router
.route("/uploadVideo").post(
    verifyToken,
    upload.single("video"),
    uploadVideo
)

router
.route("/getVideos").get(
    verifyToken,
    getVideos
)

router
.route("/getVideoById/:videoId").get(
    verifyToken,
    getVideoById
)

router
.route("/updateVideoDetails/:videoId").patch(
    verifyToken,
    updateVideoDetails
)

router
.route("/deleteVideo/:videoId").delete(
    verifyToken,
    deleteVideo
)

router
.route("/togglePublishStatus/:videoId").patch(
    verifyToken,
    togglePublishStatus
)

export default router