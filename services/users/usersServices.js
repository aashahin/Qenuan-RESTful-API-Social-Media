const asyncHandler = require("express-async-handler"),
  bcrypt = require("bcryptjs");
const User = require("./../../model/user/User"),
  ErrorHandler = require("../../middlewares/Errors/ErrorHandler"),
  { sanitizeUser } = require("../../utils/sanitize"),
  { createToken } = require("../../config/token");

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
exports.updateProfile = asyncHandler(async (req,res,next)=>{
  const user = await User.findByIdAndUpdate(req?.user.id,{
    firstName: req?.body.firstName,
    lastName: req?.body.lastName,
    bio: req?.body.bio,
    profilePhoto: req?.body.profilePhoto,
  },{new: true})
  res?.json({info: user});
})

// Change Password
/*
* METHOD PATCH
* Route  /api/v1/user/change-password
* Access Auth
* */
exports.changePassword = asyncHandler(async(req,res,next)=>{
  const user = await User.findByIdAndUpdate(req?.user.id,{
    password: await bcrypt.hash(req?.body.password,12),
    passwordChangedAt: Date.now()
  },{new: true});
  const token = createToken(user._id);
  res?.json({message : user.password, token})
})

// Delete User
/*
 * METHOD DELETE
 * Route  /api/v1/user/
 * Access Auth
 * */
exports.deleteUser = asyncHandler(async (req, res, next) => {
  await User.findByIdAndDelete(req?.user.id);
  res?.json({ message: "done" });
});

// Admin

// Update Profile
/*
* METHOD PATCH
* Route  /api/v1/user/profile
* Access Auth
* */
exports.updateUser = asyncHandler(async (req,res,next)=>{
  const user = await User.findByIdAndUpdate(req?.params.id,{
    "firstName": req?.body.firstName,
    "lastName": req?.body.lastName,
    "profilePhoto": req?.body.profilePhoto,
    "email": req?.body.email,
    "isBlocked": req?.body.isBlocked,
    "role": req?.body.role,
    "isAccountVerified": req?.body.isAccountVerified,
    "active": req?.body.active,
  },{new: true})
  res?.json({info: user});
})

// Delete User By Id
/*
 * METHOD DELETE
 * Route  /api/v1/user/:id
 * Access Admin
 * */
exports.deleteUserById = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req?.params.id);
  if (!user) {
    return next(new ErrorHandler(`This Id is not valid`, 404));
  }
  res?.json({ message: "done" });
});