const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
    title:{
        type: String,
        trim: true,
        required: [true, "Post Title is required"],
    },
    category:{
        type: String,
        required: [true, "Post Category is required"],
        default: "Uncategorized",
    },
    numViews:{
        type: Number,
        default: 0,
    },
    isLiked:{
        type: Boolean,
        default: false,
    },
    isDisliked:{
        type: Boolean,
        default: false,
    },
    likes: [{
      type: mongoose.Schema.ObjectId,
      ref: "User",
    }],
    disLikes: [{
      type: mongoose.Schema.ObjectId,
      ref: "User",
    }]
})
