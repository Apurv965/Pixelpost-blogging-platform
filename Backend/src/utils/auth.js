const crypto = require("crypto");

const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function getAuthSecret() {
    return process.env.AUTH_SECRET || "pixelpost-dev-secret-change-me";
}

function toBase64Url(value) {
    return Buffer.from(value)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/g, "");
}

function fromBase64Url(value) {
    const padded = value
        .replace(/-/g, "+")
        .replace(/_/g, "/")
        .padEnd(Math.ceil(value.length / 4) * 4, "=");

    return Buffer.from(padded, "base64").toString("utf8");
}

function signToken(payload) {
    const header = toBase64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const body = toBase64Url(JSON.stringify(payload));
    const data = `${header}.${body}`;
    const signature = crypto
        .createHmac("sha256", getAuthSecret())
        .update(data)
        .digest("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/g, "");

    return `${data}.${signature}`;
}

function createAuthToken(userId) {
    return signToken({
        sub: userId,
        exp: Date.now() + TOKEN_TTL_MS,
    });
}

function verifyAuthToken(token) {
    const [header, body, signature] = token.split(".");

    if (!header || !body || !signature) {
        throw new Error("Invalid token format");
    }

    const data = `${header}.${body}`;
    const expectedSignature = crypto
        .createHmac("sha256", getAuthSecret())
        .update(data)
        .digest("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/g, "");

    const providedBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (
        providedBuffer.length !== expectedBuffer.length ||
        !crypto.timingSafeEqual(providedBuffer, expectedBuffer)
    ) {
        throw new Error("Invalid token signature");
    }

    const payload = JSON.parse(fromBase64Url(body));

    if (!payload.exp || payload.exp < Date.now()) {
        throw new Error("Token expired");
    }

    return payload;
}

function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto.scryptSync(password, salt, 64).toString("hex");

    return `${salt}:${hash}`;
}

function verifyPassword(password, storedValue) {
    if (!storedValue || !storedValue.includes(":")) {
        return false;
    }

    const [salt, storedHash] = storedValue.split(":");
    const computedHash = crypto.scryptSync(password, salt, 64).toString("hex");

    return crypto.timingSafeEqual(
        Buffer.from(storedHash, "hex"),
        Buffer.from(computedHash, "hex")
    );
}

function sanitizeUser(user) {
    return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        avatar: user.avatar || "",
    };
}

module.exports = {
    createAuthToken,
    hashPassword,
    sanitizeUser,
    verifyAuthToken,
    verifyPassword,
};
