const express = require("express"),
    router = express.Router();
const {createUser, loginUser, getAllUsers, deleteUser, getUser, getUserById, deleteUserById, updateProfile, updateUser,
    changePassword
} = require("../services/users/usersServices");
const {createUserVaildator} = require("../middlewares/vaildator/userValidator");
const {auth, permissions} = require("../middlewares/Auth");

// Routes
router
    .get("/",getAllUsers)
    .delete("/",auth,deleteUser)
    .get("/info",auth,getUser)
    .post("/signup",createUserVaildator,createUser)
    .post("/login",loginUser)
    .patch("/profile",auth,updateProfile)
    .patch("/change-password",auth,changePassword)
    .patch("/admin/:id",auth,permissions(["admin"]),updateUser)
    .delete("/admin/:id",auth,permissions(["admin"]),deleteUserById)
    .get("/admin/:id",auth,permissions(["admin"]),getUserById)

module.exports = router;
