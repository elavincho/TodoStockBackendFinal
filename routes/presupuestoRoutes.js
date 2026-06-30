const express = require('express');
const router = express.Router();
const presupuestoController = require('../controllers/presupuestoController');

// Listar todos los presupuestos
router.get('/', presupuestoController.index);

// Crear nuevo presupuesto
router.get('/nuevo', presupuestoController.formCrear);
router.post('/nuevo', presupuestoController.almacenar);

// Ver presupuesto específico
router.get('/ver/:id', presupuestoController.ver);

// Buscar productos (API)
router.get('/buscar-productos', presupuestoController.buscarProductos);

// Aprobar presupuesto
router.post('/aprobar/:id', presupuestoController.aprobar);

// Rechazar presupuesto
router.post('/rechazar/:id', presupuestoController.rechazar);

// Convertir a factura
router.post('/convertir/:id', presupuestoController.convertirAFactura);

// Eliminar presupuesto
router.post('/eliminar/:id', presupuestoController.eliminar);

module.exports = router;