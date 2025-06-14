
import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = mongoose.Schema({
    videoId: {
        type : String, 
        required :true,
        unique :  true,
        trim : true,
        lowercase : true
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
        required : true
    },
    likes:{
        type : Number,
        required : true
    },
    description:{
        type :String,
        required :true
    }
},{
    timestamps : true
})

videoSchema.plugin(mongooseAggregatePaginate)

const Videos = mongoose.model("Video",videoSchema)

export default Videos