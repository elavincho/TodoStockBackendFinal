const Presupuesto = require("../models/Presupuesto");
const Cliente = require("../models/Cliente");
const FacturaCliente = require("../models/FacturaCliente");
const StockService = require("../services/stockService");
const mongoose = require("mongoose");

const presupuestoController = {
  // Listar todos los presupuestos
  index: async (req, res) => {
    try {
      const presupuestos = await Presupuesto.find().sort({ createdAt: -1 });
      res.render("presupuestos/index", {
        titulo: "Presupuestos - TodoStock S.A.",
        presupuestos: presupuestos,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Error al listar presupuestos");
    }
  },

  // Formulario de creación
  formCrear: async (req, res) => {
    try {
      // CORRECCIÓN: Usar find() en lugar de findById(req.params.id)
      const clientes = await Cliente.find().sort({ createdAt: 1 });
      const productos = await StockService.obtenerTodosProductos();

      // Fecha por defecto: 30 días de validez
      const fechaDefault = new Date();
      fechaDefault.setDate(fechaDefault.getDate() + 30);

      res.render("presupuestos/crear", {
        titulo: "Nuevo Presupuesto",
        clientes: clientes,
        productos: productos,
        error: null,
        datos: null,
        fechaValidezDefault: fechaDefault.toISOString().split('T')[0],
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Error al cargar formulario");
    }
  },

  // Guardar nuevo presupuesto
  almacenar: async (req, res) => {
    try {
      const {
        clienteId,
        puntoVenta,
        numero,
        fechaEmision,
        fechaValidez,
        fechaVencimiento,
        conceptos,
        otrosTributos,
        observaciones,
        condicionesPago,
        tiempoEntrega,
        garantia,
      } = req.body;

      // Obtener datos del cliente
      if (!mongoose.Types.ObjectId.isValid(clienteId)) {
        throw new Error("ID de cliente inválido");
      }

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
        });
      }

      // Formatear número de presupuesto
      const numeroCompleto = `${String(puntoVenta || 1).padStart(4, "0")}-${String(numero).padStart(8, "0")}`;

      const presupuesto = new Presupuesto({
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
          email: cliente.email,
        },
        fechaEmision: new Date(fechaEmision),
        fechaVencimiento: fechaVencimiento ? new Date(fechaVencimiento) : null,
        fechaValidez: new Date(fechaValidez),
        conceptos: conceptosArray,
        otrosTributos: parseFloat(otrosTributos) || 0,
        observaciones: observaciones,
        condicionesPago: condicionesPago || "Contado",
        tiempoEntrega: tiempoEntrega || "Consultar",
        garantia: garantia || "6 meses",
        estatus: "Pendiente",
      });

      await presupuesto.save();

      req.session.mensajeExito = `Presupuesto N° ${presupuesto.numero} creado exitosamente`;
      res.redirect("/presupuestos");
    } catch (error) {
      console.error(error);
      // CORRECCIÓN: En caso de error, obtener todos los clientes nuevamente
      const clientes = await Cliente.find().sort({ createdAt: 1 });
      const productos = await StockService.obtenerTodosProductos();
      const fechaDefault = new Date();
      fechaDefault.setDate(fechaDefault.getDate() + 30);

      res.render("presupuestos/crear", {
        titulo: "Nuevo Presupuesto",
        clientes: clientes,
        productos: productos,
        error: error.message,
        datos: req.body,
        fechaValidezDefault: fechaDefault.toISOString().split('T')[0],
      });
    }
  },

  // Ver detalle
  ver: async (req, res) => {
    try {
      const presupuesto = await Presupuesto.findById(req.params.id);
      if (!presupuesto) {
        return res.status(404).send("Presupuesto no encontrado");
      }

      // Verificar si está vencido
      if (presupuesto.estatus === "Pendiente" && new Date() > presupuesto.fechaValidez) {
        presupuesto.estatus = "Vencido";
        await presupuesto.save();
      }

      // Asegurar que empresaInfo tenga todos los campos necesarios
      if (!presupuesto.empresaInfo) {
        presupuesto.empresaInfo = {
          cuit: "30-12345678-1",
          razonSocial: "TodoStock S.A.",
          direccion: "Av. Libertador 1000 - Avellaneda",
          localidad: "Buenos Aires",
          telefono: "+54 11 2222 3333",
          email: "ventas@todostock.com",
          ingBrutos: "123456789",
          inicioActividades: new Date("2020-01-01"),
        };
      }

      res.render("presupuestos/ver", {
        titulo: `Presupuesto ${presupuesto.numero}`,
        presupuesto: presupuesto,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Error al mostrar presupuesto");
    }
  },

  // Aprobar presupuesto
  aprobar: async (req, res) => {
    try {
      const presupuesto = await Presupuesto.findById(req.params.id);
      if (presupuesto && presupuesto.estatus === "Pendiente") {
        presupuesto.estatus = "Aprobado";
        await presupuesto.save();
        req.session.mensajeExito = "Presupuesto aprobado exitosamente";
      }
      res.redirect("/presupuestos");
    } catch (error) {
      console.error(error);
      res.status(500).send("Error al aprobar presupuesto");
    }
  },

  // Rechazar presupuesto
  rechazar: async (req, res) => {
    try {
      const presupuesto = await Presupuesto.findById(req.params.id);
      if (presupuesto && presupuesto.estatus === "Pendiente") {
        presupuesto.estatus = "Rechazado";
        await presupuesto.save();
        req.session.mensajeExito = "Presupuesto rechazado";
      }
      res.redirect("/presupuestos");
    } catch (error) {
      console.error(error);
      res.status(500).send("Error al rechazar presupuesto");
    }
  },

  // Convertir a factura
  convertirAFactura: async (req, res) => {
    try {
      const presupuesto = await Presupuesto.findById(req.params.id);
      if (!presupuesto || presupuesto.estatus !== "Aprobado") {
        throw new Error("El presupuesto debe estar aprobado para convertirlo en factura");
      }

      // Redirigir al formulario de factura con los datos del presupuesto
      req.session.datosPresupuesto = {
        clienteId: presupuesto.clienteId,
        conceptos: presupuesto.conceptos,
        observaciones: presupuesto.observaciones,
        presupuestoNumero: presupuesto.numero,
        presupuestoId: presupuesto._id,
      };

      res.redirect("/facturas-cliente/nuevo?fromPresupuesto=true");
    } catch (error) {
      console.error(error);
      res.status(500).send("Error al convertir presupuesto");
    }
  },

  // Eliminar presupuesto
  eliminar: async (req, res) => {
    try {
      await Presupuesto.findByIdAndDelete(req.params.id);
      res.redirect("/presupuestos");
    } catch (error) {
      console.error(error);
      res.status(500).send("Error al eliminar presupuesto");
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

module.exports = presupuestoController;