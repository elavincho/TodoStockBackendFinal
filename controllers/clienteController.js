const Cliente = require("../models/Cliente");

const clienteController = {
  index: (req, res) => {
    res.render("clientes/index", {
      titulo: "Clientes - TodoStock S.A.",
    });
  },

  listar: async (req, res) => {
    try {
      const clientes = await Cliente.find().sort({ createdAt: 1 });
      res.render("clientes/listar", {
        titulo: "Clientes - TodoStock S.A.",
        clientes,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Error al listar clientes");
    }
  },

  formCrear: (req, res) => {
    res.render("clientes/crear", {
      titulo: "Registrar Nuevo Cliente",
      error: null,
      datos: null,
    });
  },

  almacenar: async (req, res) => {
    try {
      const clienteLimpio = {
        tipoDoc: req.body.tipoDoc,
        nroDoc: req.body.nroDoc,
        nombre: req.body.tipoDoc === "DNI" ? req.body.nombre : null,
        email: req.body.email,
        telefono: req.body.telefono,
        direccion: req.body.direccion,
        razonSocial: req.body.tipoDoc === "CUIT" ? req.body.razonSocial : null,
        saldoCuentaCorriente: parseFloat(req.body.saldoCuentaCorriente) || 0,
      };

      await Cliente.create(clienteLimpio);
      res.redirect("/clientes/listar");
    } catch (error) {
      res.render("clientes/crear", {
        titulo: "Registrar Nuevo Cliente",
        error: error.message,
        datos: req.body,
      });
    }
  },

  formEditar: async (req, res) => {
    try {
      const cliente = await Cliente.findById(req.params.id);
      if (!cliente) {
        return res.status(404).send("Cliente no encontrado");
      }
      res.render("clientes/editar", { titulo: "Editar Cliente", cliente });
    } catch (error) {
      console.error(error);
      res.status(500).send("Error al buscar cliente");
    }
  },

  actualizar: async (req, res) => {
    try {
      await Cliente.findByIdAndUpdate(
        req.params.id,
        {
          nombre: req.body.nombre,
          tipoDoc: req.body.tipoDoc,
          razonSocial: req.body.razonSocial,
          nroDoc: req.body.nroDoc,
          email: req.body.email,
          telefono: req.body.telefono,
          direccion: req.body.direccion,
          saldoCuentaCorriente: parseFloat(req.body.saldoCuentaCorriente) || 0,
        },
        { new: true },
      );
      res.redirect("/clientes/listar");
    } catch (error) {
      console.error(error);
      res.status(500).send("Error al actualizar cliente");
    }
  },

  eliminar: async (req, res) => {
    try {
      await Cliente.findByIdAndDelete(req.params.id);
      res.redirect("/clientes/listar");
    } catch (error) {
      console.error(error);
      res.status(500).send("Error al eliminar cliente");
    }
  },
};

module.exports = clienteController;
