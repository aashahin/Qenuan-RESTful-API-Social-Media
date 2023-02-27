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
  blockUser, accountVerifyCode,verifyAccount,forgetPassword,resetPassword
} = require("../services/users/usersServices");
const {
  createUserVaildator,
} = require("../middlewares/vaildator/userValidator");
const { auth, permissions } = require("../middlewares/Auth");

// Routes
router.route("/").get(getAllUsers).delete(auth, deleteUser);

router
  .get("/info", auth, getUser)
  .get("/account-verify-code", auth, accountVerifyCode) 
  .post("/verify-account", auth, verifyAccount)
  .post("/forget-password",forgetPassword)
  .post("/reset-password",resetPassword)
  .post("/signup", createUserVaildator, createUser)
  .post("/login", loginUser)
  .patch("/profile", auth, updateProfile)
  .patch("/change-password", auth, changePassword)
  .patch("/follow", auth, followUsrServ)
  .patch("/unfollow", auth, unFollowUsrServ);

router
  .route("/admin/:id")
  .patch(auth, permissions(["admin"]), updateUser)
  .delete(auth, permissions(["admin"]), deleteUserById)
  .get(auth, permissions(["admin"]), getUserById);
router.patch("/admin/block/:id", auth, permissions(["admin"]), blockUser);
module.exports = router;
