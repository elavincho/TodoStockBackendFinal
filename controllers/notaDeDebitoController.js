const NotaDeDebito = require("../models/NotaDeDebito");
const Cliente = require("../models/Cliente");
const FacturaCliente = require("../models/FacturaCliente");
const mongoose = require('mongoose');

const notaDeDebitoController = {
  // Listar todas las notas
  index: async (req, res) => {
    try {
      const notas = await NotaDeDebito.find().sort({ createdAt: -1 });
      res.render("notas-debito/index", {
        titulo: "Notas de Débito - TodoStock S.A.",
        notas: notas,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Error al listar notas de débito");
    }
  },

  // Formulario de creación
  formCrear: async (req, res) => {
    try {
      const clientes = await Cliente.find().sort({ createdAt: 1 });
      const facturas = await FacturaCliente.find({
        estatus: { $in: ["Pendiente", "Pagada"] },
      })
        .populate('clienteId', 'nombre email razonSocial nroDoc')  // ← Agregar populate
        .sort({ createdAt: -1 });

      res.render("notas-debito/crear", {
        titulo: "Nueva Nota de Débito",
        clientes: clientes,
        facturas: facturas,
        error: null,
        datos: null,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Error al cargar formulario");
    }
  },

  // Guardar nueva nota
  almacenar: async (req, res) => {
    try {
      const {
        clienteId,
        puntoVenta,
        numero,
        fechaEmision,
        fechaVencimiento,
        conceptos,
        otrosTributos,
        observaciones,
        cae,
        fechaVtoCAE,
        facturaOrigenId,
        facturaOrigenNumero,
      } = req.body;

      // Obtener datos del cliente
      if (!mongoose.Types.ObjectId.isValid(clienteId)) {
        throw new Error("ID de cliente inválido");
      }
      const cliente = await Cliente.findById(clienteId);
      if (!cliente) {
        throw new Error("Cliente no encontrado");
      }

      // Validar que haya al menos un concepto
      if (
        !conceptos ||
        !conceptos.descripcion ||
        conceptos.descripcion.length === 0
      ) {
        throw new Error("Debe agregar al menos un concepto");
      }

      // Calcular totales generales
      let subtotalNeto = 0;
      let iva21Total = 0;
      let iva105Total = 0;
      const conceptosArray = [];

      const numConceptos = conceptos.descripcion.length;
      for (let i = 0; i < numConceptos; i++) {
        const descripcion = conceptos.descripcion[i];
        const precioUnitario = parseFloat(conceptos.precioUnitario[i]) || 0;
        const alicIva = conceptos.alicIva[i] || "21%";

        let ivaMonto = 0;
        if (alicIva === "21%") {
          ivaMonto = precioUnitario * 0.21;
          iva21Total += ivaMonto;
        } else if (alicIva === "10.5%") {
          ivaMonto = precioUnitario * 0.105;
          iva105Total += ivaMonto;
        }

        subtotalNeto += precioUnitario;

        conceptosArray.push({
          descripcion: descripcion,
          precioUnitario: precioUnitario,
          alicIva: alicIva,
          importe: precioUnitario,
        });
      }

      const total =
        subtotalNeto +
        iva21Total +
        iva105Total +
        (parseFloat(otrosTributos) || 0);

      // Formatear número de nota
      const numeroCompleto = `${String(puntoVenta || 1).padStart(4, "0")}-${String(numero).padStart(8, "0")}`;

      // Guardar la nota (solo guardamos un concepto combinado o el primero?)
      // Para simplificar, guardamos el primer concepto como principal y los demás en un array
      const nota = new NotaDeDebito({
        numero: numeroCompleto,
        puntoVenta: parseInt(puntoVenta) || 1,
        clienteId: clienteId,
        clienteInfo: {
          cuit: cliente.nroDoc,
          razonSocial:
            cliente.tipoDoc === "DNI" ? cliente.nombre : cliente.razonSocial,
          localidad: cliente.direccion?.split(",")[0] || "",
          provincia: "",
          telefono: cliente.telefono,
          direccion: cliente.direccion,
        },
        fechaEmision: new Date(fechaEmision),
        fechaVencimiento: fechaVencimiento ? new Date(fechaVencimiento) : null,
        concepto: {
          descripcion:
            conceptosArray.length === 1
              ? conceptosArray[0].descripcion
              : `${conceptosArray.length} conceptos - Total: $${subtotalNeto.toFixed(2)}`,
          precioUnitario: subtotalNeto,
          alicIva: "21%",
          importe: subtotalNeto,
        },
        conceptosDetalle: conceptosArray, // Guardar todos los conceptos
        subtotalNeto: subtotalNeto,
        iva21: iva21Total,
        iva105: iva105Total,
        otrosTributos: parseFloat(otrosTributos) || 0,
        total: total,
        observaciones: observaciones,
        cae: cae,
        fechaVtoCAE: fechaVtoCAE ? new Date(fechaVtoCAE) : null,
        estatus: "Pendiente",
        facturaOrigenId: facturaOrigenId || null,
        facturaOrigenNumero: facturaOrigenNumero || null,
      });

      await nota.save();

      // Actualizar saldo del cliente (aumentar deuda)
      let saldoActual = parseFloat(cliente.saldoCuentaCorriente) || 0;
      cliente.saldoCuentaCorriente = saldoActual + total;
      await cliente.save();

      req.session.mensajeExito = "Nota de débito guardada exitosamente";
      res.redirect("/notas-debito");
    } catch (error) {
      console.error(error);
      const clientes = await Cliente.find().sort({ createdAt: 1 });
      const facturas = await FacturaCliente.find({
        estatus: { $in: ["Pendiente", "Pagada"] },
      })
        .populate('clienteId', 'nombre email razonSocial nroDoc')  // Trae estos campos
        .sort({ createdAt: -1 });

      res.render("notas-debito/crear", {
        titulo: "Nueva Nota de Débito",
        clientes: clientes,
        facturas: facturas,
        error: error.message,
        datos: req.body,
      });
    }
  },

  // Ver detalle
  ver: async (req, res) => {
    try {
      const nota = await NotaDeDebito.findById(req.params.id);
      if (!nota) {
        return res.status(404).send("Nota de débito no encontrada");
      }

      // Asegurar que empresaInfo tenga todos los campos necesarios
      if (!nota.empresaInfo) {
        nota.empresaInfo = {
          cuit: "30-12345678-1",
          razonSocial: "TodoStock S.A.",
          direccion: "Av. Libertador 1000 - Avellaneda",
          localidad: "Buenos Aires",
          telefono: "+54 11 2222 3333",
          ingBrutos: "123456789",
          inicioActividades: new Date("2020-01-01"),
        };
      }

      // Asegurar que conceptosDetalle existe
      if (!nota.conceptosDetalle) {
        nota.conceptosDetalle = [];
      }

      res.render("notas-debito/ver", {
        titulo: `Nota de Débito ${nota.numero}`,
        nota: nota,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Error al mostrar nota de débito");
    }
  },

  // Aplicar nota (cambiar estatus)
  aplicar: async (req, res) => {
    try {
      const nota = await NotaDeDebito.findById(req.params.id);
      if (nota && nota.estatus !== "Aplicada" && nota.estatus !== "Anulada") {
        nota.estatus = "Aplicada";
        await nota.save();
        req.session.mensajeExito = "Nota de débito aplicada exitosamente";
      }
      res.redirect("/notas-debito");
    } catch (error) {
      console.error(error);
      res.status(500).send("Error al aplicar nota de débito");
    }
  },

  // Anular nota
  anular: async (req, res) => {
    try {
      const nota = await NotaDeDebito.findById(req.params.id);

      if (nota && nota.estatus !== "Anulada") {
        // Revertir saldo del cliente si estaba aplicada
        if (nota.estatus === "Aplicada") {
          const cliente = await Cliente.findById(req.params.id);
          if (cliente) {
            let saldoActual = parseFloat(cliente.saldoCuentaCorriente) || 0;
            cliente.saldoCuentaCorriente = saldoActual - nota.total;
            await cliente.save();
          }
        }

        nota.estatus = "Anulada";
        await nota.save();
      }

      res.redirect("/notas-debito");
    } catch (error) {
      console.error(error);
      res.status(500).send("Error al anular nota de débito");
    }
  },

  // Eliminar nota
  eliminar: async (req, res) => {
    try {
      const nota = await NotaDeDebito.findById(req.params.id);

      // Revertir saldo del cliente si estaba aplicada
      if (nota && nota.estatus === "Aplicada") {
        const cliente = await Cliente.findById(nota.clienteId);
        if (cliente) {
          let saldoActual = parseFloat(cliente.saldoCuentaCorriente) || 0;
          cliente.saldoCuentaCorriente = saldoActual - nota.total;
          await cliente.save();
        }
      }

      await NotaDeDebito.findByIdAndDelete(req.params.id);
      res.redirect("/notas-debito");
    } catch (error) {
      console.error(error);
      res.status(500).send("Error al eliminar nota de débito");
    }
  },
};

module.exports = notaDeDebitoController;
