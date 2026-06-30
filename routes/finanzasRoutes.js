const express = require("express");
const router = express.Router();
const finanzasController = require("../controllers/finanzasController");

// Dashboard principal
router.get("/", finanzasController.resumen);

// Cuentas por cobrar
router.get("/cuentas-cobrar", finanzasController.cuentasPorCobrar);

// Cuentas por pagar
router.get("/cuentas-pagar", finanzasController.cuentasPorPagar);

// Cobrar a cliente (con NC y ND)
router.get("/cobrar", finanzasController.formCobrar);
router.post("/cobrar", finanzasController.procesarCobro);

// API: Documentos pendientes de un cliente (facturas + NC + ND)
router.get("/documentos-cliente/:clienteId", finanzasController.getDocumentosCliente);

// Pagar a proveedor (con NC y ND)
router.get("/pagar", finanzasController.formPagar);
router.post("/pagar", finanzasController.procesarPago);

// API: Documentos pendientes de un proveedor
router.get("/documentos-proveedor/:proveedorId", finanzasController.getDocumentosProveedor);

module.exports = router;
