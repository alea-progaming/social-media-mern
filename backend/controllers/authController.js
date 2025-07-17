const catchAsync = require("../utils/catchAsync");
const generateOTP = require("../utils/generateOTP");
const User = require("../models/userModel");
const AppError = require("../utils/appError");
const jwt = require("jsonwebtoken");

// signToken function
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// this function generate token, create cookie, send the cookie and send the response
const createSendToken = (user, statusCode, res, message) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "Lax",
  };
  res.cookie("token", token, cookieOptions);
  user.password = undefined;
  user.otp = undefined;
  res.status(statusCode).json({
    status: "success",
    message,
    token,
    data: user,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const { username, email, password, passwordConfirm } = req.body;
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return next(new AppError("Email already registered", 400));
  }
  const otp = generateOTP();
  const otpExpires = Date.now() + 24 * 60 * 60 * 1000;
  const newUser = await User.create({
    username,
    email,
    password,
    passwordConfirm,
    otp,
    otpExpires,
  });
  res.status(200).json({
    status: "success",
    data: {
      user: newUser,
    },
  });
});
