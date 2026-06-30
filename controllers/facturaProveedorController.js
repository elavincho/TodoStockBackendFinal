const FacturaProveedor = require("../models/FacturaProveedor");
const Proveedor = require("../models/Proveedor");
const StockService = require("../services/stockService");
const Producto = require("../models/Producto");
const mongoose = require('mongoose');

const facturaProveedorController = {
  // Listar todas las facturas
  index: async (req, res) => {
    try {
      // Ahora puedes usar populate para obtener los datos del proveedor
      const facturas = await FacturaProveedor.find()
        .populate('proveedorId', 'nombre razonSocial nroDoc')
        .sort({ createdAt: -1 });
      
      res.render("facturas-proveedor/index", {
        titulo: "Facturas de Proveedores - TodoStock S.A.",
        facturas: facturas,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Error al listar facturas");
    }
  },

  // Formulario de creación
  formCrear: async (req, res) => {
    try {
      const proveedores = await Proveedor.find().sort({ nombre: 1 });
      const productos = await StockService.obtenerTodosProductos();
      res.render("facturas-proveedor/crear", {
        titulo: "Nueva Factura de Proveedor",
        proveedores: proveedores,
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
        proveedorId,
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

      // Verificar que proveedorId sea un ObjectId válido
      if (!mongoose.Types.ObjectId.isValid(proveedorId)) {
        throw new Error("ID de proveedor inválido");
      }

      // Buscar por _id directamente (ya no usamos parseInt)
      const proveedor = await Proveedor.findById(proveedorId);
      if (!proveedor) {
        throw new Error("Proveedor no encontrado");
      }

      // Parsear detalles del formulario
      const detallesArray = [];
      if (detalles && detalles.codigo) {
        // Asegurar que sean arrays
        const codigos = Array.isArray(detalles.codigo) ? detalles.codigo : [detalles.codigo];
        const descripciones = Array.isArray(detalles.descripcion) ? detalles.descripcion : [detalles.descripcion];
        const cantidades = Array.isArray(detalles.cantidad) ? detalles.cantidad : [detalles.cantidad];
        const precios = Array.isArray(detalles.precioUnitario) ? detalles.precioUnitario : [detalles.precioUnitario];
        const ivas = Array.isArray(detalles.alicIva) ? detalles.alicIva : [detalles.alicIva];
        const productoIds = detalles.productoId 
          ? (Array.isArray(detalles.productoId) ? detalles.productoId : [detalles.productoId])
          : [];

        const numDetalles = codigos.length;
        for (let i = 0; i < numDetalles; i++) {
          const cantidad = parseFloat(cantidades[i]) || 0;
          const precioUnitario = parseFloat(precios[i]) || 0;
          const importe = cantidad * precioUnitario;

          // Si hay productoId, validar que sea ObjectId de 24 chars
          let productoId = null;
          if (productoIds[i]) {
            const id = productoIds[i].trim();
            if (id && id.length === 24 && mongoose.Types.ObjectId.isValid(id)) {
              productoId = new mongoose.Types.ObjectId(id);
            }
          }

          detallesArray.push({
            codigo: codigos[i] || '',
            descripcion: descripciones[i] || '',
            cantidad: cantidad,
            precioUnitario: precioUnitario,
            alicIva: ivas[i] || "21%",
            importe: importe,
            productoId: productoId,
            actualizarStock: true,
          });
        }
      }

      // Formatear número de factura
      const numeroCompleto = `${String(puntoVenta || 1).padStart(4, "0")}-${String(numero).padStart(8, "0")}`;

      // Crear factura con ObjectId
      const factura = new FacturaProveedor({
        numero: numeroCompleto,
        puntoVenta: parseInt(puntoVenta) || 1,
        proveedorId: proveedorId, // ✅ Ahora es ObjectId
        proveedorInfo: {
          cuit: proveedor.nroDoc,
          razonSocial: proveedor.tipoDoc === "DNI"
            ? proveedor.nombre
            : proveedor.razonSocial,
          localidad: proveedor.direccion?.split(",")[0] || "",
          provincia: "",
          telefono: proveedor.telefono,
          direccion: proveedor.direccion,
        },
        fechaEmision: new Date(fechaEmision),
        fechaVencimiento: fechaVencimiento ? new Date(fechaVencimiento) : null,
        estatus: "Pendiente",
        detalles: detallesArray,
        otrosTributos: parseFloat(otrosTributos) || 0,
        cae: cae,
        fechaVtoCAE: fechaVtoCAE ? new Date(fechaVtoCAE) : null,
        observaciones: observaciones,
        stockActualizado: false,
      });

      await factura.save();

      // Actualizar stock
      const resultadoStock = await StockService.actualizarStockDesdeFactura(factura);

      // Actualizar la factura con los productos creados
      factura.stockActualizado = true;

      // Actualizar los productoId en los detalles (ahora son ObjectId)
      for (let i = 0; i < factura.detalles.length; i++) {
        const detalle = factura.detalles[i];
        const resultado = resultadoStock.find(
          (r) => r.codigo === detalle.codigo && r.accion === "creado"
        );
        if (resultado && resultado.productoId) {
          detalle.productoId = resultado.productoId;
        }
      }

      await factura.save();

      // Mensaje de éxito...
      const productosCreados = resultadoStock.filter(r => r.accion === "creado");
      const productosActualizados = resultadoStock.filter(r => r.accion === "actualizado");

      let mensajeExito = "Factura guardada exitosamente. ";
      if (productosCreados.length > 0) {
        mensajeExito += `Se crearon ${productosCreados.length} productos nuevos. `;
      }
      if (productosActualizados.length > 0) {
        mensajeExito += `Se actualizaron ${productosActualizados.length} productos existentes.`;
      }

      req.session.mensajeExito = mensajeExito;
      res.redirect("/facturas-proveedor");

    } catch (error) {
      console.error(error);
      try {
        const proveedores = await Proveedor.find().sort({ nombre: 1 });
        const productos = await StockService.obtenerTodosProductos();
        res.render("facturas-proveedor/crear", {
          titulo: "Nueva Factura de Proveedor",
          proveedores: proveedores,
          productos: productos,
          error: error.message,
          datos: req.body,
        });
      } catch (err) {
        res.status(500).send("Error al cargar formulario con error");
      }
    }
  },

  // Actualizar ver para usar populate
  ver: async (req, res) => {
    try {
      const factura = await FacturaProveedor.findById(req.params.id)
        .populate('proveedorId', 'nombre razonSocial nroDoc telefono direccion');
      
      if (!factura) {
        return res.status(404).send("Factura no encontrada");
      }
      res.render("facturas-proveedor/ver", {
        titulo: `Factura ${factura.numero}`,
        factura: factura,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Error al mostrar factura");
    }
  },

  // El resto de métodos mantienen la misma estructura pero asegurando ObjectId
  anular: async (req, res) => {
    try {
      const factura = await FacturaProveedor.findById(req.params.id);

      if (factura && factura.estatus !== "Anulada") {
        if (factura.stockActualizado) {
          await StockService.revertirStockDesdeFactura(factura);
        }
        factura.estatus = "Anulada";
        await factura.save();
      }
      res.redirect("/facturas-proveedor");
    } catch (error) {
      console.error(error);
      res.status(500).send("Error al anular factura");
    }
  },

  cambiarEstatus: async (req, res) => {
    try {
      const { estatus } = req.body;
      await FacturaProveedor.findByIdAndUpdate(
        req.params.id,
        { estatus: estatus },
        { new: true }
      );
      res.redirect("/facturas-proveedor");
    } catch (error) {
      console.error(error);
      res.status(500).send("Error al cambiar estatus");
    }
  },

  eliminar: async (req, res) => {
    try {
      const factura = await FacturaProveedor.findById(req.params.id);

      if (factura && factura.stockActualizado && factura.estatus !== "Anulada") {
        await StockService.revertirStockDesdeFactura(factura);
      }

      await FacturaProveedor.findByIdAndDelete(req.params.id);
      res.redirect("/facturas-proveedor");
    } catch (error) {
      console.error(error);
      res.status(500).send("Error al eliminar factura");
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

  inventario: async (req, res) => {
    try {
      const inventario = await StockService.obtenerInventario();
      res.render("facturas-proveedor/inventario", {
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
};

module.exports = facturaProveedorController;