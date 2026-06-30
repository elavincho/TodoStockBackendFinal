const mongoose = require("mongoose");

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

const reciboCobroSchema = new mongoose.Schema(
  {
    numero: {
      type: Number,
      unique: true,
    },
    clienteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cliente",
      required: true,
    },
    clienteInfo: {
      cuit: String,
      nombre: String,
      direccion: String,
      telefono: String,
    },
    fechaEmision: {
      type: Date,
      required: true,
      default: Date.now,
    },
    estatus: {
      type: String,
      enum: ["Emitido", "Anulado"],
      default: "Emitido",
    },
    facturasCobradas: [
      {
        facturaId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "FacturaCliente",
        },
        numero: String,
        fecha: Date,
        total: Number,
      },
    ],
    formasPago: [pagoSchema],
    montoCobrado: { type: Number, required: true },
    observaciones: { type: String },
    recibidoPor: { type: String },
  },
  {
    timestamps: true,
  }
);

// Middleware para generar número automático
reciboCobroSchema.pre("save", async function () {
  try {
    if (!this.numero) {
      const lastRecibo = await mongoose
        .model("ReciboCobro")
        .findOne()
        .sort({ numero: -1 });
      this.numero = lastRecibo ? lastRecibo.numero + 1 : 1;
    }
  } catch (error) {
    console.error("Error generando número de recibo:", error);
    throw error;
  }
});

module.exports = mongoose.model("ReciboCobro", reciboCobroSchema);
