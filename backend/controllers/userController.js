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
      path: "savePosts",
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
