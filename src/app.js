import express from "express"
import cors from  "cors"
import cookieParser from  "cookie-parser"


const app =express()


app.use(cors({
    origin:process.env.CORS_ORIGIN,
    Credentials:true
}))

app.use(express.json({limit:"10kb"}))//data from form
app.use(express.urlencoded({extended:true,limit:"10kb"}))//for collecting data from url
app.use(express.static("public"))//stores the image  in the own server #public is the folder
//what is then cookie-parser doing
//to access the cokie from the server
//whose cookie -> yhe user cookies and also set the user cookies
app.use(cookieParser())



export{app}