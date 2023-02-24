const asyncHandler = require("express-async-handler"),
  bcrypt = require("bcryptjs"),
  crypto = require("crypto");
const User = require("./../../model/user/User"),
  ErrorHandler = require("../../middlewares/Errors/ErrorHandler"),
  { sanitizeUser } = require("../../utils/sanitize"),
  { createToken } = require("../../config/token");
const { sendEmail, templateMail } = require("../../utils/mail");

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
  res?.json(req?.user);
});

// Get User By Id
/*
 * METHOD GET
 * Route  /api/v1/user/:id
 * Access Public
 * */
exports.getUserById = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req?.params.id).select("-password");
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
  res?.json({ info: user });
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

// Generate Verify Code
/*
 * METHOD POST
 * Route  /api/v1/user/generate-verify-code
 * Access Auth
 * */
exports.generateVerifyCode = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req?.user.id);
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
      subject: "Your password reset code",
      message: templateMail(user.firstName, verifyCode),
    });
  } catch (err){
    user.accountVerificationCode = undefined;
    user.accountVerificationCodeExpire = undefined;
    await user.save()
    return next(
      new ErrorHandler("Failed in send, please retry in later time.", 500)
    );
  }
  res?.json({
    status: "Success",
  });
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
      email: req?.body.email,
      isBlocked: req?.body.isBlocked,
      role: req?.body.role,
      isAccountVerified: req?.body.isAccountVerified,
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
