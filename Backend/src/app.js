const express = require('express');
const multer = require('multer');
const uploadFile = require('./services/storage.service');
const postModel = require("./models/post.model");
const userModel = require("./models/user.model");
const requireAuth = require("./middleware/auth.middleware");
const cors = require("cors");
const {
    createAuthToken,
    hashPassword,
    sanitizeUser,
    verifyPassword,
} = require("./utils/auth");

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

app.post("/auth/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email, and password are required",
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters",
            });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const existingUser = await userModel.findOne({ email: normalizedEmail });

        if (existingUser) {
            return res.status(409).json({
                message: "An account with this email already exists",
            });
        }

        const user = await userModel.create({
            name: name.trim(),
            email: normalizedEmail,
            passwordHash: hashPassword(password),
        });

        return res.status(201).json({
            message: "Signup successful",
            token: createAuthToken(user._id.toString()),
            user: sanitizeUser(user),
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to sign up",
            error: error.message,
        });
    }
});

app.post("/auth/signin", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required",
            });
        }

        const user = await userModel.findOne({ email: email.toLowerCase().trim() });

        if (!user || !verifyPassword(password, user.passwordHash)) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }

        return res.status(200).json({
            message: "Signin successful",
            token: createAuthToken(user._id.toString()),
            user: sanitizeUser(user),
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to sign in",
            error: error.message,
        });
    }
});

app.get("/auth/me", requireAuth, async (req, res) => {
    return res.status(200).json({
        user: sanitizeUser(req.user),
    });
});

app.patch("/auth/profile", requireAuth, async (req, res) => {
    try {
        const { name } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                message: "Name is required",
            });
        }

        req.user.name = name.trim();
        await req.user.save();

        await postModel.updateMany(
            { user: req.user._id },
            { $set: { authorName: req.user.name } }
        );

        return res.status(200).json({
            message: "Profile updated successfully",
            user: sanitizeUser(req.user),
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to update profile",
            error: error.message,
        });
    }
});

app.patch("/auth/password", requireAuth, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                message: "Current password and new password are required",
            });
        }

        if (!verifyPassword(currentPassword, req.user.passwordHash)) {
            return res.status(401).json({
                message: "Current password is incorrect",
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                message: "New password must be at least 6 characters",
            });
        }

        req.user.passwordHash = hashPassword(newPassword);
        await req.user.save();

        return res.status(200).json({
            message: "Password changed successfully",
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to change password",
            error: error.message,
        });
    }
});

app.post('/create-post', requireAuth, upload.single("image"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: "Image is required"
            });
        }

        const result = await uploadFile(req.file.buffer);

        const post = await postModel.create({
            image: result.url,
            caption: req.body.caption,
            description: req.body.description || "",
            authorName: req.user.name,
            user: req.user._id,
        });

        return res.status(201).json({
            message: "Post created successfully",
            post
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to create post",
            error: error.message
        });
    }
});

app.get("/posts", async (req, res) => {
    try {
        const posts = await postModel
            .find()
            .populate("user", "name email avatar")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Posts fetched successfully",
            posts
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch posts",
            error: error.message
        });
    }
});

app.get("/posts/:id", async (req, res) => {
    try {
        const post = await postModel
            .findById(req.params.id)
            .populate("user", "name email avatar");

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        return res.status(200).json({
            message: "Post fetched successfully",
            post
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch post",
            error: error.message
        });
    }
});

app.put("/posts/:id", requireAuth, upload.single("image"), async (req, res) => {
    try {
        const post = await postModel.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        if (!post.user || post.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: "You can only edit your own posts",
            });
        }

        if (req.file) {
            const result = await uploadFile(req.file.buffer);
            post.image = result.url;
        }

        post.caption = req.body.caption ?? post.caption;
        post.description = req.body.description ?? post.description;
        post.authorName = req.user.name;

        await post.save();

        return res.status(200).json({
            message: "Post updated successfully",
            post
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to update post",
            error: error.message
        });
    }
});

app.delete("/posts/:id", requireAuth, async (req, res) => {
    try {
        const post = await postModel.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        if (!post.user || post.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: "You can only delete your own posts",
            });
        }

        await post.deleteOne();

        return res.status(200).json({
            message: "Post deleted successfully"
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to delete post",
            error: error.message
        });
    }
});

app.post("/posts/:id/like", requireAuth, async (req, res) => {
    try {
        const post = await postModel.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        const userId = req.user._id.toString();
        const hasLiked = post.likes.some(id => id.toString() === userId);
        const hasDisliked = post.dislikes.some(id => id.toString() === userId);

        if (hasLiked) {
            post.likes = post.likes.filter(id => id.toString() !== userId);
        } else {
            post.likes.push(req.user._id);
            if (hasDisliked) {
                post.dislikes = post.dislikes.filter(id => id.toString() !== userId);
            }
        }

        await post.save();

        return res.status(200).json({
            message: "Post liked/unliked successfully",
            post,
            liked: !hasLiked
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to like post",
            error: error.message
        });
    }
});

app.post("/posts/:id/comments", requireAuth, async (req, res) => {
    try {
        const post = await postModel.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        const text = req.body.text?.trim();

        if (!text) {
            return res.status(400).json({
                message: "Comment text is required"
            });
        }

        post.comments.push({
            user: req.user._id,
            authorName: req.user.name,
            text,
        });

        await post.save();

        return res.status(201).json({
            message: "Comment added successfully",
            post
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to add comment",
            error: error.message
        });
    }
});

app.post("/posts/:id/dislike", requireAuth, async (req, res) => {
    try {
        const post = await postModel.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        const userId = req.user._id.toString();
        const hasLiked = post.likes.some(id => id.toString() === userId);
        const hasDisliked = post.dislikes.some(id => id.toString() === userId);

        if (hasDisliked) {
            post.dislikes = post.dislikes.filter(id => id.toString() !== userId);
        } else {
            post.dislikes.push(req.user._id);
            if (hasLiked) {
                post.likes = post.likes.filter(id => id.toString() !== userId);
            }
        }

        await post.save();

        return res.status(200).json({
            message: "Post disliked/undisliked successfully",
            post,
            disliked: !hasDisliked
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to dislike post",
            error: error.message
        });
    }
});

module.exports = app;
