const express = require('express');
const router = express.Router();
const proveedorController = require('../controllers/proveedorController');
const { isAuthenticated } = require('../controllers/authController');

router.get('/', isAuthenticated, proveedorController.index);
router.get('/listar', isAuthenticated, proveedorController.listar);
router.get('/nuevo', isAuthenticated, proveedorController.formCrear);
router.post('/nuevo', isAuthenticated, proveedorController.almacenar);
router.get('/editar/:id', isAuthenticated, proveedorController.formEditar);
router.post('/editar/:id', isAuthenticated, proveedorController.actualizar);
router.post('/eliminar/:id', isAuthenticated, proveedorController.eliminar);

module.exports = router;