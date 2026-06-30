const Proveedor = require("../models/Proveedor");

const proveedorController = {
  index: (req, res) => {
    res.render("proveedores/index", {
      titulo: "Proveedores - TodoStock S.A.",
    });
  },

  listar: async (req, res) => {
    try {
      const proveedores = await Proveedor.find().sort({ createdAt: 1 });
      res.render("proveedores/listar", {
        titulo: "Proveedores - TodoStock S.A.",
        proveedores,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Error al listar proveedores");
    }
  },

  formCrear: (req, res) => {
    res.render("proveedores/crear", {
      titulo: "Registrar Nuevo Proveedor",
      error: null,
      datos: null,
    });
  },

  almacenar: async (req, res) => {
    try {
      await Proveedor.create({
        tipoDoc: req.body.tipoDoc,
        nroDoc: req.body.nroDoc,
        nombre: req.body.tipoDoc === "DNI" ? req.body.nombre : null,
        email: req.body.email,
        telefono: req.body.telefono,
        direccion: req.body.direccion,
        razonSocial: req.body.tipoDoc === "CUIT" ? req.body.razonSocial : null,
        saldoCuentaCorriente: parseFloat(req.body.saldoCuentaCorriente) || 0,
      });
      res.redirect("/proveedores/listar");
    } catch (error) {
      res.render("proveedores/crear", {
        titulo: "Registrar Nuevo Proveedor",
        error: error.message,
        datos: req.body,
      });
    }
  },

  formEditar: async (req, res) => {
    try {
      const proveedor = await Proveedor.findById(req.params.id);
      if (!proveedor) {
        return res.status(404).send("Proveedor no encontrado");
      }
      res.render("proveedores/editar", {
        titulo: "Editar Proveedor",
        proveedor,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Error al buscar proveedor");
    }
  },

  actualizar: async (req, res) => {
    try {
      await Proveedor.findByIdAndUpdate(
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
      res.redirect("/proveedores/listar");
    } catch (error) {
      console.error(error);
      res.status(500).send("Error al actualizar proveedor");
    }
  },

  eliminar: async (req, res) => {
    try {
      await Proveedor.findByIdAndDelete(req.params.id);
      res.redirect("/proveedores/listar");
    } catch (error) {
      console.error(error);
      res.status(500).send("Error al eliminar proveedor");
    }
  },
};

module.exports = proveedorController;
