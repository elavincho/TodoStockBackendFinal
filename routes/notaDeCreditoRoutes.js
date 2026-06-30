const express = require('express');
const router = express.Router();
const notaDeCreditoController = require('../controllers/notaDeCreditoController');

// Listar todas las notas
router.get('/', notaDeCreditoController.index);

// Crear nueva nota
router.get('/nuevo', notaDeCreditoController.formCrear);
router.post('/nuevo', notaDeCreditoController.almacenar);

// Ver nota específica
router.get('/ver/:id', notaDeCreditoController.ver);

// Buscar productos (API)
router.get('/buscar-productos', notaDeCreditoController.buscarProductos);

// Aplicar nota
router.post('/aplicar/:id', notaDeCreditoController.aplicar);

// Anular nota
router.post('/anular/:id', notaDeCreditoController.anular);

// Eliminar nota
router.post('/eliminar/:id', notaDeCreditoController.eliminar);

module.exports = router;