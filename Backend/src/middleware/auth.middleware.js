const userModel = require("../models/user.model");
const { verifyAuthToken } = require("../utils/auth");

async function requireAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization || "";
        const token = authHeader.startsWith("Bearer ")
            ? authHeader.slice(7)
            : null;

        if (!token) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }

        const payload = verifyAuthToken(token);
        const user = await userModel.findById(payload.sub);

        if (!user) {
            return res.status(401).json({
                message: "Invalid session",
            });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token",
        });
    }
}

module.exports = requireAuth;
