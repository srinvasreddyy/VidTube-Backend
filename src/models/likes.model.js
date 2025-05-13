/*
  likedBy : objectId user
  videoId : objectId videos
  likedDate : date
 */

import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const likesSchema = mongoose.Schema({
   likedBy :{
    type : Schema.Types.ObjectId,
    ref : "User"
   },
   videoId : {
    type : Schema.Types.ObjectId,
    ref : "Videos"
   }
},
{
    timestamps : true
})

likesSchema.plugin(mongooseAggregatePaginate)


export default Likes = mongoose.model("Likes",likesSchema)