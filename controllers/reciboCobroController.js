const ReciboCobro = require("../models/ReciboCobro");
const Cliente = require("../models/Cliente");
const FacturaCliente = require("../models/FacturaCliente");
const mongoose = require("mongoose");

const reciboCobroController = {
  // Listar todos los recibos
  index: async (req, res) => {
    try {
      const recibos = await ReciboCobro.find()
        .populate("clienteId", "nombre razonSocial nroDoc tipoDoc")
        .sort({ numero: -1 });

      res.render("recibos-cobro/index", {
        titulo: "Recibos de Cobro - TodoStock S.A.",
        recibos: recibos,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Error al listar recibos de cobro");
    }
  },

  // Formulario de creación
  formCrear: async (req, res) => {
    try {
      const clientes = await Cliente.find().sort({ nombre: 1 });
      res.render("recibos-cobro/crear", {
        titulo: "Nuevo Recibo de Cobro",
        clientes: clientes,
        error: null,
        datos: null,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Error al cargar formulario");
    }
  },

  // API: Obtener facturas pendientes de un cliente
  getFacturasPendientes: async (req, res) => {
    try {
      const clienteId = req.params.clienteId;

      if (!mongoose.Types.ObjectId.isValid(clienteId)) {
        return res.json({ success: false, error: "ID de cliente inválido" });
      }

      const facturas = await FacturaCliente.find({
        clienteId: clienteId,
        estatus: "Pendiente",
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

  // Guardar nuevo recibo
  almacenar: async (req, res) => {
    try {
      const {
        clienteId,
        formaPago,
        referencia,
        bancoCuenta,
        fechaCobro,
        facturasSeleccionadas,
        observaciones,
        recibidoPor,
        montoCobrado,
      } = req.body;

      if (!mongoose.Types.ObjectId.isValid(clienteId)) {
        throw new Error("ID de cliente inválido");
      }

      const cliente = await Cliente.findById(clienteId);
      if (!cliente) {
        throw new Error("Cliente no encontrado");
      }

      // Parsear facturas seleccionadas
      let facturasIds = [];
      let facturasDetalles = [];
      let totalCobro = 0;

      if (facturasSeleccionadas) {
        if (Array.isArray(facturasSeleccionadas)) {
          facturasIds = facturasSeleccionadas;
        } else {
          facturasIds = [facturasSeleccionadas];
        }

        for (const facturaId of facturasIds) {
          const factura = await FacturaCliente.findById(facturaId);
          if (factura && factura.estatus === "Pendiente") {
            totalCobro += factura.total;
            facturasDetalles.push({
              facturaId: factura._id,
              numero: factura.numero,
              fecha: factura.fechaEmision,
              total: factura.total,
            });
          }
        }
      }

      if (facturasDetalles.length === 0) {
        throw new Error("Debe seleccionar al menos una factura pendiente");
      }

      const montoFinal = parseFloat(montoCobrado) || totalCobro;

      // Crear el recibo de cobro
      const recibo = new ReciboCobro({
        clienteId: clienteId,
        clienteInfo: {
          cuit: cliente.nroDoc,
          nombre:
            cliente.tipoDoc === "DNI" ? cliente.nombre : cliente.razonSocial,
          direccion: cliente.direccion,
          telefono: cliente.telefono,
        },
        fechaEmision: new Date(),
        estatus: "Emitido",
        facturasCobradas: facturasDetalles,
        formasPago: [
          {
            formaPago: formaPago,
            referencia: referencia,
            bancoCuenta: bancoCuenta,
            fecha: new Date(fechaCobro),
            montoNeto: montoFinal,
          },
        ],
        montoCobrado: montoFinal,
        observaciones: observaciones,
        recibidoPor: recibidoPor,
      });

      await recibo.save();

      // Marcar facturas como pagadas
      for (const facturaId of facturasIds) {
        await FacturaCliente.findByIdAndUpdate(facturaId, {
          estatus: "Pagada",
          cobranzaId: recibo.numero,
          fechaCobro: new Date(fechaCobro),
        });
      }

      // Actualizar saldo del cliente (crédito - disminuir deuda)
      let saldoActual = parseFloat(cliente.saldoCuentaCorriente) || 0;
      cliente.saldoCuentaCorriente = saldoActual - montoFinal;
      await cliente.save();

      res.redirect("/recibos-cobro");
    } catch (error) {
      console.error(error);
      try {
        const clientes = await Cliente.find().sort({ nombre: 1 });
        res.render("recibos-cobro/crear", {
          titulo: "Nuevo Recibo de Cobro",
          clientes: clientes,
          error: error.message,
          datos: req.body,
        });
      } catch (err) {
        res.status(500).send("Error al cargar formulario con error");
      }
    }
  },

  // Ver detalle de un recibo
  ver: async (req, res) => {
    try {
      const recibo = await ReciboCobro.findOne({
        numero: parseInt(req.params.numero),
      }).populate("clienteId", "nombre razonSocial nroDoc telefono direccion tipoDoc");

      if (!recibo) {
        return res.status(404).send("Recibo de cobro no encontrado");
      }

      res.render("recibos-cobro/ver", {
        titulo: `Recibo de Cobro N° ${recibo.numero}`,
        recibo: recibo,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Error al mostrar recibo de cobro");
    }
  },

  // Anular recibo
  anular: async (req, res) => {
    try {
      const recibo = await ReciboCobro.findOne({
        numero: parseInt(req.params.numero),
      });

      if (recibo && recibo.estatus !== "Anulado") {
        // Revertir facturas a Pendiente
        if (recibo.facturasCobradas && recibo.facturasCobradas.length > 0) {
          for (const factura of recibo.facturasCobradas) {
            await FacturaCliente.findByIdAndUpdate(factura.facturaId, {
              estatus: "Pendiente",
              cobranzaId: null,
              fechaCobro: null,
            });
          }
        }

        // Revertir saldo del cliente
        const cliente = await Cliente.findById(recibo.clienteId);
        if (cliente) {
          let saldoActual = parseFloat(cliente.saldoCuentaCorriente) || 0;
          cliente.saldoCuentaCorriente = saldoActual + recibo.montoCobrado;
          await cliente.save();
        }

        recibo.estatus = "Anulado";
        await recibo.save();
      }

      res.redirect("/recibos-cobro");
    } catch (error) {
      console.error(error);
      res.status(500).send("Error al anular recibo");
    }
  },

  // Eliminar recibo
  eliminar: async (req, res) => {
    try {
      const recibo = await ReciboCobro.findOne({
        numero: parseInt(req.params.numero),
      });

      if (recibo && recibo.estatus === "Emitido") {
        // Revertir facturas
        for (const factura of recibo.facturasCobradas) {
          await FacturaCliente.findByIdAndUpdate(factura.facturaId, {
            estatus: "Pendiente",
            cobranzaId: null,
            fechaCobro: null,
          });
        }
        // Revertir saldo
        const cliente = await Cliente.findById(recibo.clienteId);
        if (cliente) {
          let saldoActual = parseFloat(cliente.saldoCuentaCorriente) || 0;
          cliente.saldoCuentaCorriente = saldoActual + recibo.montoCobrado;
          await cliente.save();
        }
      }

      await ReciboCobro.findOneAndDelete({ numero: parseInt(req.params.numero) });
      res.redirect("/recibos-cobro");
    } catch (error) {
      console.error(error);
      res.status(500).send("Error al eliminar recibo");
    }
  },
};

module.exports = reciboCobroController;
