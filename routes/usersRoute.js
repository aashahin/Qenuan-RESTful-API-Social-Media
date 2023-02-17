const express = require("express"),
    router = express.Router();
const {createUser, loginUser, getAllUsers, deleteUser, getUser, getUserById, deleteUserById} = require("../services/users/usersServices");
const {createUserVaildator} = require("../middlewares/vaildator/userValidator");
const {auth, permissions} = require("../middlewares/Auth");

// Routes
router
    .get("/",getAllUsers)
    .get("/info",auth,getUser)
    .post("/signup",createUserVaildator,createUser)
    .post("/login",loginUser)
    .delete("/",auth,deleteUser)
    .delete("/:id",auth,permissions(["admin"]),deleteUserById)
    .get("/:id",getUserById)

module.exports = router;
