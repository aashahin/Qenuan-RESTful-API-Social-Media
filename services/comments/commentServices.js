// External
const asyncHandler = require("express-async-handler");
const ErrorHandler = require("../../middlewares/Errors/ErrorHandler");

// Internal
const Comment = require("../../model/comment/comment");
const Post = require("../../model/post/Post");

// Create Comment
/* 
* METHOD POST
* PATH /api/v1/comment/
* ACCESS Auth
* */
exports.createComment = asyncHandler(async (req, res, next) => {
  const user = req?.user;
  const { post, description } = req?.body;
  if (!await Post.findById(post)) return next(new ErrorHandler("postId is invalid"))
  const comment = await Comment.create({
    post,
    user,
    description
  })
  if (!comment) return next(new ErrorHandler("Error in details comment"))
  res?.json(comment)
})

// Get Comments
/* 
* METHOD GET
* PATH /api/v1/comment/
* ACCESS public
* */
exports.getComments = asyncHandler(async (req, res) => {
  const comments = await Comment.find({}).sort({ createdAt: -1 });
  res?.json(comments)
})

// Get Comment
/* 
* METHOD GET
* PATH /api/v1/comment/:id
* ACCESS public
* */
exports.getComment = asyncHandler(async (req, res, next) => {
  const comment = await Comment.findById(req?.params.id);
  if (!comment) return next(new ErrorHandler("Invalid id", 401));
  res?.json(comment);
})

// Update Comment
/* 
* METHOD PATCH
* PATH /api/v1/comment/:id
* ACCESS Auth
* */
exports.updateComment = asyncHandler(async (req, res, next) => {
  const comment = await Comment.findById(req?.params.id)
  if (!comment) return next(new ErrorHandler("Invalid id", 401))
  if (!comment.user._id.toString() === req?.user._id.toString()) return next(new ErrorHandler("Acess denied", 401))
  const upComment = await Comment.findByIdAndUpdate(req?.params.id, {
    description: req?.body.description
  }, { new: true })
  res?.json(upComment)
})
// Delete Comment
/* 
* METHOD DELETE
* PATH /api/v1/comment/:id
* ACCESS Auth
* */
exports.deleteComment = asyncHandler(async (req, res, next) => {
  const comment = await Comment.findById(req?.params.id)
  if (!comment) return next(new ErrorHandler("Invalid id", 401))
  if (!comment.user._id.toString() === req?.user._id.toString()) return next(new ErrorHandler("Acess denied", 401))
  await Comment.findByIdAndDelete(req?.params.id, { new: true })
  res?.json({ status: "Success" });
})
