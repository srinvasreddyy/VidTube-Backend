    /**
     * channelID : string pk
     createdBy : objectId user
    createdDate : date
    channelName  : string
    TOTsubscribers : number
    TOTviews : number
    */
    import mongoose from "mongoose";
    import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

    const channelSchema = new mongoose.Schema(
        {
        channelID: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            unique: true, 
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", 
            required: true,
        },
        createdDate: {
            type: Date,
            default: Date.now,
        },
        channelName: {
            type: String,
            required: true,
            trim: true,
        },
        TOTsubscribers: {
            type: Number,
            default: 0,
            min: 0,
        },
        TOTviews: {
            type: Number,
            default: 0,
            min: 0,
        },
        },
        {
        timestamps: true, // adds createdAt and updatedAt automatically
        }
    );
    
    channelSchema.plugin(mongooseAggregatePaginate)
    // Export the model
    const Channel = mongoose.model("Channel", channelSchema);
    export default Channel;
    