const express = require('express');
const router = express.Router();
const { signup, login, logout } = require('../contollers/authController');
const { requireAuth } = require('../middlewares/authMiddleware');

router.post('/signup', signup);

router.post('/login', login);

router.post('/logout', logout);

router.get('/verify', requireAuth, (req, res) => {
    res.status(200).json({
        status: 'success',
        user: req.user,
        authed: true
    });
})

module.exports = router;