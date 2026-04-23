const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    authorName: {
        type: String,
        default: "",
    },
    text: {
        type: String,
        required: true,
        trim: true,
    },
}, {
    timestamps: true,
});

const postSchema = new mongoose.Schema({
    image: String,
    caption: String,
    description: String,
    authorName: {
        type: String,
        default: "",
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        default: null,
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
    }],
    dislikes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
    }],
    comments: [commentSchema],
}, {
    timestamps: true,
});

const postModel = mongoose.model("post", postSchema);

module.exports = postModel;
