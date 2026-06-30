const OrdenPago = require("../models/OrdenPago");
const Proveedor = require("../models/Proveedor");
const FacturaProveedor = require("../models/FacturaProveedor");
const mongoose = require('mongoose');

const ordenPagoController = {
  // Listar todas las órdenes
  index: async (req, res) => {
    try {
      // ✅ Ahora usa populate para traer datos del proveedor
      const ordenes = await OrdenPago.find()
        .populate('proveedorId', 'nombre razonSocial nroDoc')
        .sort({ numero: -1 });
      
      res.render("ordenes-pago/index", {
        titulo: "Órdenes de Pago - TodoStock S.A.",
        ordenes: ordenes,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Error al listar órdenes de pago");
    }
  },

  // Formulario de creación
  formCrear: async (req, res) => {
    try {
      const proveedores = await Proveedor.find().sort({ nombre: 1 });
      res.render("ordenes-pago/crear", {
        titulo: "Nueva Orden de Pago",
        proveedores: proveedores,
        facturas: [],
        selectedProveedor: null,
        error: null,
        datos: null,
        preselectedProveedorId: req.query.proveedorId || '',
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Error al cargar formulario");
    }
  },

  // ✅ Obtener facturas pendientes de un proveedor (API)
  getFacturasPendientes: async (req, res) => {
    try {
      const proveedorId = req.params.proveedorId;

      // ✅ Validar que sea ObjectId válido
      if (!mongoose.Types.ObjectId.isValid(proveedorId)) {
        return res.json({ success: false, error: "ID de proveedor inválido" });
      }

      const facturas = await FacturaProveedor.find({
        proveedorId: proveedorId,
        estatus: "Pendiente",
        ordenPagoId: null, // Facturas no pagadas aún
      }).sort({ fechaEmision: 1 });

      const facturasFormateadas = facturas.map((f) => ({
        id: f._id,
        numero: f.numero,
        fechaEmision: f.fechaEmision,
        total: f.total,
        estatus: f.estatus,
      }));

      res.json({ success: true, facturas: facturasFormateadas });
    } catch (error) {
      console.error(error);
      res.json({ success: false, error: error.message });
    }
  },

  // Guardar nueva orden
  almacenar: async (req, res) => {
    try {
      const {
        proveedorId,
        formaPago,
        referencia,
        bancoCuenta,
        fechaPago,
        facturasSeleccionadas,
        observaciones,
        elaboradoPor,
        aprobadoPor,
        recibioConforme,
        cedula,
        montoAPagar,
      } = req.body;

      // ✅ Verificar que proveedorId sea un ObjectId válido
      if (!mongoose.Types.ObjectId.isValid(proveedorId)) {
        throw new Error("ID de proveedor inválido");
      }

      // ✅ Buscar por _id directamente
      const proveedor = await Proveedor.findById(proveedorId);
      if (!proveedor) {
        throw new Error("Proveedor no encontrado");
      }

      // Parsear facturas seleccionadas
      let facturasIds = [];
      let facturasDetalles = [];
      let totalPago = 0;

      if (facturasSeleccionadas) {
        // Si es un array de strings
        if (Array.isArray(facturasSeleccionadas)) {
          facturasIds = facturasSeleccionadas;
        } else {
          facturasIds = [facturasSeleccionadas];
        }

        // Obtener detalles de las facturas seleccionadas
        for (const facturaId of facturasIds) {
          const factura = await FacturaProveedor.findById(facturaId);
          if (factura && factura.estatus === "Pendiente") {
            totalPago += factura.total;
            facturasDetalles.push({
              facturaId: factura._id,
              numero: factura.numero,
              fecha: factura.fechaEmision,
              total: factura.total,
            });
          }
        }
      }

      // Si no se especificó monto, usar el total de facturas
      const montoFinal = parseFloat(montoAPagar) || totalPago;

      // Crear conceptos a partir de las facturas
      const conceptosArray = facturasDetalles.map((f) => ({
        codigoConcepto: "FACT",
        descripcion: `Pago Factura ${f.numero} del ${f.fecha.toLocaleDateString("es-AR")}`,
        debe: 0,
        haber: f.total,
        impuesto: "EXE",
        montoImpuesto: 0,
        netoRenglon: f.total,
      }));

      // Si no hay facturas, agregar concepto genérico
      if (conceptosArray.length === 0) {
        conceptosArray.push({
          codigoConcepto: "PAGO",
          descripcion: "Pago a proveedor",
          debe: 0,
          haber: montoFinal,
          impuesto: "EXE",
          montoImpuesto: 0,
          netoRenglon: montoFinal,
        });
      }

      // Calcular subtotales
      let subtotalDebe = 0;
      let subtotalHaber = 0;
      let subtotalImpuesto = 0;
      let subtotalNeto = 0;

      conceptosArray.forEach((c) => {
        subtotalDebe += c.debe;
        subtotalHaber += c.haber;
        subtotalImpuesto += c.montoImpuesto;
        subtotalNeto += c.netoRenglon;
      });

      // Crear la orden de pago
      const orden = new OrdenPago({
        proveedorId: proveedorId, // ✅ Ahora es ObjectId
        proveedorInfo: {
          rif: proveedor.nroDoc,
          nombre:
            proveedor.tipoDoc === "DNI"
              ? proveedor.nombre
              : proveedor.razonSocial,
          direccion: proveedor.direccion,
          telefono: proveedor.telefono,
        },
        fechaEmision: new Date(),
        estatus: "Pendiente",
        conceptos: conceptosArray,
        formasPago: [
          {
            formaPago: formaPago,
            referencia: referencia,
            bancoCuenta: bancoCuenta,
            fecha: new Date(fechaPago),
            montoNeto: montoFinal,
          },
        ],
        subtotalDebe: subtotalDebe,
        subtotalHaber: subtotalHaber,
        subtotalImpuesto: subtotalImpuesto,
        subtotalNeto: subtotalNeto,
        totalRetencion: 0,
        totalImpuesto: subtotalImpuesto,
        montoAPagar: montoFinal,
        observaciones: observaciones,
        elaboradoPor: elaboradoPor,
        aprobadoPor: aprobadoPor,
        recibioConforme: recibioConforme,
        cedula: cedula,
        facturasPagadas: facturasDetalles,
      });

      await orden.save();

      // ✅ Actualizar las facturas como pagadas
      for (const facturaId of facturasIds) {
        await FacturaProveedor.findByIdAndUpdate(facturaId, {
          estatus: "Pagada",
          ordenPagoId: orden.numero,
          fechaPago: new Date(fechaPago),
        });
      }

      res.redirect("/ordenes-pago");
    } catch (error) {
      console.error(error);
      try {
        const proveedores = await Proveedor.find().sort({ nombre: 1 });
        res.render("ordenes-pago/crear", {
          titulo: "Nueva Orden de Pago",
          proveedores: proveedores,
          facturas: [],
          selectedProveedor: null,
          error: error.message,
          datos: req.body,
        });
      } catch (err) {
        res.status(500).send("Error al cargar formulario con error");
      }
    }
  },

  // Ver detalle de una orden
  ver: async (req, res) => {
    try {
      const orden = await OrdenPago.findOne({
        numero: parseInt(req.params.numero),
      }).populate('proveedorId', 'nombre razonSocial nroDoc telefono direccion');
      
      if (!orden) {
        return res.status(404).send("Orden de pago no encontrada");
      }

      // Obtener las facturas relacionadas si existen
      let facturasRelacionadas = [];
      if (orden.facturasPagadas && orden.facturasPagadas.length > 0) {
        facturasRelacionadas = orden.facturasPagadas;
      } else {
        // Buscar facturas con este ordenPagoId
        const facturas = await FacturaProveedor.find({
          ordenPagoId: orden.numero,
        });
        facturasRelacionadas = facturas.map((f) => ({
          facturaId: f._id,
          numero: f.numero,
          fecha: f.fechaEmision,
          total: f.total,
        }));
      }

      res.render("ordenes-pago/ver", {
        titulo: `Orden de Pago N° ${orden.numero}`,
        orden: orden,
        facturasRelacionadas: facturasRelacionadas,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Error al mostrar orden de pago");
    }
  },

  // Cambiar estatus
  cambiarEstatus: async (req, res) => {
    try {
      const { estatus } = req.body;
      await OrdenPago.findOneAndUpdate(
        { numero: parseInt(req.params.numero) },
        { estatus: estatus },
        { new: true },
      );
      res.redirect("/ordenes-pago");
    } catch (error) {
      console.error(error);
      res.status(500).send("Error al cambiar estatus");
    }
  },

  // Anular orden
  anular: async (req, res) => {
    try {
      const orden = await OrdenPago.findOne({
        numero: parseInt(req.params.numero),
      });

      if (orden && orden.estatus !== "Anulado") {
        // Revertir el estatus de las facturas asociadas
        if (orden.facturasPagadas && orden.facturasPagadas.length > 0) {
          for (const factura of orden.facturasPagadas) {
            await FacturaProveedor.findByIdAndUpdate(factura.facturaId, {
              estatus: "Pendiente",
              ordenPagoId: null,
              fechaPago: null,
            });
          }
        }

        orden.estatus = "Anulado";
        await orden.save();
      }

      res.redirect("/ordenes-pago");
    } catch (error) {
      console.error(error);
      res.status(500).send("Error al anular orden");
    }
  },

  // Eliminar orden
  eliminar: async (req, res) => {
    try {
      await OrdenPago.findOneAndDelete({ numero: parseInt(req.params.numero) });
      res.redirect("/ordenes-pago");
    } catch (error) {
      console.error(error);
      res.status(500).send("Error al eliminar orden");
    }
  },
};

module.exports = ordenPagoController;