// require('dotenv').config({path:'./env'})

import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";
dotenv.config({
  path: "./env",
});

connectDB()
.then(()=>{
  app.listen(process.env.PORT || 8000,()=>{
    console.log(` Server is runnning at port : ${process.env.PORT}`);
  })
})
.catch((err)=>{
  console.log("MONGODB connection failed !!! ",err);
})

// import mongoose from "mongoose";
// import

// // always use try catch with database talking
// (async () => {
//   try {
//     const connectionInstance = await mongoose.connect(
//       `${process.env.MONGODB_URL}/${DB_NAME}`
//     );
//     console.log(
//       `\n MongoDB connected  !! DB HOST :${connectionInstance.connection.host}`
//     );
//   } catch (error) {
//     console.log("Errot :", error);
//     throw error;
//   }
// })();
