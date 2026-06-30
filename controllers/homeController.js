const Producto = require('../models/Producto');
const Cliente = require('../models/Cliente');
const Proveedor = require('../models/Proveedor');

const homeController = {
    index: async (req, res) => {
        try {
            const totalProductos = await Producto.countDocuments();
            const totalClientes = await Cliente.countDocuments();
            const totalProveedores = await Proveedor.countDocuments();
            
            res.render('home/index', {
                titulo: 'Home TodoStock S.A.',
                totalProductos,
                totalClientes,
                totalProveedores
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Error al cargar la página principal');
        }
    }
};

module.exports = homeController;