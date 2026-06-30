const FacturaCliente = require("../models/FacturaCliente");
const FacturaProveedor = require("../models/FacturaProveedor");
const OrdenPago = require("../models/OrdenPago");
const Presupuesto = require("../models/Presupuesto");
const NotaDeCredito = require("../models/NotaDeCredito");
const NotaDeDebito = require("../models/NotaDeDebito");
const ReciboCobro = require("../models/ReciboCobro");
const Cliente = require("../models/Cliente");
const Proveedor = require("../models/Proveedor");
const mongoose = require("mongoose");

const finanzasController = {
  // Dashboard principal con estadísticas
  resumen: async (req, res) => {
    try {
      // Estadísticas de documentos
      const facturasClientesPendientes = await FacturaCliente.countDocuments({ estatus: "Pendiente" });
      const facturasProveedoresPendientes = await FacturaProveedor.countDocuments({ estatus: "Pendiente" });
      const ordenesPagoPendientes = await OrdenPago.countDocuments({ estatus: "Pendiente" });
      const presupuestosVigentes = await Presupuesto.countDocuments({
        estatus: "Pendiente",
        fechaValidez: { $gte: new Date() }
      });

      // --- CÁLCULO TOTAL POR COBRAR ---
      // Facturas de clientes pendientes (lo que nos deben)
      const facturasClientesPendientesData = await FacturaCliente.find({ estatus: "Pendiente" });
      const sumaFacturasClientes = facturasClientesPendientesData.reduce((sum, f) => sum + (f.total || 0), 0);

      // Notas de crédito pendientes (descuento a favor del cliente, resta lo que nos deben)
      const notasCreditoPendientes = await NotaDeCredito.find({ estatus: "Pendiente" });
      const sumaNotasCredito = notasCreditoPendientes.reduce((sum, nc) => sum + (nc.total || 0), 0);

      // Notas de débito pendientes (cargo extra al cliente, suma lo que nos deben)
      const notasDebitoPendientes = await NotaDeDebito.find({ estatus: "Pendiente" });
      const sumaNotasDebito = notasDebitoPendientes.reduce((sum, nd) => sum + (nd.total || 0), 0);

      // Total por cobrar = facturas - notas de crédito + notas de débito
      const totalPorCobrar = sumaFacturasClientes - sumaNotasCredito + sumaNotasDebito;

      // --- CÁLCULO TOTAL POR PAGAR ---
      const facturasProveedoresPendientesData = await FacturaProveedor.find({ estatus: "Pendiente" });
      const totalPorPagar = facturasProveedoresPendientesData.reduce((sum, f) => sum + (f.total || 0), 0);

      // --- ÚLTIMOS MOVIMIENTOS (incluye facturas, notas de crédito y notas de débito) ---
      const ultimosMovimientos = [];

      // Facturas clientes (últimas 3)
      const ultFactClientes = await FacturaCliente.find()
        .populate('clienteId', 'nombre razonSocial tipoDoc')
        .sort({ createdAt: -1 })
        .limit(3);

      ultFactClientes.forEach(f => {
        const clienteNombre = f.clienteId
          ? (f.clienteId.tipoDoc === 'DNI' ? f.clienteId.nombre : f.clienteId.razonSocial)
          : f.clienteInfo?.razonSocial || 'Cliente desconocido';

        ultimosMovimientos.push({
          tipo: 'Factura Cliente',
          numero: f.numero,
          entidad: clienteNombre,
          fecha: f.fechaEmision || f.createdAt,
          monto: f.total,
          estatus: f.estatus,
          link: `/facturas-cliente/ver/${f._id}`
        });
      });

      // Facturas proveedores (últimas 3)
      const ultFactProveedores = await FacturaProveedor.find()
        .populate('proveedorId', 'nombre razonSocial tipoDoc')
        .sort({ createdAt: -1 })
        .limit(3);

      ultFactProveedores.forEach(f => {
        const proveedorNombre = f.proveedorId
          ? (f.proveedorId.tipoDoc === 'DNI' ? f.proveedorId.nombre : f.proveedorId.razonSocial)
          : f.proveedorInfo?.razonSocial || 'Proveedor desconocido';

        ultimosMovimientos.push({
          tipo: 'Factura Proveedor',
          numero: f.numero,
          entidad: proveedorNombre,
          fecha: f.fechaEmision || f.createdAt,
          monto: f.total,
          estatus: f.estatus,
          link: `/facturas-proveedor/ver/${f._id}`
        });
      });

      // Notas de crédito (últimas 3)
      const ultNotasCredito = await NotaDeCredito.find()
        .populate('clienteId', 'nombre razonSocial tipoDoc')
        .sort({ createdAt: -1 })
        .limit(3);

      ultNotasCredito.forEach(nc => {
        const clienteNombre = nc.clienteId
          ? (nc.clienteId.tipoDoc === 'DNI' ? nc.clienteId.nombre : nc.clienteId.razonSocial)
          : nc.clienteInfo?.razonSocial || 'Cliente desconocido';

        ultimosMovimientos.push({
          tipo: 'Nota de Crédito',
          numero: nc.numero,
          entidad: clienteNombre,
          fecha: nc.fechaEmision || nc.createdAt,
          monto: nc.total,
          estatus: nc.estatus,
          link: `/notas-credito/ver/${nc._id}`
        });
      });

      // Notas de débito (últimas 3)
      const ultNotasDebito = await NotaDeDebito.find()
        .populate('clienteId', 'nombre razonSocial tipoDoc')
        .sort({ createdAt: -1 })
        .limit(3);

      ultNotasDebito.forEach(nd => {
        const clienteNombre = nd.clienteId
          ? (nd.clienteId.tipoDoc === 'DNI' ? nd.clienteId.nombre : nd.clienteId.razonSocial)
          : nd.clienteInfo?.razonSocial || 'Cliente desconocido';

        ultimosMovimientos.push({
          tipo: 'Nota de Débito',
          numero: nd.numero,
          entidad: clienteNombre,
          fecha: nd.fechaEmision || nd.createdAt,
          monto: nd.total,
          estatus: nd.estatus,
          link: `/notas-debito/ver/${nd._id}`
        });
      });

      // Ordenar todos por fecha descendente y tomar los 10 más recientes
      ultimosMovimientos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

      const balanceNeto = totalPorCobrar - totalPorPagar;

      res.render("finanzas/index", {
        titulo: "Resumen Financiero - TodoStock S.A.",
        estadisticas: {
          facturasClientesPendientes,
          facturasProveedoresPendientes,
          ordenesPagoPendientes,
          presupuestosVigentes,
          totalPorCobrar: Math.round(totalPorCobrar * 100) / 100,
          totalPorPagar: Math.round(totalPorPagar * 100) / 100,
          balanceNeto: Math.round(balanceNeto * 100) / 100,
          notasCreditoPendientes: notasCreditoPendientes.length,
          notasDebitoPendientes: notasDebitoPendientes.length
        },
        ultimosMovimientos: ultimosMovimientos.slice(0, 10)
      });
    } catch (error) {
      console.error('Error en resumen financiero:', error);
      res.render("finanzas/index", {
        titulo: "Resumen Financiero - TodoStock S.A.",
        error: "Error al generar el resumen financiero: " + error.message,
        estadisticas: {
          facturasClientesPendientes: 0,
          facturasProveedoresPendientes: 0,
          ordenesPagoPendientes: 0,
          presupuestosVigentes: 0,
          totalPorCobrar: 0,
          totalPorPagar: 0,
          balanceNeto: 0,
          notasCreditoPendientes: 0,
          notasDebitoPendientes: 0
        },
        ultimosMovimientos: []
      });
    }
  },

  // Cuentas por cobrar (facturas de clientes pendientes)
  cuentasPorCobrar: async (req, res) => {
    try {
      const { fechaDesde, fechaHasta, clienteId, tipoDoc } = req.query;

      // Traer todos los clientes para el select
      const todosLosClientes = await Cliente.find().sort({ razonSocial: 1, nombre: 1 });

      // Filtro de fechas
      let filtroFecha = {};
      if (fechaDesde || fechaHasta) {
        filtroFecha.fechaEmision = {};
        if (fechaDesde) {
          const desde = new Date(fechaDesde);
          desde.setHours(0, 0, 0, 0);
          filtroFecha.fechaEmision.$gte = desde;
        }
        if (fechaHasta) {
          const hasta = new Date(fechaHasta);
          hasta.setHours(23, 59, 59, 999);
          filtroFecha.fechaEmision.$lte = hasta;
        }
      }

      // Filtro por cliente seleccionado
      let filtroCliente = {};
      if (clienteId && clienteId !== 'todos') {
        filtroCliente.clienteId = clienteId;
      }

      // Determinar qué tipos de documentos mostrar
      const mostrarFacturas = !tipoDoc || tipoDoc === 'todos' || tipoDoc === 'factura';
      const mostrarNC = !tipoDoc || tipoDoc === 'todos' || tipoDoc === 'credito';
      const mostrarND = !tipoDoc || tipoDoc === 'todos' || tipoDoc === 'debito';

      // Facturas pendientes
      let facturas = [];
      if (mostrarFacturas) {
        const filtroFacturas = { estatus: "Pendiente", ...filtroFecha, ...filtroCliente };
        facturas = await FacturaCliente.find(filtroFacturas)
          .populate('clienteId', 'nombre razonSocial tipoDoc nroDoc')
          .sort({ fechaVencimiento: 1 });
      }

      // Notas de crédito pendientes
      let notasCredito = [];
      if (mostrarNC) {
        const filtroNC = { estatus: "Pendiente", ...filtroFecha, ...filtroCliente };
        notasCredito = await NotaDeCredito.find(filtroNC)
          .populate('clienteId', 'nombre razonSocial tipoDoc nroDoc');
      }

      // Notas de débito pendientes
      let notasDebito = [];
      if (mostrarND) {
        const filtroND = { estatus: "Pendiente", ...filtroFecha, ...filtroCliente };
        notasDebito = await NotaDeDebito.find(filtroND)
          .populate('clienteId', 'nombre razonSocial tipoDoc nroDoc');
      }

      // Agrupar por cliente
      const clientesMap = {};

      facturas.forEach(f => {
        const clienteKey = f.clienteId ? f.clienteId._id.toString() : 'desconocido';
        if (!clientesMap[clienteKey]) {
          const nombre = f.clienteId
            ? (f.clienteId.tipoDoc === 'DNI' ? f.clienteId.nombre : f.clienteId.razonSocial)
            : f.clienteInfo?.razonSocial || 'Cliente desconocido';
          const doc = f.clienteId ? f.clienteId.nroDoc : f.clienteInfo?.cuit || 'N/A';
          clientesMap[clienteKey] = {
            clienteId: clienteKey,
            nombre,
            documento: doc,
            facturas: [],
            notasCredito: [],
            notasDebito: [],
            totalFacturas: 0,
            totalNC: 0,
            totalND: 0,
            saldoNeto: 0
          };
        }
        clientesMap[clienteKey].facturas.push(f);
        clientesMap[clienteKey].totalFacturas += (f.total || 0);
      });

      notasCredito.forEach(nc => {
        const clienteKey = nc.clienteId ? nc.clienteId._id.toString() : 'desconocido';
        if (!clientesMap[clienteKey]) {
          const nombre = nc.clienteId
            ? (nc.clienteId.tipoDoc === 'DNI' ? nc.clienteId.nombre : nc.clienteId.razonSocial)
            : nc.clienteInfo?.razonSocial || 'Cliente desconocido';
          const doc = nc.clienteId ? nc.clienteId.nroDoc : nc.clienteInfo?.cuit || 'N/A';
          clientesMap[clienteKey] = {
            clienteId: clienteKey,
            nombre,
            documento: doc,
            facturas: [],
            notasCredito: [],
            notasDebito: [],
            totalFacturas: 0,
            totalNC: 0,
            totalND: 0,
            saldoNeto: 0
          };
        }
        clientesMap[clienteKey].notasCredito.push(nc);
        clientesMap[clienteKey].totalNC += (nc.total || 0);
      });

      notasDebito.forEach(nd => {
        const clienteKey = nd.clienteId ? nd.clienteId._id.toString() : 'desconocido';
        if (!clientesMap[clienteKey]) {
          const nombre = nd.clienteId
            ? (nd.clienteId.tipoDoc === 'DNI' ? nd.clienteId.nombre : nd.clienteId.razonSocial)
            : nd.clienteInfo?.razonSocial || 'Cliente desconocido';
          const doc = nd.clienteId ? nd.clienteId.nroDoc : nd.clienteInfo?.cuit || 'N/A';
          clientesMap[clienteKey] = {
            clienteId: clienteKey,
            nombre,
            documento: doc,
            facturas: [],
            notasCredito: [],
            notasDebito: [],
            totalFacturas: 0,
            totalNC: 0,
            totalND: 0,
            saldoNeto: 0
          };
        }
        clientesMap[clienteKey].notasDebito.push(nd);
        clientesMap[clienteKey].totalND += (nd.total || 0);
      });

      // Calcular saldo neto por cliente
      Object.values(clientesMap).forEach(cliente => {
        cliente.saldoNeto = Math.round((cliente.totalFacturas - cliente.totalNC + cliente.totalND) * 100) / 100;
        cliente.totalFacturas = Math.round(cliente.totalFacturas * 100) / 100;
        cliente.totalNC = Math.round(cliente.totalNC * 100) / 100;
        cliente.totalND = Math.round(cliente.totalND * 100) / 100;
      });

      // Convertir a array y ordenar por saldo descendente
      const clientes = Object.values(clientesMap).sort((a, b) => b.saldoNeto - a.saldoNeto);

      // Totales generales
      const sumaFacturas = clientes.reduce((sum, c) => sum + c.totalFacturas, 0);
      const totalNotasCredito = clientes.reduce((sum, c) => sum + c.totalNC, 0);
      const totalNotasDebito = clientes.reduce((sum, c) => sum + c.totalND, 0);
      const total = sumaFacturas - totalNotasCredito + totalNotasDebito;

      res.render("finanzas/cuentas-cobrar", {
        titulo: "Cuentas por Cobrar - TodoStock S.A.",
        clientes,
        todosLosClientes,
        total: Math.round(total * 100) / 100,
        sumaFacturas: Math.round(sumaFacturas * 100) / 100,
        totalNotasCredito: Math.round(totalNotasCredito * 100) / 100,
        totalNotasDebito: Math.round(totalNotasDebito * 100) / 100,
        filtros: { fechaDesde, fechaHasta, clienteId, tipoDoc }
      });
    } catch (error) {
      console.error('Error en cuentas por cobrar:', error);
      res.render("finanzas/cuentas-cobrar", {
        titulo: "Cuentas por Cobrar - TodoStock S.A.",
        error: "Error al cargar cuentas por cobrar: " + error.message,
        clientes: [],
        todosLosClientes: [],
        total: 0,
        sumaFacturas: 0,
        totalNotasCredito: 0,
        totalNotasDebito: 0,
        filtros: {}
      });
    }
  },

  // Cuentas por pagar (facturas de proveedores pendientes)
  cuentasPorPagar: async (req, res) => {
    try {
      const { fechaDesde, fechaHasta, proveedorId, tipoDoc } = req.query;

      // Traer todos los proveedores para el select
      const todosLosProveedores = await Proveedor.find().sort({ razonSocial: 1, nombre: 1 });

      // Mostrar únicamente facturas pendientes
      let filtro = {
        estatus: "Pendiente"
      };

      if (fechaDesde || fechaHasta) {
        filtro.fechaEmision = {};
        if (fechaDesde) {
          const desde = new Date(fechaDesde);
          desde.setHours(0, 0, 0, 0);
          filtro.fechaEmision.$gte = desde;
        }
        if (fechaHasta) {
          const hasta = new Date(fechaHasta);
          hasta.setHours(23, 59, 59, 999);
          filtro.fechaEmision.$lte = hasta;
        }
      }

      // Filtro por proveedor seleccionado
      if (proveedorId && proveedorId !== 'todos') {
        filtro.proveedorId = proveedorId;
      }

      // Determinar qué tipos de documentos mostrar
      const mostrarFacturas = !tipoDoc || tipoDoc === 'todos' || tipoDoc === 'factura';
      const mostrarOrdenes = !tipoDoc || tipoDoc === 'todos' || tipoDoc === 'orden';

      let facturas = [];
      if (mostrarFacturas) {
        facturas = await FacturaProveedor.find(filtro)
          .populate('proveedorId', 'nombre razonSocial tipoDoc nroDoc')
          .sort({ fechaVencimiento: 1 });
      }

      // Órdenes de pago pendientes
      let ordenes = [];
      if (mostrarOrdenes) {
        let filtroOrden = { estatus: "Pendiente" };
        if (proveedorId && proveedorId !== 'todos') filtroOrden.proveedorId = proveedorId;
        if (fechaDesde || fechaHasta) {
          filtroOrden.fechaEmision = {};
          if (fechaDesde) {
            const desde = new Date(fechaDesde);
            desde.setHours(0, 0, 0, 0);
            filtroOrden.fechaEmision.$gte = desde;
          }
          if (fechaHasta) {
            const hasta = new Date(fechaHasta);
            hasta.setHours(23, 59, 59, 999);
            filtroOrden.fechaEmision.$lte = hasta;
          }
        }
        ordenes = await OrdenPago.find(filtroOrden)
          .populate('proveedorId', 'nombre razonSocial tipoDoc nroDoc')
          .sort({ fechaEmision: -1 });
      }

      const totalFacturas = facturas.reduce((sum, f) => sum + (f.total || 0), 0);
      const totalOrdenes = ordenes.reduce((sum, o) => sum + (o.montoAPagar || 0), 0);
      const total = totalFacturas;

      res.render("finanzas/cuentas-pagar", {
        titulo: "Cuentas por Pagar - TodoStock S.A.",
        facturas,
        ordenes,
        todosLosProveedores,
        total: Math.round(total * 100) / 100,
        totalOrdenes: Math.round(totalOrdenes * 100) / 100,
        filtros: { fechaDesde, fechaHasta, proveedorId, tipoDoc }
      });
    } catch (error) {
      console.error('Error en cuentas por pagar:', error);
      res.render("finanzas/cuentas-pagar", {
        titulo: "Cuentas por Pagar - TodoStock S.A.",
        error: "Error al cargar cuentas por pagar: " + error.message,
        facturas: [],
        ordenes: [],
        todosLosProveedores: [],
        total: 0,
        totalOrdenes: 0,
        filtros: {}
      });
    }
  },

  // ==================== COBRAR A CLIENTE ====================

  // Formulario para cobrar
  formCobrar: async (req, res) => {
    try {
      const clientes = await Cliente.find().sort({ razonSocial: 1, nombre: 1 });
      res.render("finanzas/cobrar-multiple", {
        titulo: "Cobrar a Cliente - TodoStock S.A.",
        clientes,
        error: null,
        datos: null,
        preselectedClienteId: req.query.clienteId || null,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Error al cargar formulario de cobro");
    }
  },

  // API: Obtener todos los documentos pendientes de un cliente
  getDocumentosCliente: async (req, res) => {
    try {
      const clienteId = req.params.clienteId;
      if (!mongoose.Types.ObjectId.isValid(clienteId)) {
        return res.json({ success: false, error: "ID de cliente inválido" });
      }

      // Facturas pendientes (suman)
      const facturas = await FacturaCliente.find({
        clienteId,
        estatus: "Pendiente",
      }).sort({ fechaEmision: 1 });

      // Notas de crédito pendientes (restan)
      const notasCredito = await NotaDeCredito.find({
        clienteId,
        estatus: "Pendiente",
      }).sort({ fechaEmision: 1 });

      // Notas de débito pendientes (suman)
      const notasDebito = await NotaDeDebito.find({
        clienteId,
        estatus: "Pendiente",
      }).sort({ fechaEmision: 1 });

      const documentos = [];

      facturas.forEach((f) => {
        documentos.push({
          id: f._id,
          tipo: "factura",
          numero: f.numero,
          fechaEmision: f.fechaEmision,
          total: f.total,
          signo: "+",
        });
      });

      notasCredito.forEach((nc) => {
        documentos.push({
          id: nc._id,
          tipo: "nota_credito",
          numero: nc.numero,
          fechaEmision: nc.fechaEmision,
          total: nc.total,
          signo: "-",
        });
      });

      notasDebito.forEach((nd) => {
        documentos.push({
          id: nd._id,
          tipo: "nota_debito",
          numero: nd.numero,
          fechaEmision: nd.fechaEmision,
          total: nd.total,
          signo: "+",
        });
      });

      res.json({ success: true, documentos });
    } catch (error) {
      console.error(error);
      res.json({ success: false, error: error.message });
    }
  },

  // Procesar cobro múltiple
  procesarCobro: async (req, res) => {
    try {
      const {
        clienteId,
        formaPago,
        referencia,
        bancoCuenta,
        fechaCobro,
        documentosSeleccionados,
        observaciones,
        recibidoPor,
        montoCobrado,
      } = req.body;

      if (!mongoose.Types.ObjectId.isValid(clienteId)) {
        throw new Error("ID de cliente inválido");
      }

      const cliente = await Cliente.findById(clienteId);
      if (!cliente) throw new Error("Cliente no encontrado");

      // Parsear documentos seleccionados (formato: "tipo:id")
      let docsIds = [];
      if (documentosSeleccionados) {
        docsIds = Array.isArray(documentosSeleccionados) ? documentosSeleccionados : [documentosSeleccionados];
      }

      if (docsIds.length === 0) {
        throw new Error("Debe seleccionar al menos un documento");
      }

      let totalFacturas = 0;
      let totalNC = 0;
      let totalND = 0;
      const facturasDetalles = [];
      const ncDetalles = [];
      const ndDetalles = [];

      for (const docRef of docsIds) {
        const [tipo, id] = docRef.split(":");

        if (tipo === "factura") {
          const factura = await FacturaCliente.findById(id);
          if (factura && factura.estatus === "Pendiente") {
            totalFacturas += factura.total;
            facturasDetalles.push({
              facturaId: factura._id,
              numero: factura.numero,
              fecha: factura.fechaEmision,
              total: factura.total,
            });
          }
        } else if (tipo === "nota_credito") {
          const nc = await NotaDeCredito.findById(id);
          if (nc && nc.estatus === "Pendiente") {
            totalNC += nc.total;
            ncDetalles.push({ id: nc._id, numero: nc.numero, total: nc.total });
          }
        } else if (tipo === "nota_debito") {
          const nd = await NotaDeDebito.findById(id);
          if (nd && nd.estatus === "Pendiente") {
            totalND += nd.total;
            ndDetalles.push({ id: nd._id, numero: nd.numero, total: nd.total });
          }
        }
      }

      // Total neto = facturas - NC + ND
      const totalNeto = totalFacturas - totalNC + totalND;
      const montoFinal = parseFloat(montoCobrado) || totalNeto;

      // Crear recibo de cobro
      const recibo = new ReciboCobro({
        clienteId,
        clienteInfo: {
          cuit: cliente.nroDoc,
          nombre: cliente.tipoDoc === "DNI" ? cliente.nombre : cliente.razonSocial,
          direccion: cliente.direccion,
          telefono: cliente.telefono,
        },
        fechaEmision: new Date(),
        estatus: "Emitido",
        facturasCobradas: facturasDetalles,
        formasPago: [
          {
            formaPago,
            referencia,
            bancoCuenta,
            fecha: new Date(fechaCobro),
            montoNeto: montoFinal,
          },
        ],
        montoCobrado: montoFinal,
        observaciones: `${observaciones || ""}\n--- Detalle del cobro ---\nFacturas: $${totalFacturas.toFixed(2)}\nNotas de Crédito (desc.): -$${totalNC.toFixed(2)}\nNotas de Débito (cargos): +$${totalND.toFixed(2)}\nTotal Neto Cobrado: $${montoFinal.toFixed(2)}`.trim(),
        recibidoPor,
      });

      await recibo.save();

      // Marcar facturas como pagadas
      for (const det of facturasDetalles) {
        await FacturaCliente.findByIdAndUpdate(det.facturaId, {
          estatus: "Pagada",
          cobranzaId: recibo.numero,
          fechaCobro: new Date(fechaCobro),
        });
      }

      // Marcar NC como aplicadas
      for (const nc of ncDetalles) {
        await NotaDeCredito.findByIdAndUpdate(nc.id, { estatus: "Aplicada" });
      }

      // Marcar ND como aplicadas
      for (const nd of ndDetalles) {
        await NotaDeDebito.findByIdAndUpdate(nd.id, { estatus: "Aplicada" });
      }

      // Actualizar saldo del cliente
      let saldoActual = parseFloat(cliente.saldoCuentaCorriente) || 0;
      cliente.saldoCuentaCorriente = saldoActual - montoFinal;
      await cliente.save();

      res.redirect(`/recibos-cobro/ver/${recibo.numero}`);
    } catch (error) {
      console.error(error);
      try {
        const clientes = await Cliente.find().sort({ razonSocial: 1, nombre: 1 });
        res.render("finanzas/cobrar-multiple", {
          titulo: "Cobrar a Cliente - TodoStock S.A.",
          clientes,
          error: error.message,
          datos: req.body,
        });
      } catch (err) {
        res.status(500).send("Error al procesar cobro");
      }
    }
  },

  // ==================== PAGAR A PROVEEDOR ====================

  // Formulario para pagar
  formPagar: async (req, res) => {
    try {
      const proveedores = await Proveedor.find().sort({ razonSocial: 1, nombre: 1 });
      res.render("finanzas/pagar-multiple", {
        titulo: "Pagar a Proveedor - TodoStock S.A.",
        proveedores,
        error: null,
        datos: null,
        preselectedProveedorId: req.query.proveedorId || null,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Error al cargar formulario de pago");
    }
  },

  // API: Obtener documentos pendientes de un proveedor
  getDocumentosProveedor: async (req, res) => {
    try {
      const proveedorId = req.params.proveedorId;
      if (!mongoose.Types.ObjectId.isValid(proveedorId)) {
        return res.json({ success: false, error: "ID de proveedor inválido" });
      }

      // Facturas pendientes del proveedor (suman - lo que debemos)
      const facturas = await FacturaProveedor.find({
        proveedorId,
        estatus: "Pendiente",
      }).sort({ fechaEmision: 1 });

      const documentos = facturas.map((f) => ({
        id: f._id,
        tipo: "factura",
        numero: f.numero,
        fechaEmision: f.fechaEmision,
        total: f.total,
        signo: "+",
      }));

      res.json({ success: true, documentos });
    } catch (error) {
      console.error(error);
      res.json({ success: false, error: error.message });
    }
  },

  // Procesar pago múltiple a proveedor
  procesarPago: async (req, res) => {
    try {
      const {
        proveedorId,
        formaPago,
        referencia,
        bancoCuenta,
        fechaPago,
        documentosSeleccionados,
        observaciones,
        elaboradoPor,
        montoAPagar,
      } = req.body;

      if (!mongoose.Types.ObjectId.isValid(proveedorId)) {
        throw new Error("ID de proveedor inválido");
      }

      const proveedor = await Proveedor.findById(proveedorId);
      if (!proveedor) throw new Error("Proveedor no encontrado");

      let docsIds = [];
      if (documentosSeleccionados) {
        docsIds = Array.isArray(documentosSeleccionados) ? documentosSeleccionados : [documentosSeleccionados];
      }

      if (docsIds.length === 0) {
        throw new Error("Debe seleccionar al menos una factura");
      }

      let totalPago = 0;
      const facturasDetalles = [];
      const facturasIds = [];

      for (const docRef of docsIds) {
        const [tipo, id] = docRef.split(":");

        if (tipo === "factura") {
          const factura = await FacturaProveedor.findById(id);
          if (factura && factura.estatus === "Pendiente") {
            totalPago += factura.total;
            facturasDetalles.push({
              facturaId: factura._id,
              numero: factura.numero,
              fecha: factura.fechaEmision,
              total: factura.total,
            });
            facturasIds.push(factura._id);
          }
        }
      }

      const montoFinal = parseFloat(montoAPagar) || totalPago;

      // Crear conceptos
      const conceptosArray = facturasDetalles.map((f) => ({
        codigoConcepto: "FACT",
        descripcion: `Pago Factura ${f.numero}`,
        debe: 0,
        haber: f.total,
        impuesto: "EXE",
        montoImpuesto: 0,
        netoRenglon: f.total,
      }));

      const subtotalHaber = conceptosArray.reduce((sum, c) => sum + c.haber, 0);

      // Crear orden de pago
      const orden = new OrdenPago({
        proveedorId,
        proveedorInfo: {
          rif: proveedor.nroDoc,
          nombre: proveedor.tipoDoc === "DNI" ? proveedor.nombre : proveedor.razonSocial,
          direccion: proveedor.direccion,
          telefono: proveedor.telefono,
        },
        fechaEmision: new Date(),
        estatus: "Pagado",
        conceptos: conceptosArray,
        formasPago: [
          {
            formaPago,
            referencia,
            bancoCuenta,
            fecha: new Date(fechaPago),
            montoNeto: montoFinal,
          },
        ],
        subtotalDebe: 0,
        subtotalHaber,
        subtotalImpuesto: 0,
        subtotalNeto: subtotalHaber,
        totalRetencion: 0,
        totalImpuesto: 0,
        montoAPagar: montoFinal,
        observaciones,
        elaboradoPor,
        facturasPagadas: facturasDetalles,
      });

      await orden.save();

      // Marcar facturas como pagadas
      for (const facturaId of facturasIds) {
        await FacturaProveedor.findByIdAndUpdate(facturaId, {
          estatus: "Pagada",
          ordenPagoId: orden.numero,
          fechaPago: new Date(fechaPago),
        });
      }

      // Actualizar saldo del proveedor
      let saldoActual = parseFloat(proveedor.saldoCuentaCorriente) || 0;
      proveedor.saldoCuentaCorriente = saldoActual - montoFinal;
      await proveedor.save();

      res.redirect(`/ordenes-pago/ver/${orden.numero}`);
    } catch (error) {
      console.error(error);
      try {
        const proveedores = await Proveedor.find().sort({ razonSocial: 1, nombre: 1 });
        res.render("finanzas/pagar-multiple", {
          titulo: "Pagar a Proveedor - TodoStock S.A.",
          proveedores,
          error: error.message,
          datos: req.body,
        });
      } catch (err) {
        res.status(500).send("Error al procesar pago");
      }
    }
  },
};

module.exports = finanzasController;
