const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");

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
