const mongoose = require("mongoose");

const renglonSchema = new mongoose.Schema({
  codigoConcepto: { type: String, required: true },
  descripcion: { type: String, required: true },
  debe: { type: Number, default: 0 },
  haber: { type: Number, default: 0 },
  impuesto: { type: String, default: "EXE" },
  montoImpuesto: { type: Number, default: 0 },
  netoRenglon: { type: Number, required: true },
});

const pagoSchema = new mongoose.Schema({
  formaPago: {
    type: String,
    required: true,
    enum: ["Transferencia", "Efectivo", "Cheque", "Tarjeta"],
  },
  referencia: { type: String },
  bancoCuenta: { type: String },
  fecha: { type: Date, required: true },
  montoNeto: { type: Number, required: true },
});

const ordenPagoSchema = new mongoose.Schema(
  {
    numero: {
      type: Number,
      unique: true,
      // Se genera automáticamente en pre-save
    },
    // ✅ CAMBIADO: Ahora es ObjectId con referencia a Proveedor
    proveedorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Proveedor',
      required: true,
    },
    proveedorInfo: {
      rif: String,
      nombre: String,
      direccion: String,
      telefono: String,
    },
    fechaEmision: {
      type: Date,
      required: true,
      default: Date.now,
    },
    fechaImpresion: {
      type: Date,
      default: Date.now,
    },
    estatus: {
      type: String,
      enum: ["Pendiente", "Pagado", "Anulado", "Parcial"],
      default: "Pendiente",
    },
    conceptos: [renglonSchema],
    formasPago: [pagoSchema],
    subtotalDebe: { type: Number, default: 0 },
    subtotalHaber: { type: Number, default: 0 },
    subtotalImpuesto: { type: Number, default: 0 },
    subtotalNeto: { type: Number, default: 0 },
    totalRetencion: { type: Number, default: 0 },
    totalImpuesto: { type: Number, default: 0 },
    montoAPagar: { type: Number, required: true },
    observaciones: { type: String },
    elaboradoPor: { type: String },
    aprobadoPor: { type: String },
    recibioConforme: { type: String },
    cedula: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    facturasPagadas: [
      {
        facturaId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "FacturaProveedor",
        },
        numero: String,
        fecha: Date,
        total: Number,
      },
    ],
  },
  {
    timestamps: true,
  },
);

// Middleware para generar número automático ANTES de guardar
ordenPagoSchema.pre("save", async function () {
  try {
    if (!this.numero) {
      // Buscar la última orden y sumar 1
      const lastOrden = await mongoose
        .model("OrdenPago")
        .findOne()
        .sort({ numero: -1 });
      this.numero = lastOrden ? lastOrden.numero + 1 : 1;
      console.log(`✅ Número de orden generado: ${this.numero}`);
    }
  } catch (error) {
    console.error("Error generando número de orden:", error);
    throw error;
  }
});

module.exports = mongoose.model("OrdenPago", ordenPagoSchema);
