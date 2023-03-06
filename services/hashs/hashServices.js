const asyncHandler = require("express-async-handler");
const ErrorHandler = require("../../middlewares/Errors/ErrorHandler");
const Hash = require("../../model/hash/Hash");
const { check } = require("../refactoring/refactoringServices");

// Create Hash
/*
 * METHOD POST
 * PATH api/v1/hash
 * ACCESS Auth
 * */
exports.createHash = asyncHandler(async (req, res) => {
  const hash = await Hash.create({
    user: req?.user._id,
    name: req?.body.name,
  });
  res?.json(hash);
});

// Get Hashs
/*
 * METHOD GET
 * PATH api/v1/hash
 * ACCESS Public
 * */
exports.getHashs = asyncHandler(async (req, res, next) => {
  const hashs = await Hash.find({});
  if (!hashs) return next(new ErrorHandler("No data for fetching"));
  res?.json(hashs);
});

// Get Hash
/*
 * METHOD GET
 * PATH api/v1/hash/:id
 * ACCESS Public
 * */
exports.getHash = asyncHandler(async (req, res, next) => {
  const hash = await Hash.findById(req?.params.id);
  if (!hash) return next(new ErrorHandler("Invalid id.", 401));
  res?.json(hash);
});

// Update Hash
/*
 * METHOD PATCH
 * PATH api/v1/hash/:id
 * ACCESS Auth
 * */
exports.updateHash = asyncHandler(async (req, res, next) => {
  const { id } = req?.params;
  check(Hash, id, req, next);
  // Update
  const hash = await Hash.findByIdAndUpdate(
    id,
    {
      name: req?.body.name,
    },
    { new: true }
  );
  res?.json(hash);
});

// Delete Hash
/*
 * METHOD DELETE
 * PATH api/v1/hash/:id
 * ACCESS Auth
 * */
exports.deleteHash = asyncHandler(async (req, res, next) => {
  const { id } = req?.params;
  check(Hash, id, req, next);
  // Delete
  const hash = await Hash.findByIdAndDelete(id);
  res?.json({ message: "Success" });
});

// Follow and Unfollow Hash
/*
 * METHOD PATCH
 * PATH api/v1/hash/follow/:id
 * ACCESS Auth
 * */
exports.followHash = asyncHandler(async (req, res, next) => {
  const { id } = req?.params;
  const { _id } = req?.user;
  const targetUser = await Hash.findById(id);
  const check = targetUser.followers.find(
    (v) => v.toString() === _id.toString()
  );
  if (check) {
    const hash = await Hash.findByIdAndUpdate(
      id,
      {
        $pull: { followers: _id },
      },
      { new: true }
    );
    return res?.json(hash);
  }
  const hash = await Hash.findByIdAndUpdate(
    id,
    {
      $push: { followers: _id },
    },
    { new: true }
  );
  res?.json(hash);
});
