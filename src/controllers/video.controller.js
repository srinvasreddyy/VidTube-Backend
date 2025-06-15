import { asyncHandler } from "../utils/asyncHandler.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Videos from "../models/videos.model.js";
import User from "../models/user.model.js";
import cloudinary from "cloudinary"

const uploadVideo = asyncHandler(async (req, res) => {

    const user = req.user
    if (!user) throw new ApiError(400, "user not found")

    const { title, description } = req.body
    console.log(req.body);

    if (!title || !description) {
        throw new ApiError(400, "All fields are required")
    }
    if (title.length < 10 || title.length > 30) {
        throw new ApiError(400, "Title should be greater than 10 character and less than 30 character")
    }
    if (description.length < 20 || description.length > 200) {
        throw new ApiError(400, "Description should be greater than 20 characters and less than 200 characters")
    }

    const uploadedVideo = req.file?.path
    if (!uploadedVideo) throw new ApiError(400, "Video not found")

    const publishedVideo = await uploadOnCloudinary(uploadedVideo)

    const newVideo = await Videos.create({
        title: title,
        videoURL: publishedVideo.secure_url,
        isPublished: true,
        ownerId: user._id,
        duration: publishedVideo.duration,
        description: description,
        videoPublicId: publishedVideo.public_id,
        ownerName: user.fullname,
        ownerAvatar: user.avatar,
    })

    return res
        .status(201)
        .json(new ApiResponse(201, newVideo, "Video uploaded successfully"))
})

const getVideos = asyncHandler(async (req, res) => {
    const username = req.user.username

    const user = await User.findOne({ username: username })
    if (!user) throw new ApiError(400, "user not found")

    const videos = await User.aggregate([
        {
            $match: { _id: user._id }
        },
        {
            $lookup: {
                from: "videos",
                localField: "_id",
                foreignField: "ownerId",
                as: "videos"
            }
        }
    ])

    return res
        .status(200)
        .json(new ApiResponse(200, videos[0]?.videos, "Videos Fetched Successfully"))

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    const video = await Videos.findOne({ _id: videoId })
    if (!video) throw new ApiError(400, "Video not found")

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video Fetched Successfully"))
})

const updateVideoDetails = asyncHandler(async (req, res) => {
    const user = req.user
    if (!user) throw new ApiError(400, "user not found")

    const { title, description } = req.body
    const { videoId } = req.params

    if (!videoId) throw new ApiError(400, "Video not found")
    
    const video = await Videos.findById(videoId)
    if (!video) throw new ApiError(400, "Video not found")

    if(user._id.toString() !== video.ownerId.toString()) throw new ApiError(400, "You are not authorized to update this video")
    
    function validation(title,description){
            if (title) {
                if (title.length < 10 || title.length > 30) {
                throw new ApiError(400, "Title should be greater than 10 character and less than 30 character")
                }
            }
            if(description){
                if (description.length < 20 || description.length > 200) {
                throw new ApiError(400, "Description should be greater than 20 character and less than 200 characterz")
                }
            }
    }
    if (!title && !description) {
        throw new ApiError(400, "All fields are required")
    }
    if(!title && description){
        validation(title,description)
        video.description = description
        await video.save()
        return res
        .status(200)
        .json(new ApiResponse(200, video.description, "Video Description Updated Successfully"))
    } 
    if(title && !description){
        validation(title,description)
        video.title = title
        await video.save()
        return res
        .status(200)
        .json(new ApiResponse(200, video.title, "Video Title Updated Successfully"))
    }
    if(title && description){
        validation(title,description)
        video.title = title
        video.description = description
        await video.save()
        return res
        .status(200)
        .json(new ApiResponse(200, video, "Video Updated Successfully"))
    }

    
})

const deleteVideo = asyncHandler(async (req, res) => {
    const user = req.user
    if (!user) throw new ApiError(400, "user not found")

    const { videoId } = req.params

    if (!videoId) throw new ApiError(400, "Video not found")

    const video = await Videos.findById(videoId)
    if (!video) throw new ApiError(400, "Video not found")

    if(user._id.toString() !== video.ownerId.toString()) throw new ApiError(400, "You are not authorized to update this video")

    try {
        await cloudinary.uploader.destroy(video.videoPublicId)
    } catch (error) {
        console.log(error.message)
        throw new ApiError(400, "error while deleting video from cloudinary")
    }

    
    try {
       await Videos.findByIdAndDelete(videoId)
    } catch (error) {
        console.log(error.message)
        throw new ApiError(400, "error while deleting video from database")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video Deleted Successfully"))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const user = req.user
    if (!user) throw new ApiError(400, "User not found")

    const { videoId } = req.params
    if (!videoId) throw new ApiError(400, "Video ID is required")

    const video = await Videos.findById(videoId)
    if (!video) throw new ApiError(404, "Video not found")

    if (user._id.toString() !== video.ownerId.toString()) {
        throw new ApiError(403, "You are not authorized to update this video")
    }

    video.isPublished = !video.isPublished
    await video.save()

    return res
        .status(200)
        .json(new ApiResponse(200, video, `Video is now ${video.isPublished ? 'Published' : 'Unpublished'}`))
})

export {
    uploadVideo,
    getVideos,
    getVideoById,
    updateVideoDetails,
    deleteVideo,
    togglePublishStatus
}