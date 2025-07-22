const catchAsync = require("../utils/catchAsync");
const generateOTP = require("../utils/generateOTP");
const User = require("../models/userModel");
const AppError = require("../utils/appError");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const hbs = require("hbs");
const sendEmail = require("../utils/email");

const loadTemplate = (templateName, replacements) => {
  const templatePath = path.join(__dirname, "../emailTemplate", templateName);
  const source = fs.readFileSync(templatePath, "utf-8");
  const template = hbs.compile(source);
  return template(replacements);
};

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
  // res.status(200).json({
  //   status: "success",
  //   data: {
  //     user: newUser,
  //   },
  // });

  const htmlTemplate = loadTemplate("otpTemplate.hbs", {
    title: "OTP Verification",
    username: newUser.username,
    otp,
    message: "Your One-Time Password (OTP) for account verification is:",
  });

  try {
    await sendEmail({
      email: newUser.email,
      subject: "OTP for Email Verification",
      html: htmlTemplate,
    });

    createSendToken(
      newUser,
      200,
      res,
      "Registration Successful. Check your email for OTP verificaton."
    );
  } catch (error) {
    console.error("❌ Email sending failed:", error);

    await User.findByIdAndDelete(newUser.id);
    return next(
      new AppError(
        "There is an error creating the account. Please try again later.",
        500
      )
    );
  }
});

// Verify user account controller

exports.verifyAccount = catchAsync(async (req, res, next) => {
  const { otp } = req.body;
  if (!otp) {
    return next(new AppError("Otp is required for verification", 400));
  }

  const user = req.user;

  if (user.otp !== otp) {
    return next(new AppError("Invalid OTP", 400));
  }

  if (Date.now() > user.otpExpires) {
    return next(new AppError("OTP has expired. Please request a new OTP", 400));
  }

  user.isVerified = true;
  user.otp = undefined;
  user.otpExpires = undefined;

  await user.save({ validateBeforeSave: false });

  createSendToken(user, 200, res, "Email has been verified");
});

exports.resendOtp = catchAsync(async (req, res, next) => {
  const { email } = req.user;
  if (!email) {
    return next(new AppError("Email is required", 400));
  }

  const user = await User.findOne({ email });

  if (!user) {
    return next(new AppError("User Not Found", 404));
  }

  if (user.isVerified) {
    return next(new AppError("This account is already verified", 400));
  }

  const otp = generateOTP();

  const otpExpires = Date.now() + 24 * 60 * 60 * 1000;

  user.otp = otp;
  user.otpExpires = otpExpires;
  await user.save({ validateBeforeSave: false });

  const htmlTemplate = loadTemplate("otpTemplate.hbs", {
    title: "OTP Verification",
    username: user.username,
    otp,
    message: "Your One-Time Password (OTP) for account verification is:",
  });

  try {
    await sendEmail({
      email: user.email,
      subject: "Resent OTP for email verification",
      html: htmlTemplate,
    });

    res.status(200).json({
      status: "success",
      message: "A new OTP is sent to your email",
    });
  } catch (error) {
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError("There is an error sending email. Try again later", 500)
    );
  }
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError("Please provide email and password.", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  createSendToken(user, 200, res, "Log in successful");
});

exports.logout = catchAsync(async (req, res, next) => {
  res.cookie("token", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });

  res.status(200).json({
    status: "success",
    message: "Logged out successfully.",
  });
});

exports.forgetPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return next(new AppError("No user found", 404));
  }

  const otp = generateOTP();
  const resetExpires = Date.now() + 300000; // 5mins

  user.resetPasswordOTP = otp;
  user.resetPasswordOTPExpires = resetExpires;

  await user.save({ validateBeforeSave: false });

  const htmlTemplate = loadTemplate("otpTemplate.hbs", {
    title: "Reset password OTP",
    username: user.username,
    otp,
    message: "Your password reset otp is ",
  });

  try {
    await sendEmail({
      email: user.email,
      subject: "Password reset OTP (Valid for 5 minutes)",
      html: htmlTemplate,
    });

    res.status(200).json({
      status: "success",
      message: "Password reset OTP is sent to your email.",
    });
  } catch (error) {
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError("There was an error sending the email. Try again later", 500)
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const { email, otp, password, passwordConfirm } = req.body;
  const user = await User.findOne({
    email,
    resetPasswordOTP: otp,
    resetPasswordOTPExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError("No user found", 400));
  }

  user.password = password;
  user.passwordConfirm = passwordConfirm;
  user.resetPasswordOTP = undefined;
  user.resetPasswordOTPExpires = undefine;

  await user.save();
  createSendToken(user, 200, res, "Password reset successfully");
});

exports.changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword, newPasswordConfirm } = req.body;

  const { email } = req.user;

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  if (!(await user.correctPassword(currentPassword, user.password))) {
    return next(new AppError("Incorrect current password", 400));
  }

  if (newPassword !== newPasswordConfirm) {
    return next(
      new AppError("New password and confirm password are not the same", 400)
    );
  }

  user.password = newPassword;
  user.passwordConfirm = newPasswordConfirm;
  user.save();
  createSendToken(user, 200, res, "Password changed successfully");
});
