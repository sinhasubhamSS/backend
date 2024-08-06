import mongoose, { Schema } from "mongoose";
const subscriptionSchema = new Schema({
    subscriber:{
        types:Schema.Types.ObjectId,
        ref:"User"
    },
    channel:{
        types:Schema.Types.ObjectId,
        ref:"User"
    }
    
},{timestamps:true}
)
export const Subcription=mongoose.model("Subscription",subscriptionSchema)