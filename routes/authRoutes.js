const express = require('express');
const router = express.Router();
const { authController, isGuest, isAuthenticated } = require('../controllers/authController');

// Rutas públicas
router.get('/login', isGuest, authController.loginForm);
router.post('/login', isGuest, authController.login);
router.get('/register', isGuest, authController.registerForm);
router.post('/register', isGuest, authController.register);
router.get('/logout', authController.logout);

// Ruta protegida (requiere autenticación)
// router.get('/logout', isAuthenticated, authController.logout);

// Dashboard (protegido)
router.get('/dashboard', authController.dashboard);

module.exports = router;