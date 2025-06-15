import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const tweetSchema = mongoose.Schema({
    content : {
        type : String,
        required : true
    },
    ownerId : {
        type : Schema.Types.ObjectId,
        ref: "User"
    },
    ownerName: {
        type : String,
        required : true
    },
    ownerAvatar : {
        type : String,
        required : true
    }
},{timestamps:true}
)

tweetSchema.plugin(mongooseAggregatePaginate);

const Tweet = mongoose.model("Tweet",tweetSchema)
export {Tweet}