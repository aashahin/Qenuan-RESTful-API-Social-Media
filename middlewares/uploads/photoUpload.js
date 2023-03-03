// External
const multer = require("multer");
const sharp = require("sharp");
const path = require("path");

// Internal
const ErrorHandler = require("../Errors/ErrorHandler");

const multerStorage = multer.memoryStorage();

const multerFiler = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(
      {
        message: "Unsupported file format.",
      },
      false
    );
  }
};

const photoResize = (file, w, h) => async (req, res, next) => {
  if (!req.file) {
    return next();
  }
  if (req?.file.size > 1000000)
    next(new ErrorHandler("Maximum for size: 1mb", 405));
  req.file.filename = `user-${Date.now()}-${req.file.originalname}`;
  await sharp(req.file.buffer)
    .resize(w, h)
    .toFormat("webp")
    .toFile(path.join(`${file}/${req.file.filename}`));
  next();
};
exports.uploadPhoto = multer({
  storage: multerStorage,
  fileFilter: multerFiler,
  limits: { fileSize: 1000000 },
});

// Profile Photo
exports.profilePhotoResize = photoResize(
  `public/images/users/profile`,
  250,
  250
);

// Photos Posts
exports.postPhotoResize = photoResize(`public/images/users/posts`, 1000, 600);
