const express = require('express');
const router = express.Router();
const ordenPagoController = require('../controllers/ordenPagoController');

// Listar todas las órdenes
router.get('/', ordenPagoController.index);

// ✅ Obtener facturas pendientes de un proveedor (API)
router.get('/facturas-pendientes/:proveedorId', ordenPagoController.getFacturasPendientes);

// Crear nueva orden
router.get('/nuevo', ordenPagoController.formCrear);
router.post('/nuevo', ordenPagoController.almacenar);

// Ver orden específica
router.get('/ver/:numero', ordenPagoController.ver);

// Cambiar estatus
router.post('/cambiar-estatus/:numero', ordenPagoController.cambiarEstatus);

// Anular orden
router.post('/anular/:numero', ordenPagoController.anular);

// Eliminar orden
router.post('/eliminar/:numero', ordenPagoController.eliminar);

module.exports = router;