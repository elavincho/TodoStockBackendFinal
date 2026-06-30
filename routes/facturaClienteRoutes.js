const express = require('express');
const router = express.Router();
const facturaClienteController = require('../controllers/facturaClienteController');

// Listar todas las facturas
router.get('/', facturaClienteController.index);

// Inventario
router.get('/inventario', facturaClienteController.inventario);

// Buscar productos (API)
router.get('/buscar-productos', facturaClienteController.buscarProductos);

// Crear nueva factura
router.get('/nuevo', facturaClienteController.formCrear);
router.post('/nuevo', facturaClienteController.almacenar);

// Ver factura específica
router.get('/ver/:id', facturaClienteController.ver);

// Cambiar estatus
router.post('/cambiar-estatus/:id', facturaClienteController.cambiarEstatus);

// Marcar como pagada
router.post('/marcar-pagada/:id', facturaClienteController.marcarPagada);

// Anular factura
router.post('/anular/:id', facturaClienteController.anular);

// Eliminar factura
router.post('/eliminar/:id', facturaClienteController.eliminar);

module.exports = router;