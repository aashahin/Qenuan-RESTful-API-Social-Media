const express = require("express");
const { auth } = require("../middlewares/Auth");
const {
  createPost,
  getPosts,
  getPostsUser,
  getPost,
  updatePost,
  deletePost,
  addLike,
  addDislike,
} = require("../services/posts/postServices");
const {
  uploadPhoto,
  postPhotoResize,
} = require("../middlewares/uploads/photoUpload");
const router = express.Router();

router
  .route("/")
  .post(auth, uploadPhoto.single("image"), postPhotoResize, createPost)
  .get(getPosts);
router.get("/my-posts", auth, getPostsUser);

router.patch("/like/:id", auth, addLike)
router.patch("/dislike/:id", auth, addDislike)
// Nested Route
router
  .route("/:id")
  .get(getPost)
  .patch(auth, uploadPhoto.single("image"), postPhotoResize, updatePost)
  .delete(auth, deletePost);
module.exports = router;
