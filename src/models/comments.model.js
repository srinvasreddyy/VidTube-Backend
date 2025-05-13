/*
 userid : objectId user
  content : string
  createdDate : date
*/

import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const commentsSchema = mongoose.Schema({
    userid: {
        type : Schema.Types.ObjectId,
        ref : "User"
    },
    content: {
        type : String,
        required :true,
    }
},
{
    timestamps : true
})
commentsSchema.plugin(mongooseAggregatePaginate)

export default Comments = mongoose.model("Comments",commentsSchema)