const Producto = require("../models/Producto");

class StockService {
  // Método estático para obtener el próximo ID disponible
  static async getNextProductoId() {
    const ultimoProducto = await Producto.findOne().sort({ id: -1 });
    return ultimoProducto ? ultimoProducto.id + 1 : 1;
  }

  // Actualizar stock desde una factura
  static async actualizarStockDesdeFactura(factura) {
    const resultados = [];

    for (const detalle of factura.detalles) {
      let producto = null;

      if (detalle.productoId) {
        producto = await Producto.findOne({ id: detalle.productoId });
      }

      if (!producto && detalle.codigo) {
        const codigoNumero = parseInt(detalle.codigo);
        if (!isNaN(codigoNumero)) {
          producto = await Producto.findOne({ id: codigoNumero });
        }

        if (!producto && detalle.descripcion) {
          producto = await Producto.findOne({
            nombre: { $regex: `^${detalle.descripcion}$`, $options: "i" },
          });
        }
      }

      if (producto) {
        const stockAnterior = producto.stockActual;
        producto.stockActual += detalle.cantidad;
        producto.precio = detalle.precioUnitario;
        await producto.save();

        resultados.push({
          exito: true,
          accion: "actualizado",
          productoId: producto.id,
          nombre: producto.nombre,
          stockAnterior,
          stockNuevo: producto.stockActual,
          cantidadAgregada: detalle.cantidad,
        });
      } else if (detalle.descripcion) {
        const nuevoId = await StockService.getNextProductoId();
        const nuevoProducto = new Producto({
          id: nuevoId,
          nombre: detalle.descripcion,
          categoria: "Nuevo",
          precio: detalle.precioUnitario,
          stockActual: detalle.cantidad,
          stockMinimo: 0,
        });
        await nuevoProducto.save();
        detalle.productoId = nuevoId;

        resultados.push({
          exito: true,
          accion: "creado",
          productoId: nuevoId,
          nombre: detalle.descripcion,
          stockActual: detalle.cantidad,
          cantidadAgregada: detalle.cantidad,
          mensaje: `Producto "${detalle.descripcion}" creado automáticamente (ID: ${nuevoId})`,
        });
      } else {
        resultados.push({
          exito: false,
          codigo: detalle.codigo,
          descripcion: detalle.descripcion,
          error: "No se pudo crear el producto: falta descripción",
        });
      }
    }
    return resultados;
  }

  // Revertir stock al anular una factura
  static async revertirStockDesdeFactura(factura) {
    const resultados = [];
    for (const detalle of factura.detalles) {
      let producto = null;
      if (detalle.productoId) {
        producto = await Producto.findOne({ id: detalle.productoId });
      } else if (detalle.codigo) {
        const codigoNumero = parseInt(detalle.codigo);
        if (!isNaN(codigoNumero)) {
          producto = await Producto.findOne({ id: codigoNumero });
        }
      }
      if (producto) {
        const stockAnterior = producto.stockActual;
        producto.stockActual -= detalle.cantidad;
        if (producto.stockActual < 0) producto.stockActual = 0;
        await producto.save();
        resultados.push({
          exito: true,
          productoId: producto.id,
          nombre: producto.nombre,
          stockAnterior,
          stockNuevo: producto.stockActual,
          cantidadRevertida: detalle.cantidad,
        });
      } else {
        resultados.push({
          exito: false,
          descripcion: detalle.descripcion,
          error: "Producto no encontrado para revertir stock",
        });
      }
    }
    return resultados;
  }

  // Buscar productos para autocompletado
  static async buscarProductos(termino) {
    const productos = await Producto.find({
      $or: [
        { nombre: { $regex: termino, $options: "i" } },
        { id: !isNaN(termino) ? parseInt(termino) : -1 },
        { categoria: { $regex: termino, $options: "i" } },
      ],
    }).limit(10);
    return productos;
  }

  // Obtener inventario completo
  static async obtenerInventario() {
    const productos = await Producto.find().sort({ id: 1 });
    return productos.map((p) => ({
      id: p.id,
      nombre: p.nombre,
      categoria: p.categoria,
      precio: p.precio,
      stockActual: p.stockActual,
      stockMinimo: p.stockMinimo,
      estado: p.stockActual <= p.stockMinimo ? "⚠️ Bajo stock" : "✅ Normal",
      colorEstado: p.stockActual <= p.stockMinimo ? "#cc0000" : "#28a745",
    }));
  }

  // Obtener todos los productos para el selector
  static async obtenerTodosProductos() {
    return await Producto.find().sort({ nombre: 1 });
  }

  // Descontar stock desde una factura de cliente
  static async descontarStockDesdeFacturaCliente(factura) {
    const resultados = [];
    for (const detalle of factura.detalles) {
      let producto = null;
      if (detalle.productoId) {
        producto = await Producto.findOne({ id: detalle.productoId });
      }
      if (!producto && detalle.codigo) {
        const codigoNumero = parseInt(detalle.codigo);
        if (!isNaN(codigoNumero)) {
          producto = await Producto.findOne({ id: codigoNumero });
        }
        if (!producto && detalle.descripcion) {
          producto = await Producto.findOne({
            nombre: { $regex: `^${detalle.descripcion}$`, $options: "i" },
          });
        }
      }
      if (producto) {
        if (producto.stockActual < detalle.cantidad) {
          throw new Error(
            `Stock insuficiente para el producto "${producto.nombre}". Stock actual: ${producto.stockActual}, Requerido: ${detalle.cantidad}`
          );
        }
        const stockAnterior = producto.stockActual;
        producto.stockActual -= detalle.cantidad;
        await producto.save();
        resultados.push({
          exito: true,
          accion: "descontado",
          productoId: producto.id,
          nombre: producto.nombre,
          stockAnterior,
          stockNuevo: producto.stockActual,
          cantidadDescontada: detalle.cantidad,
        });
      } else if (detalle.descripcion) {
        resultados.push({
          exito: false,
          codigo: detalle.codigo,
          descripcion: detalle.descripcion,
          error: "Producto no encontrado en el inventario",
        });
        throw new Error(
          `Producto "${detalle.descripcion}" no encontrado en el inventario. Verifique el catálogo.`
        );
      } else {
        resultados.push({
          exito: false,
          codigo: detalle.codigo,
          descripcion: detalle.descripcion,
          error: "No se pudo descontar stock: producto no identificado",
        });
      }
    }
    return resultados;
  }

  // Revertir stock desde una factura de cliente (cuando se anula)
  static async revertirStockDesdeFacturaCliente(factura) {
    const resultados = [];
    for (const detalle of factura.detalles) {
      let producto = null;
      if (detalle.productoId) {
        producto = await Producto.findOne({ id: detalle.productoId });
      } else if (detalle.codigo) {
        const codigoNumero = parseInt(detalle.codigo);
        if (!isNaN(codigoNumero)) {
          producto = await Producto.findOne({ id: codigoNumero });
        }
      }
      if (producto) {
        const stockAnterior = producto.stockActual;
        producto.stockActual += detalle.cantidad;
        await producto.save();
        resultados.push({
          exito: true,
          productoId: producto.id,
          nombre: producto.nombre,
          stockAnterior,
          stockNuevo: producto.stockActual,
          cantidadRevertida: detalle.cantidad,
        });
      } else {
        resultados.push({
          exito: false,
          descripcion: detalle.descripcion,
          error: "Producto no encontrado para revertir stock",
        });
      }
    }
    return resultados;
  }

  // Devolver stock desde una nota de crédito
  static async devolverStockDesdeNotaCredito(nota) {
    const resultados = [];
    for (const concepto of nota.conceptos) {
      let producto = null;
      if (concepto.productoId) {
        producto = await Producto.findOne({ id: concepto.productoId });
      }
      if (!producto && concepto.codigo) {
        const codigoNumero = parseInt(concepto.codigo);
        if (!isNaN(codigoNumero)) {
          producto = await Producto.findOne({ id: codigoNumero });
        }
      }
      if (!producto && concepto.descripcion) {
        producto = await Producto.findOne({
          nombre: { $regex: `^${concepto.descripcion}$`, $options: "i" },
        });
      }
      if (producto) {
        const stockAnterior = producto.stockActual;
        producto.stockActual += concepto.cantidad;
        await producto.save();
        resultados.push({
          exito: true,
          accion: "devuelto",
          productoId: producto.id,
          nombre: producto.nombre,
          stockAnterior,
          stockNuevo: producto.stockActual,
          cantidadDevuelta: concepto.cantidad,
        });
      } else {
        resultados.push({
          exito: false,
          codigo: concepto.codigo,
          descripcion: concepto.descripcion,
          error: "Producto no encontrado en el inventario para devolver",
        });
        throw new Error(
          `Producto "${concepto.descripcion}" no encontrado en el inventario.`
        );
      }
    }
    return resultados;
  }

  // Revertir la devolución de stock (cuando se anula una nota de crédito)
  static async revertirDevolucionStockDesdeNotaCredito(nota) {
    const resultados = [];
    for (const concepto of nota.conceptos) {
      let producto = null;
      if (concepto.productoId) {
        producto = await Producto.findOne({ id: concepto.productoId });
      } else if (concepto.codigo) {
        const codigoNumero = parseInt(concepto.codigo);
        if (!isNaN(codigoNumero)) {
          producto = await Producto.findOne({ id: codigoNumero });
        }
      }
      if (producto) {
        const stockAnterior = producto.stockActual;
        producto.stockActual -= concepto.cantidad;
        if (producto.stockActual < 0) producto.stockActual = 0;
        await producto.save();
        resultados.push({
          exito: true,
          productoId: producto.id,
          nombre: producto.nombre,
          stockAnterior,
          stockNuevo: producto.stockActual,
          cantidadRevertida: concepto.cantidad,
        });
      } else {
        resultados.push({
          exito: false,
          descripcion: concepto.descripcion,
          error: "Producto no encontrado para revertir devolución",
        });
      }
    }
    return resultados;
  }
}

module.exports = StockService;
