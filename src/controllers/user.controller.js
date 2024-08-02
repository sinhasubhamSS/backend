import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
//to know about alreDY REGEISTERED USER
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/clodinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
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

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }
  console.log(req.files);
  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;
  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }
  // console.log(avatarLocalPath);
  // console.log("checking 1",coverImageLocalPath);
  if (!avatarLocalPath) {
    throw new ApiError(100, "Avatar is required");
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  // console.log(avatar);
  const coverImage = coverImageLocalPath
    ? await uploadOnCloudinary(coverImageLocalPath)
    : null;
  // console.log("Avatar upload result: ", avatar);
  // console.log("Cover image upload result:", coverImage);
  if (!avatar) {
    throw new ApiError(100, "Avatar is required");
  }
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });
  const createrUser = await User.findById(user._id).select(
    "-password-refreshToken"
  );
  if (!createrUser) {
    throw new ApiError(500, "Sometthing went wrong while regitering the user");
  }
  return res
    .status(201)
    .json(new ApiResponse(200, createrUser, "User registered succesffully"));
});
const loginUser=asyncHandler(async(req,res))
export { registerUser };
