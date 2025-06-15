import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const postTweet = asyncHandler(async(req,res)=>{
    const user = await User.findById(req.user._id)
    if(!user) throw new ApiError(400,"no user found")
    const {content} = req.body
    if(!content) throw new ApiError(400,"Tweet content is required")
    const tweet = await Tweet.create({
        content:content,
        ownerId : user._id,
        ownerName : user.fullname,
        ownerAvatar : user.avatar
    })

    return res
    .status(200)
    .json(new ApiResponse(200,tweet,"Tweet posted successfully"))
})
const getUserTweets = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id)
    if(!user) throw new ApiError(400,"user not exists")
    
    const tweets = await Tweet.aggregate([
        {
            $match : {
                ownerId : user._id
            }
        },
        {
            $sort : {
                createdAt : -1
            }
        },
        {
            $project:{
                content : 1,
                ownerName : 1,
                ownerAvatar : 1,
                createdAt :1
            }
        }
    ])

    return res
    .status(200)
    .json(new ApiResponse(201,tweets,"Tweets Fetched Successfully"))
})
const updateTweet = asyncHandler(async (req, res) => {
    const tweetId = req.params.id
    const tweet = await Tweet.findById(tweetId)
    if(!tweet) throw new ApiError(400,"Tweet not found")
    const user = await User.findById(req.user._id)
    if(!user) throw new ApiError(400,"user not exists")
    if(user._id.toString() !== tweet.ownerId.toString()) throw new ApiError(400,"You are not authorized to update this tweet")
    const {content} = req.body
    tweet.content = content
    await tweet.save()

    return res
    .status(200)
    .json(new ApiResponse(201,tweet,"Tweet Updated Successfully"))
})
const deleteTweet = asyncHandler(async(req,res)=>{
    const tweetId = req.params.id
    const tweet = await Tweet.findById(tweetId)
    if(!tweet) throw new ApiError(400,"Tweet not found")
    const user = await User.findById(req.user._id)
    if(!user) throw new ApiError(400,"user not exists")
    if(user._id.toString() !== tweet.ownerId.toString()) throw new ApiError(400,"You are not authorized to delete this tweet")
    await tweet.remove()
    return res
    .status(200)
    .json(new ApiResponse(201,tweet,"Tweet Deleted Successfully"))
})
const getTweetById = asyncHandler(async(req,res)=>{
    const tweetId = req.params.id
    const tweet = await Tweet.findById(tweetId)
    if(!tweet) throw new ApiError(400,"Tweet not found")
    return res
    .status(200)
    .json(new ApiResponse(201,tweet,"Tweet Fetched Successfully"))
})
export {
    postTweet,
    getUserTweets,
    updateTweet,
    deleteTweet,
    getTweetById
}