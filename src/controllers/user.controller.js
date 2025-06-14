import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import User from "../models/user.model.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import bcrypt from "bcrypt"
import uploadOnCloudinary from "../utils/cloudinary.js";
import cloudinary from "cloudinary"
import jwt from "jsonwebtoken"
import { mongo } from "mongoose";
import mongoose from "mongoose";

//rigestering user in DB
const rigesterUser = asyncHandler(async (req, res) => {


    //Handling the data comes from the body as text or fields
    const { fullname, email, username, password } = req.body

    //validation
    if (
        [fullname, email, username, password].some(
            (ele) => ele?.trim() === ""
        )
    ) {
        throw new ApiError(400, "All fields are required")
    }
    console.log("body : ", req.body)

    //checking if the user already exists
    const existedUser = await User.findOne({
        $or: [{ email }, { username }]
    })

    if (existedUser) {
        throw new ApiError(401, "user already exists ");

    }


    // Handling the image that comes from the req.files
    const avatarLocalpath = req.files?.avatar?.[0]?.path
    const coverLocalpath = req.files?.coverImage?.[0]?.path

    if (!avatarLocalpath || !coverLocalpath) {
        throw new ApiError(400, "cover or avatar is missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalpath)
    const coverImage = await uploadOnCloudinary(coverLocalpath)
    if (!coverImage) {
        console.log("error\n")
    }
    const newuser = await User.create({
        fullname,
        email,
        username,
        password,
        avatar: avatar.url,
        avatarPublicId: avatar.public_id,
        coverImage: coverImage.url,
        coverImagePublicId: coverImage.public_id
    })


    //now lets get the created user
    const createdUser = await User.findById(newuser._id).select("-password -refreshToken")

    return res
        .status(201)
        .json(new ApiResponse(201, createdUser, "User Rigestered Successfully"))

})

const updatePassword = asyncHandler(async (req, res) => {
    const { oldPassword, NewPassword } = req.body

    if (!oldPassword || !NewPassword) throw new ApiError(400, "Pass need to be filled")

    const Id = req.user._id
    const user = await User.findById(Id)

    if (!user) throw new ApiError(400, "user not found")

    const isPasswordCorrect = await bcrypt.compare(oldPassword, user.password)
    if (!isPasswordCorrect) throw new ApiError(400, "password is wrong")

    user.password = NewPassword
    await user.save()

    return res
        .status(200)
        .json(new ApiResponse(201, {}, `Password changed success for username ${user.username}`))
})

const updateAccountDetails = asyncHandler(async (req, res) => {
    let { fullname, newUsername } = req.body
    let Id = req.user._id
    let user = await User.findById(Id)
    if (!fullname && !newUsername) throw new ApiError(400, "Enter appropriate fields")

    if (fullname && !newUsername) {
        user.fullname = fullname
        await user.save()
    }
    if (!fullname && newUsername) {
        const existedUserName = await User.findOne({ username: newUsername })
        if (existedUserName) throw new ApiError(400, "username already exists")
        user.username = newUsername
        await user.save()
    }
    if (fullname && newUsername) {
        user.fullname = fullname
        await user.save()
        const existedUserName = await User.findOne({ username: newUsername })
        if (existedUserName) throw new ApiError(400, "username already exists")
        user.username = newUsername
        await user.save()
    }
    return res
        .status(200)
        .json(new ApiResponse(201, {}, "details changed successfully"))
})

const updateAvatar = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select("-password -refreshToken")
    if (!user) throw new ApiError(400, "user not found")
    const avatarLocalpath = req.file?.path
    if (!avatarLocalpath) throw new ApiError(400, "avatar not found")

    const result = await cloudinary.uploader.destroy(user.avatarPublicId)

    const upload = await uploadOnCloudinary(avatarLocalpath)
    user.avatarPublicId = upload.public_id
    user.avatar = upload.url
    await user.save()


    return res
        .status(200)
        .json(new ApiResponse(201, user, "avatar updated"))
})

const updateCoverImage = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select("-password -refreshToken")
    if (!user) throw new ApiError(400, "user not found")

    const coverLocalpath = req.file?.path
    if (!coverLocalpath) throw new ApiError(400, "coverimg not found")

    const result = await cloudinary.uploader.destroy(user.coverImagePublicId)

    const upload = await uploadOnCloudinary(coverLocalpath)
    user.coverImagePublicId = upload.public_id
    user.coverImage = upload.url
    await user.save()


    return res
        .status(200)
        .json(new ApiResponse(201, user, "cover updated"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken
    if (!refreshToken) {
        throw new ApiError(401, "refresh token is missing")
    }

    const decodedToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)

    const user = await User.findById(decodedToken?._id)
    if (!user) {
        throw new ApiError(401, "invalid refresh token")
    }

    if (refreshToken !== user?.refreshToken) throw new ApiError(400, "Invalid RefreshToken")

    const accessToken = jwt.sign(
        {
            _id: user._id,
            email: user.email
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
    const newRefreshToken = jwt.sign(
        {
            _id: user._id,
            email: user.email
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )

    user.refreshToken = newRefreshToken
    await user.save({ validateBeforeSave: false })

    return res
        .status(201)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(new ApiResponse(
            201,
            {
                accessToken,
                refreshToken: newRefreshToken
            },
            "Accesstoken refreshed Successfully"
        ))

})

const getCurrentUser = asyncHandler(async(req, res) => {
    return res
    .status(200)
    .json(new ApiResponse(
        200,
        req.user,
        "User fetched successfully"
    ))
})


const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    }

    return res
        .status(201)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(201, {}, "User loggedOut Successful"))
})

const loginUser = asyncHandler(async (req, res) => {

    console.log("body incoming ", req.body)

    //getting data from user
    const { email, password } = req.body

    //validation
    if (!email || !password) {
        throw new ApiError(400, "All fields are requried")
    }

    //checking user exits or not
    const foundUser = await User.findOne({
        email
    })

    //validatig found user
    if (!foundUser) {
        throw new ApiError(400, "User not found")
    }

    const PasswordCorrect = await bcrypt.compare(password, foundUser.password)

    if (!PasswordCorrect) throw new ApiError(400, "Password is wrong")

    const accessToken = jwt.sign(
        {
            _id: foundUser._id,
            email: foundUser.email
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
    const refreshToken = jwt.sign(
        {
            _id: foundUser._id,
            email: foundUser.email
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
    foundUser.refreshToken = refreshToken
    await foundUser.save({ validateBeforeSave: false })

    const options = {
        httpOnly: true
    }

    const loggedinUser = await User.findOne({ email }).select("-password -coverImage -avatar")

    console.log("login complete")
    return res
        .status(201)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(201, { loggedinUser, refreshToken, accessToken }, "Success Login")
        )
})

const getChannelDetails = asyncHandler(async (req, res) => {
    const { username } = req.params
    if (!username) throw new ApiError(404, "username not found")
    const channelDetails = await User.aggregate([
        {
            $match: {
                username : username
            }
        },
        {
            $lookup:{
                from : "subscriptions",
                localField : "_id",
                foreignField : "subscriber",
                as : "subscribedTo"
            }
        },
        {
            $lookup :{
                from : "subscriptions",
                localField : "_id",
                foreignField : "channelId",
                as : "subscribers"
            }
        },
        {
            $addFields : {
                subscribersCount : {
                    $size : "$subscribers"
                },
                subscribedToCount : {
                    $size : "$subscribedTo"
                },
                isSubscribed : {
                    $cond : {
                        if : {$in : [req.user._id, "$subscribers.subscriber"]},
                        then : true,
                        else : false
                    }
                }

            }
        },
        {
            $project:{
                subscribers : 0,
                subscribedTO : 0,
                username : 1,
                fullname : 1,
                avatar : 1,
                coverImage:1,
                subscribersCount : 1,
                subscribedToCount : 1
            }
        }
    ])
    return res
    .status(200)
    .json(new ApiResponse(200, channelDetails[0], "Details Fetched Successfully"))
})

const getWatchHistory = asyncHandler(async(req,res)=>{
    const userid = req.user._id
    const user = await User.aggregate([
        {
            $match : {
                _id : new mongoose.Types.ObjectId(userid)
            }
        },
        {
            $lookup :{
                from : "videos",
                localField : "watchHistory",
                foreignField : "_id",
                as : "watchHistory",
                pipeline : [
                    {
                        $lookup:{
                            from : "users",
                            localField : "ownerId",
                            foreignField : "_id",
                            as : "owner",
                            pipeline : [
                                {
                                    $project : {
                                        username : 1,
                                        fullname : 1,
                                        avatar : 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields : {
                            owner : {
                                $first : "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    if(!user) throw new ApiError(400, "watchHistory not found")
    return res
    .status(200)
    .json(new ApiResponse(200, user[0].watchHistory, "watchHistory Fetched Successfully"))
})

export {
    rigesterUser,
    updatePassword,
    updateAccountDetails,
    updateAvatar,
    updateCoverImage,
    refreshAccessToken,
    logoutUser,
    loginUser,
    getChannelDetails,
    getWatchHistory,
    getCurrentUser
}