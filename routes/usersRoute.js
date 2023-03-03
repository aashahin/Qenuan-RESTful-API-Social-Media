const express = require("express"),
  router = express.Router();
const {
  createUser,
  loginUser,
  getAllUsers,
  deleteUser,
  getUser,
  getUserById,
  deleteUserById,
  updateProfile,
  updateUser,
  changePassword,
  followUsrServ,
  unFollowUsrServ,
  blockUser,
  accountVerifyCode,
  verifyAccount,
  forgetPassword,
  resetPassword,
  uploadProfilePhoto,
} = require("../services/users/usersServices");
const {
  createUserVaildator,
} = require("../middlewares/vaildator/userValidator");
const { auth, permissions } = require("../middlewares/Auth");
const {
  uploadPhoto,
  profilePhotoResize,
} = require("../middlewares/uploads/photoUpload");

// Routes
router.route("/").get(getAllUsers).delete(auth, deleteUser);

router
  .get("/info", auth, getUser)
  .get("/account-verify-code", auth, accountVerifyCode)
  .post("/verify-account", auth, verifyAccount)
  .post("/forget-password", forgetPassword)
  .post("/signup", createUserVaildator, createUser)
  .post("/login", loginUser)
  .patch("/reset-password", resetPassword)
  .patch("/profile", auth, updateProfile)
  .patch(
    "/upload-profile-photo",
    auth,
    uploadPhoto.single("image"),
    profilePhotoResize,
    uploadProfilePhoto
  )
  .patch("/change-password", auth, changePassword)
  .patch("/follow", auth, followUsrServ)
  .patch("/unfollow", auth, unFollowUsrServ);

router
  .route("/:id")
  .patch(auth, permissions(["admin"]), updateUser)
  .delete(auth, permissions(["admin"]), deleteUserById)
  .get(getUserById);
router.patch("/admin/block/:id", auth, permissions(["admin"]), blockUser);
module.exports = router;
