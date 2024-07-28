import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
//to know about alreDY REGEISTERED USER
import { User } from "../models/user.model.js";

const registerUser = asyncHandler(async (req, res) => {
  //steps to register user
  /*
   s1-> get user detail from frontend
   s2-> validation
   s3-> check if already user exist:username&email
   s4->check for images
   s5->check for avatar
   s6-> upload them to cloudinary
   s7-> check if successfully avatar is uploaded on cloudinary ,first user is given then multer has uploaded it correctcly or not ND THEN to cloudinary
    s8-> create user object-create entry in db
    s9-> remove password and refresh token field from response
    s10->check for user creation 
    s11-> return res

   */
  //s1
  const { fullName, email, username, password } = req.body;
  console.log("email", email);
  //   if (fullName === "")
  //     {
  //         throw new ApiError(400,"Please enter full name")
  //   } instead of doing this long method for all lets see a different method
  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All Fields Are Required");
  }

const existedUser = User.findOne({
  $or: [{ username }, { email }],
});
if (existedUser) {
  throw new ApiError(409, "User with email or username already exists");
}
req.files?.avatar[0]?.path
});
export { registerUser };
