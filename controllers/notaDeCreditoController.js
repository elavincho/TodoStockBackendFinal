const NotaDeCredito = require("../models/NotaDeCredito");
const Cliente = require("../models/Cliente");
const FacturaCliente = require("../models/FacturaCliente");
const StockService = require("../services/stockService");
const mongoose = require("mongoose");

const notaDeCreditoController = {
  // Listar todas las notas
  index: async (req, res) => {
    try {
      const notas = await NotaDeCredito.find().sort({ createdAt: -1 });
      res.render("notas-credito/index", {
        titulo: "Notas de Crédito - TodoStock S.A.",
        notas: notas,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Error al listar notas de crédito");
    }
  },

  // Formulario de creación
  formCrear: async (req, res) => {
    try {
      const clientes = await Cliente.find().sort({ createdAt: 1 });
      const productos = await StockService.obtenerTodosProductos();
      const facturas = await FacturaCliente.find({
        estatus: { $in: ["Pendiente", "Pagada"] },
      })
        .populate('clienteId', 'nombre email razonSocial nroDoc')
        .sort({ createdAt: -1 });

      res.render("notas-credito/crear", {
        titulo: "Nota de Crédito - Devolución",
        clientes: clientes,
        productos: productos,
        facturas: facturas,
        error: null,
        datos: null,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Error al cargar formulario");
    }
  },

  // Guardar nueva nota (con devolución de stock)
  almacenar: async (req, res) => {
    try {
      const {
        clienteId,
        puntoVenta,
        numero,
        fechaEmision,
        fechaVencimiento,
        conceptos,
        otrosTributos,
        observaciones,
        cae,
        fechaVtoCAE,
        facturaOrigenId,
        facturaOrigenNumero,
      } = req.body;

      //Validar ObjectId
      if (!mongoose.Types.ObjectId.isValid(clienteId)) {
        throw new Error("ID de cliente inválido");
      }

      // Obtener datos del cliente
      const cliente = await Cliente.findById(clienteId);
      if (!cliente) {
        throw new Error("Cliente no encontrado");
      }

      // Validar que haya al menos un concepto
      if (!conceptos || !conceptos.descripcion || conceptos.descripcion.length === 0) {
        throw new Error("Debe agregar al menos un concepto");
      }

      // Parsear conceptos del formulario
      const conceptosArray = [];
      const numConceptos = conceptos.descripcion.length;

      for (let i = 0; i < numConceptos; i++) {
        const cantidad = parseFloat(conceptos.cantidad[i]) || 1;
        const precioUnitario = parseFloat(conceptos.precioUnitario[i]) || 0;
        const importe = cantidad * precioUnitario;

        conceptosArray.push({
          codigo: conceptos.codigo ? conceptos.codigo[i] : "",
          descripcion: conceptos.descripcion[i],
          cantidad: cantidad,
          precioUnitario: precioUnitario,
          alicIva: conceptos.alicIva[i] || "21%",
          importe: importe,
          productoId: conceptos.productoId && conceptos.productoId[i] ? parseInt(conceptos.productoId[i]) : null,
          actualizarStock: true, // Marcar para devolver stock
        });
      }

      // Formatear número de nota
      const numeroCompleto = `${String(puntoVenta || 1).padStart(4, "0")}-${String(numero).padStart(8, "0")}`;

      const nota = new NotaDeCredito({
        numero: numeroCompleto,
        puntoVenta: parseInt(puntoVenta) || 1,
        clienteId: clienteId,
        clienteInfo: {
          cuit: cliente.nroDoc,
          razonSocial: cliente.tipoDoc === "DNI" ? cliente.nombre : cliente.razonSocial,
          localidad: cliente.direccion?.split(",")[0] || "",
          provincia: "",
          telefono: cliente.telefono,
          direccion: cliente.direccion,
        },
        fechaEmision: new Date(fechaEmision),
        fechaVencimiento: fechaVencimiento ? new Date(fechaVencimiento) : null,
        conceptos: conceptosArray,
        otrosTributos: parseFloat(otrosTributos) || 0,
        observaciones: observaciones,
        cae: cae,
        fechaVtoCAE: fechaVtoCAE ? new Date(fechaVtoCAE) : null,
        estatus: "Pendiente",
        facturaOrigenId: facturaOrigenId || null,
        facturaOrigenNumero: facturaOrigenNumero || null,
        stockAfectado: false,
      });

      await nota.save();

      // DEVOLVER STOCK (aumentar stock por cada producto)
      const resultadoStock = await StockService.devolverStockDesdeNotaCredito(nota);

      // Actualizar la nota con el resultado del stock
      nota.stockAfectado = true;

      // Actualizar los productoId en los conceptos si se crearon nuevos
      for (let i = 0; i < nota.conceptos.length; i++) {
        const concepto = nota.conceptos[i];
        const resultado = resultadoStock.find(
          (r) => r.descripcion === concepto.descripcion && r.accion === "actualizado"
        );
        if (resultado && resultado.productoId) {
          concepto.productoId = resultado.productoId;
        }
      }

      await nota.save();

      // Actualizar saldo del cliente (DISMINUIR la deuda - crédito a favor)
      let saldoActual = parseFloat(cliente.saldoCuentaCorriente) || 0;
      cliente.saldoCuentaCorriente = saldoActual - nota.total;
      await cliente.save();

      // Mensaje de éxito con información de stock
      const productosDevueltos = resultadoStock.filter(r => r.accion === "devuelto");
      let mensajeExito = "Nota de crédito guardada exitosamente. ";
      if (productosDevueltos.length > 0) {
        mensajeExito += `Se devolvieron al stock ${productosDevueltos.length} productos.`;
      }

      req.session.mensajeExito = mensajeExito;
      res.redirect("/notas-credito");
    } catch (error) {
      console.error(error);
      const clientes = await Cliente.find().sort({ createdAt: 1 });
      const productos = await StockService.obtenerTodosProductos();
      const facturas = await FacturaCliente.find({
        estatus: { $in: ["Pendiente", "Pagada"] }
      }).sort({ createdAt: -1 });

      res.render("notas-credito/crear", {
        titulo: "Nota de Crédito - Devolución",
        clientes: clientes,
        productos: productos,
        facturas: facturas,
        error: error.message,
        datos: req.body,
      });
    }
  },

  // Ver detalle
  ver: async (req, res) => {
    try {
      const nota = await NotaDeCredito.findById(req.params.id);
      if (!nota) {
        return res.status(404).send("Nota de crédito no encontrada");
      }

      // Asegurar que empresaInfo tenga todos los campos necesarios
      if (!nota.empresaInfo) {
        nota.empresaInfo = {
          cuit: "30-12345678-1",
          razonSocial: "TodoStock S.A.",
          direccion: "Av. Libertador 1000 - Avellaneda",
          localidad: "Buenos Aires",
          telefono: "+54 11 2222 3333",
          ingBrutos: "123456789",
          inicioActividades: new Date("2020-01-01"),
        };
      }

      res.render("notas-credito/ver", {
        titulo: `Nota de Crédito ${nota.numero}`,
        nota: nota,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Error al mostrar nota de crédito");
    }
  },

  // Aplicar nota (cambiar estatus)
  aplicar: async (req, res) => {
    try {
      const nota = await NotaDeCredito.findById(req.params.id);
      if (nota && nota.estatus !== "Aplicada" && nota.estatus !== "Anulada") {
        nota.estatus = "Aplicada";
        await nota.save();
        req.session.mensajeExito = "Nota de crédito aplicada exitosamente";
      }
      res.redirect("/notas-credito");
    } catch (error) {
      console.error(error);
      res.status(500).send("Error al aplicar nota de crédito");
    }
  },

  // Anular nota (revertir stock y saldo)
  anular: async (req, res) => {
    try {
      const nota = await NotaDeCredito.findById(req.params.id);

      if (nota && nota.estatus !== "Anulada") {
        // Revertir el efecto de la nota de crédito

        // 1. Revertir saldo del cliente (volver a aumentar el saldo)
        const cliente = await Cliente.findById(nota.clienteId);
        if (cliente) {
          let saldoActual = parseFloat(cliente.saldoCuentaCorriente) || 0;
          // La nota había disminuido el saldo, al anularlo volvemos a aumentarlo
          cliente.saldoCuentaCorriente = saldoActual + nota.total;
          await cliente.save();
        }

        // 2. Revertir stock (volver a descontar los productos devueltos)
        if (nota.stockAfectado) {
          await StockService.revertirDevolucionStockDesdeNotaCredito(nota);
        }

        nota.estatus = "Anulada";
        await nota.save();
      }

      res.redirect("/notas-credito");
    } catch (error) {
      console.error(error);
      res.status(500).send("Error al anular nota de crédito");
    }
  },

  // Eliminar nota
  eliminar: async (req, res) => {
    try {
      const nota = await NotaDeCredito.findById(req.params.id);

      // Revertir efectos si estaba aplicada
      if (nota && nota.estatus === "Aplicada") {
        // Revertir saldo del cliente
        const cliente = await Cliente.findById(nota.clienteId);
        if (cliente) {
          let saldoActual = parseFloat(cliente.saldoCuentaCorriente) || 0;
          cliente.saldoCuentaCorriente = saldoActual + nota.total;
          await cliente.save();
        }

        // Revertir stock
        if (nota.stockAfectado) {
          await StockService.revertirDevolucionStockDesdeNotaCredito(nota);
        }
      }

      await NotaDeCredito.findByIdAndDelete(req.params.id);
      res.redirect("/notas-credito");
    } catch (error) {
      console.error(error);
      res.status(500).send("Error al eliminar nota de crédito");
    }
  },

  // API para buscar productos
  buscarProductos: async (req, res) => {
    try {
      const termino = req.query.q || "";
      const productos = await StockService.buscarProductos(termino);
      res.json({ success: true, productos });
    } catch (error) {
      res.json({ success: false, error: error.message });
    }
  },
};

module.exports = notaDeCreditoController;