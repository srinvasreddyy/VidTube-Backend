import jwt from "jsonwebtoken"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import User from "../models/user.model.js"


const verifyToken = asyncHandler(async (req, res, next) => {
    const Token = req.header("Authorization")?.replace("Bearer ", "") || req.cookies.accessToken

    if (!Token) throw new ApiError(400, "Invalid Token")

    try {
        const decodedToken = jwt.verify(Token, process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedToken._id).select("-password -refreshToken")
        if (!user) throw new ApiError(400, "invalid Access Token")

        req.user = user
        next()
    } catch (error) {
        throw new ApiError(400, error.message || "Unable to verify token")
    }

})

export  {verifyToken}