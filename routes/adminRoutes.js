const express = require('express');
const router = express.Router();
const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');

// Middleware para verificar si es administrador
const requireAdmin = (req, res, next) => {
  if (!req.session.usuario || req.session.usuario.rol !== 'admin') {
    return res.status(403).send('Acceso denegado. Se requieren privilegios de administrador.');
  }
  next();
};

// Panel de administración
router.get('/', requireAdmin, async (req, res) => {
  try {
    const usuarios = await Usuario.find().sort({ createdAt: -1 });
    const totalUsuarios = usuarios.length;
    const usuariosActivos = usuarios.filter(u => u.activo).length;
    const usuariosAdmin = usuarios.filter(u => u.rol === 'admin').length;
    const usuariosContador = usuarios.filter(u => u.rol === 'contador').length;
    
    res.render('auth/admin', {
      titulo: 'Administración - TodoStock S.A.',
      usuarios,
      totalUsuarios,
      usuariosActivos,
      usuariosAdmin,
      usuariosContador,
      usuario: req.session.usuario
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al cargar panel de administración');
  }
});

// Obtener un usuario por ID (API)
router.get('/usuarios/:id', requireAdmin, async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id).select('-password');
    res.json({ success: true, usuario });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

// Crear nuevo usuario
router.post('/usuarios', requireAdmin, async (req, res) => {
  try {
    const { username, email, password, nombreCompleto, rol, activo } = req.body;
    
    // Verificar si ya existe
    const existe = await Usuario.findOne({ $or: [{ username }, { email }] });
    if (existe) {
      return res.json({ success: false, error: 'El usuario o email ya existe' });
    }
    
    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const nuevoUsuario = new Usuario({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password: hashedPassword,
      nombreCompleto,
      rol: rol || 'usuario',
      activo: activo !== false
    });
    
    await nuevoUsuario.save();
    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

// Actualizar usuario
router.put('/usuarios/:id', requireAdmin, async (req, res) => {
  try {
    const { username, email, password, nombreCompleto, rol, activo } = req.body;
    
    const updateData = {
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      nombreCompleto,
      rol,
      activo
    };
    
    // Si se proporciona contraseña, actualizarla
    if (password && password.length > 0) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }
    
    await Usuario.findByIdAndUpdate(req.params.id, updateData);
    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

// Eliminar usuario
router.delete('/usuarios/:id', requireAdmin, async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id);
    if (usuario.username === 'admin') {
      return res.json({ success: false, error: 'No se puede eliminar el usuario administrador principal' });
    }
    await Usuario.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

module.exports = router;