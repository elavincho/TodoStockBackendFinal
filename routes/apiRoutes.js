const express = require('express');
const router = express.Router();
const { authController, isAuthenticatedAPI } = require('../controllers/authController');
const authJWT = require('../middlewares/authJWT');

// ===== RUTAS PÚBLICAS DE API =====

// Login vía API (devuelve JWT)
router.post('/auth/login', authController.login);

// Logout vía API
router.post('/auth/logout', authController.logout);

// ===== RUTAS PROTEGIDAS DE API =====

// Verificar token actual
router.get('/auth/verify', isAuthenticatedAPI, authController.verifyToken);

// Renovar token
router.post('/auth/refresh', isAuthenticatedAPI, authController.refreshToken);

// Ejemplo de ruta protegida para usuarios autenticados
router.get('/user/profile', isAuthenticatedAPI, (req, res) => {
  res.json({
    success: true,
    usuario: req.usuario
  });
});

// Ejemplo de ruta solo para administradores
router.get('/admin/stats', isAuthenticatedAPI, authJWT.isAdmin, (req, res) => {
  res.json({
    success: true,
    message: 'Estadísticas de administrador',
    usuario: req.usuario
  });
});

module.exports = router;