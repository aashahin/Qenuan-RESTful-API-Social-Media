const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
// Schema
const userScheme = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First Name is required."],
    },
    lastName: {
      type: String,
      required: [true, "Last Name is required."],
    },
    username: {
      type: String,
      required: [true, "Username is required."],
    },
    profilePhoto: {
      type: String,
      default:
        "https://pub-ebc3292441104a07b54e254192a1b246.r2.dev/bubble-gum-avatar-icon.png",
    },
    bio: {
      type: String,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    postCount: {
      type: Number,
      default: 0,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    viewedBy: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    },
    followers: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    },
    following: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    },
    isFollowing: {
      type: Boolean,
      default: false,
    },
    isUnFollowing: {
      type: Boolean,
      default: true,
    },
    role: {
      type: String,
      enum: ["admin", "userPlus", "user"],
      default: "user",
    },
    isAccountVerified: {
      type: Boolean,
      default: false,
    },
    accountVerificationCode: String,
    accountVerificationCodeExpire: Date,
    passwordChangedAt: Date,
    passwordResetCode: String,
    passwordResetExpire: Date,
    active: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);
userScheme.virtual("posts", {
  ref: "Post",
  foreignField: "user",
  localField: "_id",
});

userScheme.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
module.exports = mongoose.model("User", userScheme);
