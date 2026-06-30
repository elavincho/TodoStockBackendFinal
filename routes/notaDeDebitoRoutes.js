const express = require('express');
const router = express.Router();
const notaDeDebitoController = require('../controllers/notaDeDebitoController');

// Listar todas las notas
router.get('/', notaDeDebitoController.index);

// Crear nueva nota
router.get('/nuevo', notaDeDebitoController.formCrear);
router.post('/nuevo', notaDeDebitoController.almacenar);

// Ver nota específica
router.get('/ver/:id', notaDeDebitoController.ver);

// Aplicar nota
router.post('/aplicar/:id', notaDeDebitoController.aplicar);

// Anular nota
router.post('/anular/:id', notaDeDebitoController.anular);

// Eliminar nota
router.post('/eliminar/:id', notaDeDebitoController.eliminar);

module.exports = router;