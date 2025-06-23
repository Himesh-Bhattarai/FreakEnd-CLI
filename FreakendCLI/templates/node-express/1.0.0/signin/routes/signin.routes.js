const express = require('express');
const router = express.Router();
const {
    signup,
} = require('../controllers/signin.controller');

const {
    validateSignup,
} = require('../middleware/signin.middleware');

router.post('/signup', validateSignup, signup);

// Health check route
router.get('/health', (req, res) => {
    res.json({ status: 'Auth service is running' });
});

module.exports = router;
