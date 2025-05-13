import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";


//creating a controller for every route
const healthcheck =  asyncHandler(async (req, res)=>{
    return res.json(new ApiResponse(200 , "OK " , "Health Passeed"))
})

export { healthcheck }