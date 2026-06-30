const mongoose = require("mongoose");

const presupuestoSchema = new mongoose.Schema(
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
      email: String,
    },
    empresaInfo: {
      cuit: { type: String, default: "30-12345678-1" },
      razonSocial: { type: String, default: "TodoStock S.A." },
      direccion: { type: String, default: "Av. Libertador 1000 - Avellaneda" },
      localidad: { type: String, default: "Buenos Aires" },
      telefono: { type: String, default: "+54 11 2222 3333" },
      email: { type: String, default: "ventas@todostock.com" },
      ingBrutos: String,
      inicioActividades: Date,
    },
    fechaEmision: { type: Date, required: true, default: Date.now },
    fechaVencimiento: Date,
    fechaValidez: { type: Date, required: true },
    // Múltiples conceptos (igual que factura cliente)
    conceptos: [
      {
        codigo: { type: String, default: "" },
        descripcion: { type: String, required: true },
        cantidad: { type: Number, required: true, min: 0, default: 1 },
        precioUnitario: { type: Number, required: true, min: 0 },
        alicIva: { type: String, default: "21%" },
        importe: { type: Number, required: true, min: 0 },
        // productoId: { type: Number, default: null },
      },
    ],
    subtotalNeto: { type: Number, default: 0 },
    iva21: { type: Number, default: 0 },
    iva105: { type: Number, default: 0 },
    otrosTributos: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    observaciones: String,
    condicionesPago: { type: String, default: "Contado" },
    tiempoEntrega: { type: String, default: "Consultar" },
    garantia: { type: String, default: "6 meses" },
    estatus: {
      type: String,
      enum: ["Pendiente", "Aprobado", "Rechazado", "Vencido", "Convertido"],
      default: "Pendiente",
    },
    facturaGeneradaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FacturaCliente",
    },
    facturaGeneradaNumero: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

// Middleware para calcular totales antes de guardar
presupuestoSchema.pre("save", function () {
  try {
    let subtotalNeto = 0;
    let iva21Total = 0;
    let iva105Total = 0;

    if (this.conceptos && this.conceptos.length > 0) {
      this.conceptos.forEach((concepto) => {
        const importe = concepto.importe || 0;
        subtotalNeto += importe;

        if (concepto.alicIva === "21%") {
          iva21Total += importe * 0.21;
        } else if (concepto.alicIva === "10.5%") {
          iva105Total += importe * 0.105;
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

module.exports = mongoose.model("Presupuesto", presupuestoSchema);
