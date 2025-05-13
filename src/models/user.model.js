import mongoose, { version } from "mongoose";
// import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"




const userSchema = mongoose.Schema({
    fullname: {
        type : String,
        required :true,
        trim : true,
    },
    email: {
        type : String,
        required :true,
        // unique :  true,
        trim : true,
        lowercase : true
    },
    username : {
        type : String,
        required :true,
        unique :  true,
        trim : true,
        lowercase : true
    },
    password :{
        type : String,
        required :[true , "Password is required"]
    },  
    avatar : {
        type : String,
        // required : true
    },
    coverImage : {
        type : String,
        // required :true
    },
    refreshToken : {
        type : String,
        // required : true
    }
},
{
    timestamps : true
},
{
    versionkey : false
}
)

userSchema.pre("save" ,async function(next){  //TO ENCRYPT PASSWORD WHEN EVER IT SAVED OR MODIFIED
    if(!this.isModified("password")) return next()
    this.password = bcrypt.hash(this.password , 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function(){   //CHECKING ENTERED PASSWORD IS CORRECT OR NOT
    return await bcrypt.compare(password ,this.password)
}
userSchema.methods.generateAccessToken = function(){
    jwt.sign( //this generates access token using provided information
        {
            _id: this._id,
            email : this.email
        },
        process.env.ACCESS_TOKEN_EXPIRY,
        {
            expiresIn : process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = function(){
    jwt.sign( //this generates access token using provided information
        {
            _id: this._id,
            email : this.email
        },
        process.env.REFRESH_TOKEN_EXPIRY,
        {
            expiresIn : process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}


// userSchema.plugin(mongooseAggregatePaginate)
const User = mongoose.model("User",userSchema)
export default User