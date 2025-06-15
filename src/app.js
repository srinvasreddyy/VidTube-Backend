import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";

const app = express();

//middleware that are used to maupulate the data transfer between the server and requests
app.use(cors({
    origin : process.env.CORS_ORIGIN, //whom we need to allow 
    credentials : true  //does need to allow credintials
}))

app.use(express.json({
    limit:"1000000kb" //data intake should be not more than 16kb
}))

app.use(express.urlencoded({
    limit:"10000kb", //data intake should be not more than 100kb from the url
    extended: true  //handles the complex data 
}))
app.use(express.static("public")) //serve extra files from public named directory
app.use(cookieParser())   //this will handle cookies

//import router ( in route files we exported as default so we can import any name we want )
import healthcheckRouter from "./routes/healthcheck.route.js";
import userRouter from "./routes/user.route.js";
import videoRouter from "./routes/video.routes.js";
//routes
app.use("/api/v1/healthcheck",healthcheckRouter)
app.use("/api/v1/user",userRouter)
app.use("/api/v1/video",videoRouter)

export {app}