const express = require("express");
const router = express.Router();
const {
  createHash,
  getHashs,
  getHash,
  updateHash,
  deleteHash,
  followHash,
} = require("../services/hashs/hashServices");
const { auth } = require("../middlewares/Auth");

router.route("/").post(auth, createHash).get(getHashs);
router
  .route("/:id")
  .get(getHash)
  .patch(auth, updateHash)
  .delete(auth, deleteHash);
router.patch("/follow/:id", auth, followHash);
module.exports = router;
