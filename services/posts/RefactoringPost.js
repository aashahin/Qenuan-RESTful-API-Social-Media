// Filter for words
const ErrorHandler = require("../../middlewares/Errors/ErrorHandler");
const { cloudinaryUploadImg } = require("../../utils/cloudinary");
const fs = require("fs");
const Filter = require("bad-words");

const filter = new Filter();

exports.filtering = (req, next) => {
  const badWordsTitle = filter.isProfane(req?.body.title);
  const badWordsDesc = filter.isProfane(req?.body.description);
  const badWordsHash = filter.isProfane(req?.body.hash);
  if (badWordsTitle || badWordsDesc || badWordsHash)
    return next(new ErrorHandler("Fuck you!", 405));
};
// Upload photos to cloudinary
exports.uploadCloudinary = async (path) => {
  return cloudinaryUploadImg(path);
};
// Remove Photos Stored in cache
exports.removePhotoCache = (path) => {
  fs.unlinkSync(path);
};
