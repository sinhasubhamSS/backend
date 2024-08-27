import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
//to know about alreDY REGEISTERED USER
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/clodinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId)
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()
    //we give access token to user but keep refresh token in databse so tht user can easily logged in

    user.refreshToken = refreshToken
    user.save({ validateBeforeSave: false })
    return { accessToken, refreshToken }

  } catch (error) {
    throw new ApiError(500, "something went wrong while genetarting the refresh and acess token")

  }
}
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
const loginUser = asyncHandler(async (req, res) => {
  console.log('LoginUser function reached');
  //req body sa data la aao
  /*check if username or email is ther or not
  check if the user is their or not and not then send to create account
  if user is their check for the password 
  access and refresh token generate and send to the user for future use 
  send tooken in cookies */
  const { email, userName, password } = req.body
  console.log(email);
  // if (!userName || !email) 
  if (!userName && !email) {
    // if (!(userName||email)){
    throw new ApiError(400, "Username or email is required")
  }
  const user = await User.findOne({
    $or: [{ userName }, { email }]
  })
  if (!user) {
    throw new ApiError(404, "User doen not exist")
  }
  //if user is their check the password using bcrypt defined in the user schema
  //Note: User and user are different User is monogoDb ka moongose ka object hai it has all methods of mongoDb

  const ispasswordValid = await user.isPasswordCorrect(password)
  if (!ispasswordValid) {
    throw new ApiError(401, "invalid password")
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens((user._id))
  const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
  const options = {
    httpOnly: true,
    secure: true
  }
  return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200, {
        user: loggedInUser, accessToken, refreshToken
      },
        "User logged in successfully"
      )
    )

})
const logoutUser = asyncHandler(async (req, res) => {
  User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1 // this removes the field from document

      }
    },
    {
      new: true
    }
  )
  const options = {
    httpOnly: true,
    secure: true
  }
  return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logged Out Successfully"))
})
const refreshAccesToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
  if (!refreshAccesToken) {
    throw ApiError(401, "unauthorize user ")
  }
  try {
    const decodedToken = jwt.verify(refreshAccesToken, process.env.REFRESH_TOKEN_SECRET)
    const user = await User.findById(decodedToken?._id)
    if (!user) {
      throw new ApiError(401, "Invalid Refresh Token")

    }
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh Token is expired or used ")
    }
    const options = {
      httpOnly: true,
      secure: true
    }
    const { accessToken, newrefreshToken } = await generateAccessAndRefreshTokens(user._id)
    return res
      .status(200)
      .cookie("accessToken", accessToken)
      .cookie("refreshToken", newrefreshToken)
      .json(
        new ApiResponse(
          200, {
          accessToken, refreshToken: newrefreshToken
        },
          "Access tokeen refreshed successfully"

        )
      )

  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Refresh Token")

  }

})
const chnageCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body
  const user = await User.findById(req.user?._id)
  const isPasswordCorrect = user.isPasswordCorrect(oldPassword)
  if (!isPasswordCorrect) {
    throw new ApiError(401, "Old password is incorrect")
  }
  //settimg new password
  user.password = newPassword
  await user.save({ validateBeforeSave: false })
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "password changed"))

})
const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(200, req.user, "current user fetched successfully")
})
const updateAccountdetail = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body
  //1:56:50 check oce again
  if (!fullName || !email) {
    throw new ApiError(400, "All fields are required")
  }
  const user = await User.findByIdAndUpdate(req.user?._id, {
    $set: {
      fullName,
      email: email
    }
  },
    { new: true }).select("-password")
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details uploaded successfully"))
})
const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path
  const oldimage = user.avatar
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing")
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath)
  if (!avatar.url) {
    throw new ApiError(400, "Error while uploading the avatar")

  }
  const user = await User.findByIdAndUpdate(req.user?._id,
    {
      $set: {
        avatar: avatar.url
      }
    }, {
    new: true
  }

  ).select("-password")
  //deleting ld image 
  if (oldimage) {
    await cloudinary.uploader.destroy(oldimage)
    console.log("old image deleted");
  }

  return res
    .status(200)
    .json(
      new ApiError(200, user, "Avatar Image updated")
    )
})
const updateUserCoverImage = asyncHandler(async (req, res) => {
  const CoverImageLocalPath = req.file?.path
  if (!CoverImageLocalPath) {
    throw new ApiError(400, "Avatar file is missing")
  }
  const coverImage = await uploadOnCloudinary(CoverImageLocalPath)
  if (!coverImage.url) {
    throw new ApiError(400, "Error while uploading the avatar")

  }
  const user = await User.findByIdAndUpdate(req.user?._id,
    {
      $set: {
        coverImage: coverImage.url
      }
    }, {
    new: true
  }

  ).select("-password")
  return res
    .status(200)
    .json(
      new ApiError(200, user, "Cover Image updated")
    )
})
const getChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params
  if (!username?.trim()) {
    throw new ApiError(400, "username is missing")
  }
  const channel = User.aggregate([{
    $match: {
      username: username?.toLowerCase()
    }
  },
  {
    $lookup: {
      from: "subscriptions",
      localField: _id,
      foreignField: channel,
      as: "subscribers"
    }
  },
  {
    $lookup: {
      from: "subscriptions",
      localField: _id,
      foreignField: subscriber,
      as: "subscribedTo"
    }
  }, {
    $addFields: {
      subscriberCount: {
        $size: "$subscribers"
      },
      channelSubscribedToCount: {
        $size: "$subscribedTo"
      },
      isSubscribed: {
        $cond: {
          if: { $in: [req.user?._id, "$subscrbers.subscriber"] },
          then: true,
          else: false
        }
      }

    }
  }, {
    $project: {
      fullName: 1,
      username: 1,
      subscriberCount: 1,
      channelSubscribedToCount: 1,
      isSubscribed: 1,
      avatar: 1,
      coverImage: 1,
      email: 1

    }
  }
  ])//returns arrays
  if(!channel?.length){
    throw new ApiError(404,"Channel does not  exist")
  }
  console.log(channel);
  return res
  .status(200)
  .json(new ApiResponse(200,channel[0],"User channel fetched successfully"))
  
})

//then create access abd refresh token .....as it is reusable part of code lets out it in the methods
export {
  registerUser, loginUser, logoutUser, refreshAccesToken, chnageCurrentPassword, getCurrentUser, updateAccountdetail
  , updateUserAvatar, updateUserCoverImage, getChannelProfile,
};

