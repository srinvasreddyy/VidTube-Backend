import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const subscriptionsSchema = mongoose.Schema({
    subscriber : {
        type : Schema.Types.ObjectId,
        ref : "User"
    },
    channelId : {
        type : Schema.Types.ObjectId,
        ref : "Channel"
    }
},
{
    timestamps : true
})
subscriptionsSchema.plugin(mongooseAggregatePaginate)

export default Subscriptions = mongoose.model("Subscription",subscriptionsSchema)