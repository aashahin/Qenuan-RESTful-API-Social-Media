// External 
const express = require("express"),
  router = express.Router();

const { auth } = require("../middlewares/Auth");
// Internal
const { createComment, getComments, getComment, updateComment, deleteComment } = require("../services/comments/commentServices");

router.route("/")
  .post(auth, createComment)
  .get(getComments)
router.route("/:id")
  .get(getComment)
  .patch(auth, updateComment)
  .delete(auth, deleteComment)
module.exports = router;
