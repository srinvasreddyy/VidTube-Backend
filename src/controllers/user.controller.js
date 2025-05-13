import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import User from "../models/user.model.js"
import uploadOnCloudinary from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";


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
        $or: [{ email }]
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
        coverImage: coverImage.url
    })


    //now lets get the created user
    const createdUser = await User.findById(newuser._id).select("-password -refreshToken")

    return res
        .status(201)
        .json(new ApiResponse(201, createdUser, "User Rigestered Successfully"))

})

//generates accesses amd refresh Tokens used in login
const generateRefreshTokenAndAccessToken = async (userid) => {

    const user = await User.findById(userid)
    //vadlidation for the user exists
    if (!user) {
        throw new ApiError(404, "user not found")
    }
    const accessToken = await user.generateAccessToken()
    const refreshToken = await user.generateRefreshToken()
    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false })
    return { accessToken, refreshToken }
}


//checking if the user exists in DB later logging him in
const loginUser = asyncHandler(async (req, res) => {
    //getting data from user
    const { email, password } = req.body
     
    if(!email || !password){
        return new ApiError(400, "All fields are required")
    }

    //validation
    const user = await User.findOne({ email })
    if (!user) {
        throw new ApiError(401, "user not found")
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password)
    if (!isPasswordCorrect) {
        throw new ApiError(401, "password is incorrect")
    }

    const { accessToken, refreshToken } = await generateRefreshTokenAndAccessToken(user._id)

    //getting loggidin user
    const loggedinUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        secure : true,
        httpOnly: true
    }
    return res
    .status(200)
    .cookie("refreshToken",refreshToken,options)
    .cookie("accessToken",accessToken,options)
    .json(new ApiResponse(200, { loggedinUser , accessToken, refreshToken}, "Login Successfull"))
})


const refreshAccessToken = asyncHandler(async (req, res) => { 
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken
    if (!refreshToken) {
        throw new ApiError(401, "refresh token is missing") 
    }

    const user = await User.findOne({ refreshToken })
    if (!user) {
        throw new ApiError(401, "user not found")
    }   
    
})


export {
    rigesterUser,
    loginUser
}