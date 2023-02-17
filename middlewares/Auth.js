const asyncHandler = require("express-async-handler"),
  jwt = require("jsonwebtoken");
const User = require("./../model/user/User"),
  ErrorHandler = require("./Errors/ErrorHandler");

exports.auth = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req?.headers.authorization &&
    req?.headers.authorization.startsWith("Bearer")
  ) {
    token = req?.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(new ErrorHandler(`Access Denied!`, 404));
  }
  const decoded = jwt.verify(token, process.env.SECRET_KEY);
  res.user = await User.findById(decoded.id).select("-password");
  next();
});

// Permissions
exports.permissions = (roles) => {
  return asyncHandler(async (req, res, next) => {
    if (!roles.includes(res?.user.role)) {
      return next(new ErrorHandler(`Access Denied.`, 403));
    }
    next();
  });
};
