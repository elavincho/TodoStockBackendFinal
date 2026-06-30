const mongoose = require("mongoose");

const clienteSchema = new mongoose.Schema(
  {
    tipoDoc: {
      type: String,
      enum: ["DNI", "CUIT"],
      required: true,
    },
    nroDoc: {
      type: String,
      required: true,
    },
    nombre: {
      type: String,
      default: null,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    telefono: String,
    direccion: String,
    razonSocial: {
      type: String,
      default: null,
    },
    saldoCuentaCorriente: {
      type: Number,
      default: 0,
      get: (v) => parseFloat(v).toFixed(2), // Formatear al obtener
      set: (v) => parseFloat(v), // Convertir al guardar
    },
  },
  {
    timestamps: true,
    toJSON: { getters: true }, // Para que muestre los getters
    toObject: { getters: true },
  },
);

module.exports = mongoose.model("Cliente", clienteSchema);
