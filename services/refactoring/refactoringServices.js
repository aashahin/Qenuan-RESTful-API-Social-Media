const asyncHandler = require("express-async-handler");
const ErrorHandler = require("../../middlewares/Errors/ErrorHandler");

exports.check = asyncHandler(async (model, id, req, next) => {
  const check = await model.findById(id);
  if (!check) {
    return next(new ErrorHandler("Invalid id", 401));
  }
  if (check.user.toString() !== req?.user._id.toString()) {
    return next(new ErrorHandler("Acess denied", 401));
  }
});
