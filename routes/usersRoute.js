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
  blockUser, generateVerifyCode,
} = require("../services/users/usersServices");
const {
  createUserVaildator,
} = require("../middlewares/vaildator/userValidator");
const { auth, permissions } = require("../middlewares/Auth");

// Routes
router.route("/").get(getAllUsers).delete(auth, deleteUser);

router
  .get("/info", auth, getUser)
  .post("/signup", createUserVaildator, createUser)
  .post("/login", loginUser)
  .get("/generate-verify-code", auth, generateVerifyCode)
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
