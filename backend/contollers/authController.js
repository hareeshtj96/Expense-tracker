const bcrypt = require('bcrypt');
const User = require('../models/User');
const generateAccessToken = require('../utils/tokenService');

async function signup(req, res) {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Name, email and password are required." })
        }

        // Check if user exists
        const userExist = await User.findOne({ email });
        if (userExist) return res.status(409).json({ message: "User already exists." });

        // Hash password
        const hashed = await bcrypt.hash(password, 10);

        // creating user
        const user = new User(
            {
                name: name,
                email: email,
                password: hashed
            }
        );
        await user.save();

        return res.status(201).json({ message: "User created successfully." });
    } catch (error) {
        console.error('Signup error:', error);
        return res.status(500).json({ message: "Server error" });
    }
};


async function login(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) return res.status(400).json({ message: "Email and Password are required." });

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User does not exist." });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Incorrect password." });

        // generate access token
        const accessToken = generateAccessToken(user);

        // store token in cookie
        res.cookie("token", accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 24 * 60 * 60 * 1000
        })

        return res.status(200).json({
            message: "Login Successful",
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: "Server Error" })
    }
}

async function logout(req, res) {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            path: "/",
        });

        return res.status(200).json({ message: "Logged out" });
    } catch (error) {
        console.error("Error while logging out:", error);
    }
}


module.exports = {
    signup,
    login,
    logout
}
