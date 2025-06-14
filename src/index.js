import dotenv from "dotenv"
import {app} from "./app.js"
import DBconnection from "./db/index.js";

dotenv.config({
    path : "C:\Users\ADMIN\Desktop\Backend-project\.env"
})      
const PORT =8000;

DBconnection()
.then(()=>{
    app.listen(PORT, ()=>{
        console.log("Server connected at : ",PORT)
    })  
})
.catch((err)=>{
    console.log("ERROR ",err)
})