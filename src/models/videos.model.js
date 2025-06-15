
import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = mongoose.Schema({
    title:{
        type :String,
        required :true
    },
    videoURL: {
        type : String, //cloudnary url
        required :true,
        unique :  true,
        trim : true,
        lowercase : true
    },
    isPublished: {
        type : Boolean,
        default : true
    },
    ownerId :{
        type : Schema.Types.ObjectId,
        ref : "User"
    },
    duration: {
        type : Number,
        required : true
    },
    views:{
        type : Number,
        default: 0
    },
    likes:{
        type : Number,
        default: 0
    },
        default : 0
    },
    description:{
        type :String,
        required :true
    },
    videoPublicId: {
        type : String,
        required :true
    },
    ownerAvatar : {
        type : String,
        required :true
    },
    ownerName : {
        type : String,
        required :true
    }
},{
    timestamps : true
})

videoSchema.plugin(mongooseAggregatePaginate)

const Videos = mongoose.model("Video",videoSchema)

export default Videos