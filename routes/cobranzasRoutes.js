const express = require("express");
const router = express.Router();
const cobranzaController = require("../controllers/cobranzaController");

// Listar todas las cobranzas
router.get("/", cobranzaController.index);

// API: facturas pendientes de un cliente
router.get(
  "/facturas-pendientes/:clienteId",
  cobranzaController.getFacturasPendientes
);

// Crear nueva cobranza
router.get("/nuevo", cobranzaController.formCrear);
router.post("/nuevo", cobranzaController.almacenar);

// Ver cobranza específica
router.get("/ver/:numero", cobranzaController.ver);

// Cambiar estatus
router.post("/cambiar-estatus/:numero", cobranzaController.cambiarEstatus);

// Anular cobranza
router.post("/anular/:numero", cobranzaController.anular);

// Eliminar cobranza
router.post("/eliminar/:numero", cobranzaController.eliminar);

module.exports = router;
