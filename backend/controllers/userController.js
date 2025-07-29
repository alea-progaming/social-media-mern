const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const { uploadToCloudinary } = require("../utils/cloudinary");
const getDataUri = require("../utils/dataUri");

// get user profile
exports.getProfile = catchAsync(async (req, res, next) => {
  const { id } = req.params; // /users/{id}
  const user = await User.findById(id)
    .select(
      "-password -otp -otpExpires -resetPassowrdOTP -resetPassowrdOTPExpires -passwordConfirm"
    )
    .populate({
      path: "post",
      options: { sort: { createdAt: -1 } },
    })
    .populate({
      path: "savedPosts",
      options: { sort: { createdAt: -1 } },
    });

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

exports.editProfile = catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  const { bio } = req.body;
  const profilePicture = req.file;

  let cloudResponse;

  if (profilePicture) {
    const fileUri = getDataUri(profilPicture);
    cloudResponse = await uploadToCloudinary(fileUri);
  }

  const user = await User.findById(userId).select("-password");

  if (!user) return next(new AppError("User not found", 404));
  if (bio) user.bio = bio;
  if (profilePicture) user.profilePicture = cloudResponse.secure_url;

  await user.save({ validateBeforeSave: false });

  return res.status(200).json({
    message: "Profile updated",
    status: "success",
    data: {
      user,
    },
  });
});

exports.suggestedUser = catchAsync(async (req, res, next) => {
  const loginUserId = req.user.id;
  const users = await User.find({ _id: { $ne: loginUserId } }).select(
    "-password -otp -otpExpires -resetPassowrdOTP -resetPassowrdOTPExpires -passwordConfirm"
  );

  res.status(200).json({
    status: "success",
    data: { users },
  });
});

exports.followUnfollow = catchAsync(async (req, res, next) => {
  const loginUserId = req.user.id;
  const targetUserId = req.params.id;

  if (loginUserId.toString() === targetUserId) {
    return next(new AppError("You cannot follow or unfollow yourself", 400));
  }

  const targetUser = await User.findById(targetUserId);

  if (!targetUser) {
    return next(new AppError("User not found", 404));
  }

  const isFollowing = targetUser.followers.includes(loginUserId);

  if (isFollowing) {
    await Promise.all([
      User.updateOne(
        { _id: loginUserId },
        { $pull: { following: targetUserId } }
      ),
      User.updateOne(
        { _id: loginUserId },
        { $pull: { followers: loginUserId } }
      ),
    ]);
  } else {
    await Promise.all([
      User.updateOne(
        { _id: loginUserId },
        { $addToSet: { following: targetUserId } }
      ),
      User.updateOne(
        { _id: targetUserId },
        { $addToSet: { followers: loginUserId } }
      ),
    ]);
  }

  const updatedLoggedinUser = await User.findById(loginUserId).select(
    "-password"
  );

  res.statu(200).json({
    message: isFollowing ? "Unfollowed successfully" : "Followed successfully",
    status: "success",
    data: {
      data: updatedLoggedinUser,
    },
  });
});

exports.getMe = catchAsync(async (req, res, next) => {
  const user = req.user;
  if (!user) return next(new AppError("User is not authenticated", 404));

  res.status(200).json({
    status: "success",
    message: "Authenticated User",
    data: {
      user,
    },
  });
});
