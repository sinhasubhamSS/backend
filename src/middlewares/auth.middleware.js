import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";
//it only verify if user is their or not
export const verifyJWT = asyncHandler(async (req, _ , next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

        if (!token) {
            throw new ApiError(401, "Unauthorize request")
        }
        //checking if the token is correct or not -> this will be done by decoding access token  using the verify method
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
        if (!user) {
            throw new ApiError(401, "Invalid Acces Token")
        }
        req.user = user;
        next()

    } catch (error) {
        console.error("JWT Verification Error:", error);
        throw new ApiError(401, error?.message || "invalid access token")
    }
})