const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');
const { isAuthenticated } = require('../controllers/authController');

// Ruta principal protegida
router.get('/', isAuthenticated, homeController.index);

module.exports = router;