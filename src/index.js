// require('dotenv').config({path:'./env'})

import dotenv from "dotenv";
import connectDB from "./db/index.js";
dotenv.config({
  path: "./env",
});

connectDB();

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
