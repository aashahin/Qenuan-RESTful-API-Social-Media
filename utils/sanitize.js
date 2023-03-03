exports.sanitizeUser = (user) => {
  return {
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    profilePhoto: user.profilePhoto,
    email: user.email,
  };
};
exports.selectInfoUser = [
  "firstName",
  "lastName",
  "username",
  "profilePhoto",
  "email",
  "postCount",
  "followers",
  "following",
];
exports.infoUser = (user) => {
  return {
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    profilePhoto: user.profilePhoto,
    email: user.email,
    postCount: user.postCount,
    followers: user.followers,
    following: user.following,
    active: user.active,
    createdAt: user.createdAt,
    isAccountVerified: user.isAccountVerified,
    isBlocked: user.isBlocked,
  };
};

// Post sanitize
exports.postPhotoSanitize = (req, photo) => {
  const { title, description, category } = req?.body;
  return {
    title,
    description,
    category,
    image: photo.url,
    user: req?.user.id,
  };
};
exports.postSanitize = (req) => {
  const { title, description, category } = req?.body;
  return {
    title,
    description,
    category,
    user: req?.user.id,
  };
};
