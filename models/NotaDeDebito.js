const mongoose = require("mongoose");

const notaDeDebitoSchema = new mongoose.Schema(
  {
    numero: { type: String, required: true, unique: true },
    puntoVenta: { type: Number, required: true, default: 1 },
    clienteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cliente', required: true
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
    concepto: {
      descripcion: { type: String, required: true },
      precioUnitario: { type: Number, required: true, min: 0 },
      alicIva: { type: String, default: "21%" },
      importe: { type: Number, required: true, min: 0 },
    },
    conceptosDetalle: [
      {
        descripcion: { type: String, required: true },
        precioUnitario: { type: Number, required: true, min: 0 },
        alicIva: { type: String, default: "21%" },
        importe: { type: Number, required: true, min: 0 },
      },
    ],
    subtotalNeto: { type: Number, default: 0 },
    iva21: { type: Number, default: 0 },
    iva105: { type: Number, default: 0 },
    otrosTributos: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    cae: { type: String },
    fechaVtoCAE: Date,
    observaciones: String,
    estatus: {
      type: String,
      enum: ["Pendiente", "Aplicada", "Anulada"],
      default: "Pendiente",
    },
    facturaOrigenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FacturaCliente",
    },
    facturaOrigenNumero: String,
  },
  { timestamps: true },
);

// Middleware para calcular totales antes de guardar
notaDeDebitoSchema.pre("save", function () {
  try {
    const importe = this.concepto.importe || 0;
    let iva21Total = 0;
    let iva105Total = 0;

    if (this.concepto.alicIva === "21%") {
      iva21Total = importe * 0.21;
    } else if (this.concepto.alicIva === "10.5%") {
      iva105Total = importe * 0.105;
    }

    this.subtotalNeto = importe;
    this.iva21 = iva21Total;
    this.iva105 = iva105Total;
    this.total = importe + iva21Total + iva105Total + (this.otrosTributos || 0);
  } catch (error) {
    console.error("Error calculando totales:", error);
    throw error;
  }
});

module.exports = mongoose.model("NotaDeDebito", notaDeDebitoSchema);
