const asyncHandler = require("express-async-handler"),
  bcrypt = require("bcryptjs"),
  crypto = require("crypto");
const User = require("./../../model/user/User"),
  ErrorHandler = require("../../middlewares/Errors/ErrorHandler"),
  { sanitizeUser, selectInfoUser, infoUser } = require("../../utils/sanitize"),
  { createToken } = require("../../config/token");
const { sendEmail, templateMail } = require("../../utils/mail");
const { cloudinaryUploadImg } = require("../../utils/cloudinary");
const fs = require("fs");

// SignUp
/*
 * METHOD POST
 * Route  /api/v1/user/signup
 * Access public
 * */
exports.createUser = asyncHandler(async (req, res) => {
  const user = await User.create(req?.body);
  // noinspection JSUnresolvedVariable
  res
    ?.status(200)
    .json({ info: sanitizeUser(user), token: createToken(user._id) });
});

// Login
/*
 * METHOD POST
 * Route  /api/v1/user/login
 * Access public
 * */
exports.loginUser = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req?.body.email });
  if (!user || !(await bcrypt.compare(req?.body.password, user.password))) {
    next(new ErrorHandler(`invalid in email or password`, 401));
  }
  res
    ?.status(200)
    .json({ info: sanitizeUser(user), token: createToken(user._id) });
});

// Get Users
/*
 * METHOD GET
 * Route  /api/v1/user/
 * Access public
 * */
exports.getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select("-password");
  res?.json({
    users,
  });
});

// Get User
/*
 * METHOD GET
 * Route  /api/v1/user/info
 * Access Auth
 * */
exports.getUser = asyncHandler(async (req, res) => {
  res?.json(infoUser(req?.user));
});

// Get User By Id
/*
 * METHOD GET
 * Route  /api/v1/user/:id
 * Access Public
 * */
exports.getUserById = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req?.params.id)
    .populate("posts")
    .select(selectInfoUser);
  if (!user) {
    return next(new ErrorHandler(`This Id is not valid`, 404));
  }
  res?.json(user);
});

// Update Profile
/*
 * METHOD PATCH
 * Route  /api/v1/user/profile
 * Access Auth
 * */
exports.updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req?.user.id,
    {
      firstName: req?.body.firstName,
      lastName: req?.body.lastName,
      bio: req?.body.bio,
      profilePhoto: req?.body.profilePhoto,
    },
    { new: true }
  );
  res?.json({ info: sanitizeUser(user) });
});

// Update Photo
/*
 * METHOD POST
 * Route /api/v1/user/update-photo
 * Access Auth
 * */
exports.uploadProfilePhoto = asyncHandler(async (req, res) => {
  const localPath = `public/images/users/profile/${req?.file.filename}`;
  const imgUpload = await cloudinaryUploadImg(localPath);
  const user = await User.findByIdAndUpdate(
    req?.user,
    {
      profilePhoto: imgUpload.url,
    },
    { new: true }
  );

  res?.json({ url: user.profilePhoto, size: imgUpload.size });
  fs.unlinkSync(localPath);
});

// Change Password
/*
 * METHOD PATCH
 * Route  /api/v1/user/change-password
 * Access Auth
 * */
exports.changePassword = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req?.user.id,
    {
      password: await bcrypt.hash(req?.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    { new: true }
  );
  const token = createToken(user._id);
  res?.json({ message: user.password, token });
});

// Delete User
/*
 * METHOD DELETE
 * Route  /api/v1/user/
 * Access Auth
 * */
exports.deleteUser = asyncHandler(async (req, res) => {
  await User.findByIdAndDelete(req?.user.id);
  res?.json({ message: "done" });
});

// Account Verify Code
/*
 * METHOD GET
 * Route  /api/v1/user/account-verify-code
 * Access Auth
 * */
exports.accountVerifyCode = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req?.user.id);

  if (user.isAccountVerified) {
    return next(new ErrorHandler(`This account is already verified`, 401));
  }
  // Random Code Generation
  const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
  // Encrypt Verify Code
  user.accountVerificationCode = crypto
    .createHash("sha1")
    .update(verifyCode)
    .digest("hex");
  // Expiration for Verify Code
  user.accountVerificationCodeExpire = Date.now() + 15 * 60 * 1000;
  await user.save();
  try {
    await sendEmail({
      email: user.email,
      subject: "Your Verify code",
      message: templateMail(user.firstName, verifyCode),
    });
  } catch (err) {
    user.accountVerificationCode = undefined;
    user.accountVerificationCodeExpire = undefined;
    await user.save();
    return next(
      new ErrorHandler("Failed in send, please retry in later time.", 500)
    );
  }
  res?.json({
    status: "Success",
  });
});

// Verify Account
/*
 * METHOD POST
 * Route  /api/v1/user/verify-account
 * Access Auth
 * */
exports.verifyAccount = asyncHandler(async (req, res, next) => {
  const verifyCode = crypto
    .createHash("sha1")
    .update(req?.body.verifyCode)
    .digest("hex");
  const user = await User.findOne({
    accountVerificationCode: verifyCode,
    accountVerificationCodeExpire: { $gt: Date.now() },
  });
  if (!user) {
    return next(new ErrorHandler(`Invalid verify code or expired`, 401));
  }
  user.isAccountVerified = true;
  user.accountVerificationCode = null;
  user.accountVerificationCodeExpire = null;
  await user.save();
  res?.json({ status: "Successful" });
});

// Forget Password
/*
 * METHOD POST
 * Route  /api/v1/user/forget-password
 * Access Public
 * */
exports.forgetPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req?.body.email });
  if (!user) {
    return next(new ErrorHandler("This email is not exist"));
  }
  // Random Code Generation
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  // Encrypt Reset Code
  user.passwordResetCode = crypto
    .createHash("sha1")
    .update(resetCode)
    .digest("hex");
  // Expiration for Reset Code
  user.passwordResetExpire = Date.now() + 15 * 60 * 1000;
  await user.save();
  try {
    await sendEmail({
      email: user.email,
      subject: "Your Reset code",
      message: templateMail(user.firstName, resetCode),
    });
  } catch (err) {
    user.passwordResetCode = undefined;
    user.passwordResetExpire = undefined;
    await user.save();
    return next(
      new ErrorHandler("Failed in send, please retry in later time.", 500)
    );
  }
  res?.json({ status: "Success" });
});

// Reset Password
/*
 * METHOD POST
 * Route  /api/v1/user/reset-password
 * Access Auth
 * */
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const resetCode = crypto
    .createHash("sha1")
    .update(req?.body.resetCode)
    .digest("hex");
  const user = await User.findOne({
    passwordResetCode: resetCode,
    passwordResetExpire: { $gt: Date.now() },
  });
  if (!user) {
    return next(new ErrorHandler("Invalid reset code or expired.", 401));
  }
  if (await bcrypt.compare(req?.body.newPassword, user.password)) {
    return next(
      new ErrorHandler("This password has already been password", 401)
    );
  }
  user.password = req?.body.newPassword;
  user.passwordResetExpire = null;
  user.passwordResetCode = null;
  user.passwordChangedAt = Date.now();
  await user.save();
  res?.json({ message: "Success" });
});

// Following
/*
 * METHOD PUT
 * Route  /api/v1/user/follow
 * Access Auth
 * */
exports.followUsrServ = asyncHandler(async (req, res, next) => {
  const { followId } = req?.body;
  const { id } = req?.user;

  //0. Search on the target user and check if he is following him
  const targetUser = await User.findById(followId);
  const checkFollow = targetUser.followers.find((v) => v.toString() === id);
  if (checkFollow) {
    return next(new ErrorHandler(`You already follow this user`, 403));
  }

  //1. Find the user you want to follow and update followers
  await User.findByIdAndUpdate(
    followId,
    {
      $push: { followers: id },
      isFollowing: true,
    },
    { new: true }
  );

  //2. Update the login user following field
  await User.findByIdAndUpdate(
    id,
    {
      $push: { following: followId },
    },
    { new: true }
  );

  res?.json("You have successfully followed this user");
});

// UnFollowing
/*
 * METHOD PUT
 * Route  /api/v1/user/unfollow
 * Access Auth
 * */
exports.unFollowUsrServ = asyncHandler(async (req, res) => {
  const { unFollowId } = req?.body;
  const { id } = req?.user;

  //1. Find the user you want to UnFollow and update followers
  await User.findByIdAndUpdate(
    unFollowId,
    {
      $pull: { followers: id },
      isFollowing: false,
    },
    { new: true }
  );

  //2. Update the login user following field
  await User.findByIdAndUpdate(
    id,
    {
      $pull: { following: unFollowId },
    },
    { new: true }
  );

  res?.json("You have successfully unfollowed this user");
});

// Admin

// Update Profile
/*
 * METHOD PATCH
 * Route  /api/v1/user/admin/profile
 * Access Auth
 * */
exports.updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req?.params.id,
    {
      firstName: req?.body.firstName,
      lastName: req?.body.lastName,
      profilePhoto: req?.body.profilePhoto,
      active: req?.body.active,
    },
    { new: true }
  );
  if (!user) {
    return next(new ErrorHandler(`This Id is not valid`, 404));
  }
  res?.json({ info: user });
});

// Delete User
/*
 * METHOD DELETE
 * Route  /api/v1/user/admin/:id
 * Access Admin
 * */
exports.deleteUserById = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req?.params.id);
  if (!user) {
    return next(new ErrorHandler(`This Id is not valid`, 404));
  }
  res?.json({ message: "done" });
});

// Block User
/*
 * METHOD PATCH
 * Route  /api/v1/user/admin/block/:id
 * Access Admin
 * */
exports.blockUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req?.params.id);
  if (!user) {
    return next(new ErrorHandler(`This Id is not valid`, 404));
  }
  user.isBlocked = !user.isBlocked;
  user.save();
  res?.json({ message: "done", status: user.isBlocked });
});
