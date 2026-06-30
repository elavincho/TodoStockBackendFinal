const mongoose = require("mongoose");

// Schema para detalle de productos/servicios
const detalleFacturaClienteSchema = new mongoose.Schema({
  codigo: { type: String, required: false },
  descripcion: { type: String, required: true },
  cantidad: { type: Number, required: true, min: 0 },
  precioUnitario: { type: Number, required: true, min: 0 },
  alicIva: { type: String, default: "21%" },
  importe: { type: Number, required: true, min: 0 },
  // ✅ Cambiado a ObjectId para referenciar a Producto
  productoId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Producto',
    default: null,
    set: function(v) {
      if (!v || v === '') return null;
      if (typeof v === 'string') v = v.trim();
      if (mongoose.Types.ObjectId.isValid(v) && String(v).length === 24) return v;
      return null;
    }
  },
  actualizarStock: { type: Boolean, default: true },
});

const facturaClienteSchema = new mongoose.Schema(
  {
    numero: { type: String, required: true, unique: true },
    puntoVenta: { type: Number, required: true, default: 1 },
    // ✅ CAMBIADO: Ahora es ObjectId con referencia a Cliente
    clienteId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Cliente',
      required: true 
    },
    clienteInfo: {
      cuit: String,
      razonSocial: String,
      localidad: String,
      provincia: String,
      telefono: String,
      direccion: String,
    },
    empresaInfo: {
      cuit: { type: String, default: "30-12345678-1" },
      razonSocial: { type: String, default: "TodoStock S.A." },
      direccion: { type: String, default: "Av. Libertador 1000 - Avellaneda" },
      localidad: { type: String, default: "Buenos Aires" },
      telefono: { type: String, default: "+54 11 2222 3333" },
      ingBrutos: String,
      inicioActividades: Date,
    },
    fechaEmision: { type: Date, required: true, default: Date.now },
    fechaVencimiento: Date,
    estatus: {
      type: String,
      enum: ["Pendiente", "Pagada", "Anulada", "Parcial"],
      default: "Pendiente",
    },
    detalles: [detalleFacturaClienteSchema],
    subtotalNeto: { type: Number, default: 0 },
    iva21: { type: Number, default: 0 },
    iva105: { type: Number, default: 0 },
    otrosTributos: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    cae: { type: String },
    fechaVtoCAE: Date,
    observaciones: String,
    cobranzaId: { type: Number, default: null },
    fechaCobro: Date,
    stockDescontado: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// Middleware para calcular totales antes de guardar
facturaClienteSchema.pre("save", function () {
  try {
    let subtotalNeto = 0;
    let iva21Total = 0;
    let iva105Total = 0;

    if (this.detalles && this.detalles.length > 0) {
      this.detalles.forEach((detalle) => {
        subtotalNeto += detalle.importe || 0;
        if (detalle.alicIva === "21%") {
          iva21Total += (detalle.importe || 0) * 0.21;
        } else if (detalle.alicIva === "10.5%") {
          iva105Total += (detalle.importe || 0) * 0.105;
        }
      });
    }

    this.subtotalNeto = subtotalNeto;
    this.iva21 = iva21Total;
    this.iva105 = iva105Total;
    this.total =
      subtotalNeto + iva21Total + iva105Total + (this.otrosTributos || 0);
  } catch (error) {
    console.error("Error calculando totales:", error);
    throw error;
  }
});

module.exports = mongoose.model("FacturaCliente", facturaClienteSchema);
