// External
const asyncHandler = require("express-async-handler");

// Internal
const Post = require("../../model/post/Post");
const User = require("../../model/user/User");
const ErrorHandler = require("../../middlewares/Errors/ErrorHandler");
const {
  filtering,
  uploadCloudinary,
  removePhotoCache,
} = require("./RefactoringPost");
const { postPhotoSanitize, postSanitize } = require("../../utils/sanitize");

// Global Variables
const infoUser = {
  path: "user",
  select: ["firstName", "lastName", "profilePhoto"],
};
const likeInfo = {
  path: "likes",
  select: ["firstName", "lastName", "profilePhoto", "username"]
}
const disLikeInfo = {
  path: "disLikes",
  select: ["firstName", "lastName", "profilePhoto", "username"]
}

// Create Post
/*
 * METHOD: POST
 * PATH: /api/v1/posts
 * ACCESS: Auth
 * */
exports.createPost = asyncHandler(async (req, res, next) => {
  filtering(req, next);
  if (req?.file) {
    const path = `public/images/users/posts/${req?.file.filename}`;
    const photo = await uploadCloudinary(path);
    const post = await Post.create(postPhotoSanitize(req, photo));
    removePhotoCache(path);
    return res?.json(post);
  }
  const post = await Post.create(postSanitize(req));
  res?.json(post);
});

// Get Posts
/*
 * METHOD: GET
 * PATH: /api/v1/post
 * ACCESS: Public
 * */
exports.getPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find({}).populate(infoUser);
  res?.json(posts);
});

// Get User Posts
/*
 * METHOD: GET
 * PATH: /api/v1/post/my-posts
 * ACCESS: Auth
 * */
exports.getPostsUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req?.user._id)
    .populate("posts")
    .select("posts");
  res?.json(user);
});

// Get Post Details
/*
 * METHOD: GET
 * PATH: /api/v1/post/:id
 * ACCESS: Public
 * */
exports.getPost = asyncHandler(async (req, res, next) => {
  const post = await Post.findByIdAndUpdate(
    req?.params.id,
    {
      $inc: { numViews: 1 },
    },
    { new: true }
  ).populate(infoUser).populate(likeInfo).populate(disLikeInfo);
  if (!post) return next(new ErrorHandler("Invalid id", 401));
  res?.json(post);
});

// Update Post
/*
 * METHOD: PATCH
 * PATH: /api/v1/post/:id
 * ACCESS: Auth
 * */
exports.updatePost = asyncHandler(async (req, res, next) => {
  const { title, description, category } = req?.body;
  const { id } = req?.params;
  filtering(req, next);
  const fetch = await Post.findById(id);
  if (!fetch) return next(new ErrorHandler("Invalid id", 401));
  if (req?.file) {
    const path = `public/images/users/posts/${req?.file.filename}`;
    const photo = await uploadCloudinary(path);
    const post = await Post.findByIdAndUpdate(
      id,
      {
        title: title || fetch.title,
        description: description || fetch.description,
        category: category || fetch.category,
        image: photo.url || fetch.image,
      },
      {
        new: true,
      }
    );
    removePhotoCache(path);
    return res?.json(post);
  } else {
    const post = await Post.findByIdAndUpdate(
      id,
      {
        title: title || fetch.title,
        description: description || fetch.description,
        category: category || fetch.category,
      },
      {
        new: true,
      }
    );
    res?.json(post);
  }
});

// Delete Post
/*
 * METHOD: DELETE
 * PATH: /api/v1/post/:id
 * ACCESS: Auth
 * */
exports.deletePost = asyncHandler(async (req, res, next) => {
  const post = await Post.findByIdAndDelete(req?.params.id);
  if (!post) return next(new ErrorHandler("Invalid id", 401));
  res?.json({ status: "Success" });
});

// Likes
/*
 * METHOD: POST
 * PATH: /api/v1/post/like/:id
 * ACCESS: Auth
 * */
exports.addLike = asyncHandler(async (req, res, next) => {
  const { id } = req?.params;
  const userId = req?.user.id;
  // Find post by id
  const post = await Post.findById(id);
  // Find user by id
  const user = await User.findById(userId);

  if (!post || !user) return next(new ErrorHandler("Invalid id", 404));
  const { isLiked } = post;
  const { disLikes } = post;

  const checkDisLiked = disLikes.find(
    (usrId) => usrId.toString() === userId.toString()
  );
  if (checkDisLiked) {
    const post = await Post.findByIdAndUpdate(
      id,
      {
        $pull: { disLikes: userId },
        isDisliked: false,
      },
      { new: true }
    );
    res.json(post);
  }
  if (isLiked) {
    const post = await Post.findByIdAndUpdate(
      id,
      {
        $pull: { likes: userId },
        isLiked: false,
      },
      { new: true }
    );
    res.json(post);
  } else {
    const addLike = await Post.findByIdAndUpdate(
      id,
      {
        $push: { likes: userId },
        isLiked: true,
      },
      { new: true }
    );
    res.json(addLike);
  }
});

// Dislikes
/*
 * METHOD: POST
 * PATH: /api/v1/post/dislike/:id
 * ACCESS: Auth
 * */
exports.addDislike = asyncHandler(async (req, res, next) => {
  const { id } = req?.params;
  const userId = req?.user.id;
  // Find post by id
  const post = await Post.findById(id);
  // Find user by id
  const user = await User.findById(userId);

  if (!post || !user) return next(new ErrorHandler("Invalid id", 404));
  const { isDisliked } = post;
  const { likes } = post;

  const checkIsLiked = likes.find(
    (usrId) => usrId.toString() === userId.toString()
  );
  if (checkIsLiked) {
    const post = await Post.findByIdAndUpdate(
      id,
      {
        $pull: { likes: userId },
        isLiked: false,
      },
      { new: true }
    );
    res.json(post);
  }
  if (isDisliked) {
    const post = await Post.findByIdAndUpdate(
      id,
      {
        $pull: { disLikes: userId },
        isDisliked: false,
      },
      { new: true }
    );
    res.json(post);
  } else {
    const disLike = await Post.findByIdAndUpdate(
      id,
      {
        $push: { disLikes: userId },
        isDisliked: true,
      },
      { new: true }
    );
    res.json(disLike);
  }
})
