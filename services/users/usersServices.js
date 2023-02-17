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

// Get User
/*
 * METHOD GET
 * Route  /api/v1/user/info
 * Access Auth
 * */
exports.getUser = asyncHandler(async (req, res, next) => {
  res?.json(res?.user);
});

// Delete User
/*
 * METHOD DELETE
 * Route  /api/v1/user/
 * Access Auth
 * */
exports.deleteUser = asyncHandler(async (req, res, next) => {
  await User.findByIdAndDelete(res?.user.id);
  res?.json({ message: "done" });
});

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
