const jwt = require("jsonwebtoken");

exports.requireAuth = (req, res, next) => {
    const token = req.cookies?.token;

    if (!token) {
        return res.status(401).json({ message: "No token found" });
    }

    // verify token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = {
            id: decoded.sub,
            email: decoded.email
        };

        next();
    } catch (error) {
        console.error("Auth error:", error.message);
        return res.status(401).json({ message: "Invalid or expired token" });
    }
}