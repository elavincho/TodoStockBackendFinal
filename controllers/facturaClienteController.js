const FacturaCliente = require("../models/FacturaCliente");
const Cliente = require("../models/Cliente");
const StockService = require("../services/stockService");
const Producto = require("../models/Producto");
const mongoose = require('mongoose');

const facturaClienteController = {
  // Listar todas las facturas
  index: async (req, res) => {
    try {
      // ✅ Ahora puedes usar populate para obtener los datos del cliente
      const facturas = await FacturaCliente.find()
        .populate('clienteId', 'nombre razonSocial nroDoc')
        .sort({ createdAt: -1 });
      
      res.render("facturas-cliente/index", {
        titulo: "Facturas de Clientes - TodoStock S.A.",
        facturas: facturas,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Error al listar facturas");
    }
  },

  formCrear: async (req, res) => {
    try {
      const clientes = await Cliente.find().sort({ nombre: 1 });
      const productos = await StockService.obtenerTodosProductos();
      res.render("facturas-cliente/crear", {
        titulo: "Nueva Factura de Cliente",
        clientes: clientes,
        productos: productos,
        error: null,
        datos: null,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Error al cargar formulario");
    }
  },

  almacenar: async (req, res) => {
    try {
      const {
        clienteId,
        numero,
        puntoVenta,
        fechaEmision,
        fechaVencimiento,
        detalles,
        observaciones,
        cae,
        fechaVtoCAE,
        otrosTributos,
      } = req.body;

      // ✅ Verificar que clienteId sea un ObjectId válido
      if (!mongoose.Types.ObjectId.isValid(clienteId)) {
        throw new Error("ID de cliente inválido");
      }

      // ✅ Buscar por _id directamente (ya no usamos parseInt)
      const cliente = await Cliente.findById(clienteId);
      if (!cliente) {
        throw new Error("Cliente no encontrado");
      }

      // Parsear detalles del formulario
      const detallesArray = [];
      if (detalles && detalles.codigo) {
        const numDetalles = detalles.codigo.length;
        for (let i = 0; i < numDetalles; i++) {
          const cantidad = parseFloat(detalles.cantidad[i]) || 0;
          const precioUnitario = parseFloat(detalles.precioUnitario[i]) || 0;
          const importe = cantidad * precioUnitario;

          // ✅ Si hay productoId, asegurarse de que sea ObjectId
          let productoId = null;
          if (detalles.productoId && detalles.productoId[i]) {
            const id = detalles.productoId[i];
            if (mongoose.Types.ObjectId.isValid(id)) {
              productoId = id;
            }
          }

          detallesArray.push({
            codigo: detalles.codigo[i],
            descripcion: detalles.descripcion[i],
            cantidad: cantidad,
            precioUnitario: precioUnitario,
            alicIva: detalles.alicIva[i] || "21%",
            importe: importe,
            productoId: productoId,
            actualizarStock: true,
          });
        }
      }

      // Formatear número de factura
      const numeroCompleto = `${String(puntoVenta || 1).padStart(4, "0")}-${String(numero).padStart(8, "0")}`;

      const factura = new FacturaCliente({
        numero: numeroCompleto,
        puntoVenta: parseInt(puntoVenta) || 1,
        clienteId: clienteId, // ✅ Ahora es ObjectId
        clienteInfo: {
          cuit: cliente.nroDoc,
          razonSocial:
            cliente.tipoDoc === "DNI" ? cliente.nombre : cliente.razonSocial,
          localidad: cliente.direccion?.split(",")[0] || "",
          provincia: "",
          telefono: cliente.telefono,
          direccion: cliente.direccion,
        },
        fechaEmision: new Date(fechaEmision),
        fechaVencimiento: fechaVencimiento ? new Date(fechaVencimiento) : null,
        estatus: "Pendiente",
        detalles: detallesArray,
        otrosTributos: parseFloat(otrosTributos) || 0,
        cae: cae,
        fechaVtoCAE: fechaVtoCAE ? new Date(fechaVtoCAE) : null,
        observaciones: observaciones,
        stockDescontado: false,
      });

      await factura.save();

      // Descontar stock (esto creará productos nuevos automáticamente si es necesario)
      const resultadoStock =
        await StockService.descontarStockDesdeFacturaCliente(factura);

      // Actualizar la factura con los productos creados
      factura.stockDescontado = true;

      for (let i = 0; i < factura.detalles.length; i++) {
        const detalle = factura.detalles[i];
        const resultado = resultadoStock.find(
          (r) => r.codigo === detalle.codigo && r.accion === "creado",
        );
        if (resultado && resultado.productoId) {
          detalle.productoId = resultado.productoId;
        }
      }

      await factura.save();

      // Actualizar saldo del cliente (débito)
      const totalFactura = factura.total;
      let saldoActual = parseFloat(cliente.saldoCuentaCorriente) || 0;
      cliente.saldoCuentaCorriente = saldoActual + totalFactura;
      await cliente.save();

      console.log("📦 Resultado de actualización de stock:", resultadoStock);

      const productosCreados = resultadoStock.filter(
        (r) => r.accion === "creado",
      );
      const productosActualizados = resultadoStock.filter(
        (r) => r.accion === "descontado",
      );

      let mensajeExito = "Factura guardada exitosamente. ";
      if (productosCreados.length > 0) {
        mensajeExito += `Se crearon ${productosCreados.length} productos nuevos: ${productosCreados.map((p) => p.nombre).join(", ")}. `;
      }
      if (productosActualizados.length > 0) {
        mensajeExito += `Se descontaron ${productosActualizados.length} productos del stock.`;
      }

      req.session.mensajeExito = mensajeExito;
      res.redirect("/facturas-cliente");
    } catch (error) {
      console.error(error);
      try {
        const clientes = await Cliente.find().sort({ nombre: 1 });
        const productos = await StockService.obtenerTodosProductos();
        res.render("facturas-cliente/crear", {
          titulo: "Nueva Factura de Cliente",
          clientes: clientes,
          productos: productos,
          error: error.message,
          datos: req.body,
        });
      } catch (err) {
        res.status(500).send("Error al cargar formulario con error");
      }
    }
  },

  ver: async (req, res) => {
    try {
      const factura = await FacturaCliente.findById(req.params.id)
        .populate('clienteId', 'nombre razonSocial nroDoc telefono direccion');
      
      if (!factura) {
        return res.status(404).send("Factura no encontrada");
      }

      // Asegurar que empresaInfo tenga todos los campos necesarios
      if (!factura.empresaInfo) {
        factura.empresaInfo = {
          cuit: "30-12345678-1",
          razonSocial: "TodoStock S.A.",
          direccion: "Av. Libertador 1000 - Avellaneda",
          localidad: "Buenos Aires",
          telefono: "+54 11 2222 3333",
          ingBrutos: "123456789",
          inicioActividades: new Date("2020-01-01"),
        };
      }

      res.render("facturas-cliente/ver", {
        titulo: `Factura ${factura.numero}`,
        factura: factura,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Error al mostrar factura");
    }
  },

  // Anular factura
  anular: async (req, res) => {
    try {
      const factura = await FacturaCliente.findById(req.params.id);

      if (factura && factura.estatus !== "Anulada") {
        // Revertir stock si estaba descontado
        if (factura.stockDescontado) {
          await StockService.revertirStockDesdeFacturaCliente(factura);
        }

        // Revertir saldo del cliente - buscar por _id
        const cliente = await Cliente.findById(factura.clienteId);
        if (cliente) {
          let saldoActual = parseFloat(cliente.saldoCuentaCorriente) || 0;
          cliente.saldoCuentaCorriente = saldoActual - factura.total;
          await cliente.save();
        }

        factura.estatus = "Anulada";
        await factura.save();
      }

      res.redirect("/facturas-cliente");
    } catch (error) {
      console.error(error);
      res.status(500).send("Error al anular factura");
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

  // Ver inventario
  inventario: async (req, res) => {
    try {
      const inventario = await StockService.obtenerInventario();
      res.render("facturas-cliente/inventario", {
        titulo: "Inventario de Productos - TodoStock S.A.",
        productos: inventario,
        usuario: req.session.usuario,
        mensajeExito: req.session.mensajeExito,
      });
      req.session.mensajeExito = null;
    } catch (error) {
      console.error(error);
      res.status(500).send("Error al cargar inventario");
    }
  },

  // Cambiar estatus
  cambiarEstatus: async (req, res) => {
    try {
      const { estatus } = req.body;
      await FacturaCliente.findByIdAndUpdate(
        req.params.id,
        { estatus: estatus },
        { new: true },
      );
      res.redirect("/facturas-cliente");
    } catch (error) {
      console.error(error);
      res.status(500).send("Error al cambiar estatus");
    }
  },

  // Marcar como pagada
  marcarPagada: async (req, res) => {
    try {
      const factura = await FacturaCliente.findById(req.params.id);
      if (factura && factura.estatus !== "Pagada") {
        factura.estatus = "Pagada";
        factura.fechaCobro = new Date();
        await factura.save();
      }
      res.redirect("/facturas-cliente");
    } catch (error) {
      console.error(error);
      res.status(500).send("Error al marcar factura como pagada");
    }
  },

  // Eliminar factura
  eliminar: async (req, res) => {
    try {
      const factura = await FacturaCliente.findById(req.params.id);

      if (factura && factura.stockDescontado && factura.estatus !== "Anulada") {
        await StockService.revertirStockDesdeFacturaCliente(factura);

        // Revertir saldo del cliente - buscar por _id
        const cliente = await Cliente.findById(factura.clienteId);
        if (cliente) {
          let saldoActual = parseFloat(cliente.saldoCuentaCorriente) || 0;
          cliente.saldoCuentaCorriente = saldoActual - factura.total;
          await cliente.save();
        }
      }

      await FacturaCliente.findByIdAndDelete(req.params.id);
      res.redirect("/facturas-cliente");
    } catch (error) {
      console.error(error);
      res.status(500).send("Error al eliminar factura");
    }
  },
};

module.exports = facturaClienteController;
