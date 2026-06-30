const express = require("express");
const router = express.Router();
const reciboCobroController = require("../controllers/reciboCobroController");

// Listar todos los recibos
router.get("/", reciboCobroController.index);

// API: Obtener facturas pendientes de un cliente
router.get("/facturas-pendientes/:clienteId", reciboCobroController.getFacturasPendientes);

// Crear nuevo recibo
router.get("/nuevo", reciboCobroController.formCrear);
router.post("/nuevo", reciboCobroController.almacenar);

// Ver recibo específico
router.get("/ver/:numero", reciboCobroController.ver);

// Anular recibo
router.post("/anular/:numero", reciboCobroController.anular);

// Eliminar recibo
router.post("/eliminar/:numero", reciboCobroController.eliminar);

module.exports = router;
