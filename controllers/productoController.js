const Producto = require('../models/Producto');

const productoController = {
    index: async (req, res) => {
        try {
            const productos = await Producto.find().sort({ createdAt: 1 });
            res.render('productos/index', {
                titulo: 'Inventario TodoStock S.A.',
                productos: productos
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Error al listar productos');
        }
    },

    formCrear: (req, res) => {
        res.render('productos/crear', {
            titulo: 'Registrar Nuevo Producto',
            error: null,
            datos: null
        });
    },

    almacenar: async (req, res) => {
        try {
            await Producto.create({
                nombre: req.body.nombre,
                categoria: req.body.categoria,
                precio: parseFloat(req.body.precio),
                stockActual: parseInt(req.body.stockActual),
                stockMinimo: parseInt(req.body.stockMinimo)
            });
            res.redirect('/productos');
        } catch (error) {
            res.render('productos/crear', {
                titulo: 'Registrar Nuevo Producto',
                error: error.message,
                datos: req.body
            });
        }
    },

    formEditar: async (req, res) => {
        try {
            const producto = await Producto.findById(req.params.id);
            if (!producto) {
                return res.status(404).send('Producto no encontrado');
            }
            res.render('productos/editar', { titulo: 'Editar Producto', producto });
        } catch (error) {
            console.error(error);
            res.status(500).send('Error al buscar producto');
        }
    },

    actualizar: async (req, res) => {
        try {
            await Producto.findByIdAndUpdate(
                req.params.id,
                {
                    nombre: req.body.nombre,
                    categoria: req.body.categoria,
                    precio: parseFloat(req.body.precio),
                    stockActual: parseInt(req.body.stockActual),
                    stockMinimo: parseInt(req.body.stockMinimo)
                },
                { new: true }
            );
            res.redirect('/productos');
        } catch (error) {
            console.error(error);
            res.status(500).send('Error al actualizar producto');
        }
    },

    eliminar: async (req, res) => {
        try {
            await Producto.findByIdAndDelete(req.params.id);
            res.redirect('/productos');
        } catch (error) {
            console.error(error);
            res.status(500).send('Error al eliminar producto');
        }
    }
};

module.exports = productoController;