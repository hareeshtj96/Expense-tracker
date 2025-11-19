const jwt = require('jsonwebtoken');
require('dotenv').config();

const ACCESS_EXPIRES = process.env.ACCESS_TOKEN_EXPIRES || "45m";

function generateAccessToken(user) {
    const payload = {
        sub: user._id.toString(),
        email: user.email
    };

    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: ACCESS_EXPIRES });
};


module.exports = generateAccessToken;