const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');
const { isAuthenticated } = require('../controllers/authController');

router.get('/', isAuthenticated, clienteController.index);
router.get('/listar', isAuthenticated, clienteController.listar);
router.get('/nuevo', isAuthenticated, clienteController.formCrear);
router.post('/nuevo', isAuthenticated, clienteController.almacenar);
router.get('/editar/:id', isAuthenticated, clienteController.formEditar);
router.post('/editar/:id', isAuthenticated, clienteController.actualizar);
router.post('/eliminar/:id', isAuthenticated, clienteController.eliminar);

module.exports = router;