import mongoose, { version } from "mongoose";
// import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"




const userSchema = mongoose.Schema({
    fullname: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: [true, "Password is required"]
    },
    avatar: {
        type: String,
        // required : true
    },
    avatarPublicId: {
        type: String
    },
    coverImagePublicId: {
        type: String
    },
    coverImage: {
        type: String,
        // required :true
    },
    refreshToken: {
        type: String,
        // required : true
    },
    watchHistory: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Videos"
        }
    ]
},
    {
        timestamps: true
    },
    {
        versionkey: false
    }
)

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next()
    this.password = await bcrypt.hash(this.password, 10)
    next()
})


// userSchema.plugin(mongooseAggregatePaginate)
const User = mongoose.model("User", userSchema)
export default User