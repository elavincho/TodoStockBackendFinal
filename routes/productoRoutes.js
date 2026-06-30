const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');
const { isAuthenticated } = require('../controllers/authController');

// Todas las rutas protegidas
router.get('/', isAuthenticated, productoController.index);
router.get('/nuevo', isAuthenticated, productoController.formCrear);
router.post('/nuevo', isAuthenticated, productoController.almacenar);
router.get('/editar/:id', isAuthenticated, productoController.formEditar);
router.post('/editar/:id', isAuthenticated, productoController.actualizar);
router.post('/eliminar/:id', isAuthenticated, productoController.eliminar);

module.exports = router;