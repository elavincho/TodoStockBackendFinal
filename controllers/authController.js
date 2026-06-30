// const Usuario = require("../models/Usuario");

// //  MIDDLEWARES DE AUTENTICACIÓN
// const isAuthenticated = (req, res, next) => {
//   if (req.session && req.session.usuario) {
//     return next();
//   }
//   res.redirect("/login");
// };

// const isGuest = (req, res, next) => {
//   if (req.session && req.session.usuario) {
//     return res.redirect("/dashboard");
//   }
//   next();
// };

// // CONTROLADOR DE AUTENTICACIÓN
// const authController = {
//   // Mostrar formulario de login
//   loginForm: (req, res) => {
//     res.render("auth/login", {
//       titulo: "Iniciar Sesión - TodoStock S.A.",
//       error: null,
//       datos: null,
//     });
//   },

//   // Procesar login
//   login: async (req, res) => {
//     try {
//       const { username, password } = req.body;

//       // Buscar usuario por username o email
//       const usuario = await Usuario.findOne({
//         $or: [
//           { username: username.toLowerCase() },
//           { email: username.toLowerCase() },
//         ],
//       });

//       if (!usuario) {
//         return res.render("auth/login", {
//           titulo: "Iniciar Sesión - TodoStock S.A.",
//           error: "Usuario o contraseña incorrectos",
//           datos: { username },
//         });
//       }

//       // Verificar si está activo
//       if (!usuario.activo) {
//         return res.render("auth/login", {
//           titulo: "Iniciar Sesión - TodoStock S.A.",
//           error: "Usuario desactivado. Contacte al administrador",
//           datos: { username },
//         });
//       }

//       // Verificar contraseña (requiere método comparePassword en el modelo Usuario)
//       const isValid = await usuario.comparePassword(password);
//       if (!isValid) {
//         return res.render("auth/login", {
//           titulo: "Iniciar Sesión - TodoStock S.A.",
//           error: "Usuario o contraseña incorrectos",
//           datos: { username },
//         });
//       }

//       // Actualizar último acceso
//       usuario.ultimoAcceso = new Date();
//       await usuario.save();

//       // Guardar sesión real en req.session
//       req.session.usuario = {
//         id: usuario._id,
//         username: usuario.username,
//         email: usuario.email,
//         nombreCompleto: usuario.nombreCompleto,
//         rol: usuario.rol,
//       };

//       res.redirect("/dashboard");
//     } catch (error) {
//       console.error(error);
//       res.render("auth/login", {
//         titulo: "Iniciar Sesión - TodoStock S.A.",
//         error: "Error al iniciar sesión. Intente nuevamente",
//         datos: req.body,
//       });
//     }
//   },

//   // Mostrar formulario de registro
//   registerForm: (req, res) => {
//     res.render("auth/register", {
//       titulo: "Registrarse - TodoStock S.A.",
//       error: null,
//       datos: null,
//     });
//   },

//   // Procesar registro
//   register: async (req, res) => {
//     try {
//       const { username, email, password, confirmPassword, nombreCompleto } =
//         req.body;

//       // Validar que las contraseñas coincidan
//       if (password !== confirmPassword) {
//         return res.render("auth/register", {
//           titulo: "Registrarse - TodoStock S.A.",
//           error: "Las contraseñas no coinciden",
//           datos: { username, email, nombreCompleto },
//         });
//       }

//       // Validar que la contraseña tenga al menos 6 caracteres
//       if (password.length < 6) {
//         return res.render("auth/register", {
//           titulo: "Registrarse - TodoStock S.A.",
//           error: "La contraseña debe tener al menos 6 caracteres",
//           datos: { username, email, nombreCompleto },
//         });
//       }

//       // Verificar si ya existe el usuario o email
//       const existeUsuario = await Usuario.findOne({
//         $or: [
//           { username: username.toLowerCase() },
//           { email: email.toLowerCase() },
//         ],
//       });

//       if (existeUsuario) {
//         return res.render("auth/register", {
//           titulo: "Registrarse - TodoStock S.A.",
//           error: "El nombre de usuario o email ya está registrado",
//           datos: { username, email, nombreCompleto },
//         });
//       }

//       // Crear nuevo usuario
//       const nuevoUsuario = new Usuario({
//         username: username.toLowerCase(),
//         email: email.toLowerCase(),
//         password: password,
//         nombreCompleto: nombreCompleto,
//         rol: "usuario",
//         activo: true,
//       });

//       await nuevoUsuario.save();

//       res.render("auth/login", {
//         titulo: "Iniciar Sesión - TodoStock S.A.",
//         error: null,
//         mensajeExito: "Registro exitoso. Ahora puedes iniciar sesión",
//         datos: { username },
//       });
//     } catch (error) {
//       console.error(error);
//       res.render("auth/register", {
//         titulo: "Registrarse - TodoStock S.A.",
//         error: "Error al registrar usuario. Intente nuevamente",
//         datos: req.body,
//       });
//     }
//   },

//   // Cerrar sesión
//   logout: (req, res) => {
//     req.session.destroy((err) => {
//       if (err) {
//         console.error(err);
//       }
//       res.redirect("/login");
//     });
//   },

//   // Dashboard después del login
//   dashboard: async (req, res) => {
//     try {
//       const Producto = require("../models/Producto");
//       const Cliente = require("../models/Cliente");
//       const Proveedor = require("../models/Proveedor");
//       const OrdenPago = require("../models/OrdenPago");
//       const FacturaProveedor = require("../models/FacturaProveedor");

//       const totalProductos = await Producto.countDocuments();
//       const totalClientes = await Cliente.countDocuments();
//       const totalProveedores = await Proveedor.countDocuments();
//       const totalOrdenesPago = await OrdenPago.countDocuments();
//       const facturasPendientes = await FacturaProveedor.countDocuments({
//         estatus: "Pendiente",
//       });

//       // Obtener últimas 5 órdenes de pago
//       const ultimasOrdenes = await OrdenPago.find()
//         .sort({ createdAt: -1 })
//         .limit(5);

//       res.render("auth/dashboard", {
//         titulo: "Dashboard - TodoStock S.A.",
//         usuario: req.session.usuario,
//         totalProductos,
//         totalClientes,
//         totalProveedores,
//         totalOrdenesPago,
//         facturasPendientes,
//         ultimasOrdenes,
//       });
//     } catch (error) {
//       console.error(error);
//       res.status(500).send("Error al cargar dashboard");
//     }
//   },
// };

// // Exportar el controlador Y los middlewares
// module.exports = {
//   authController,
//   isAuthenticated,
//   isGuest,
// };

const Usuario = require("../models/Usuario");
const authJWT = require("../middlewares/authJWT");

//  MIDDLEWARES DE AUTENTICACIÓN (existentes)
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.usuario) {
    return next();
  }
  res.redirect("/login");
};

const isGuest = (req, res, next) => {
  if (req.session && req.session.usuario) {
    return res.redirect("/dashboard");
  }
  next();
};

// NUEVO: Middleware para APIs con JWT
const isAuthenticatedAPI = authJWT.verifyToken;

// CONTROLADOR DE AUTENTICACIÓN
const authController = {
  // Mostrar formulario de login
  loginForm: (req, res) => {
    res.render("auth/login", {
      titulo: "Iniciar Sesión - TodoStock S.A.",
      error: null,
      datos: null,
    });
  },

  // MODIFICAR: Procesar login para soportar JWT
  login: async (req, res) => {
    try {
      const { username, password } = req.body;

      // Buscar usuario
      const usuario = await Usuario.findOne({
        $or: [
          { username: username.toLowerCase() },
          { email: username.toLowerCase() },
        ],
      });

      if (!usuario) {
        // Si es una petición API, devolver JSON
        if (req.xhr || req.headers.accept?.includes('application/json')) {
          return res.status(401).json({
            success: false,
            message: "Usuario o contraseña incorrectos"
          });
        }
        return res.render("auth/login", {
          titulo: "Iniciar Sesión - TodoStock S.A.",
          error: "Usuario o contraseña incorrectos",
          datos: { username },
        });
      }

      // Verificar si está activo
      if (!usuario.activo) {
        if (req.xhr || req.headers.accept?.includes('application/json')) {
          return res.status(403).json({
            success: false,
            message: "Usuario desactivado. Contacte al administrador"
          });
        }
        return res.render("auth/login", {
          titulo: "Iniciar Sesión - TodoStock S.A.",
          error: "Usuario desactivado. Contacte al administrador",
          datos: { username },
        });
      }

      // Verificar contraseña
      const isValid = await usuario.comparePassword(password);
      if (!isValid) {
        if (req.xhr || req.headers.accept?.includes('application/json')) {
          return res.status(401).json({
            success: false,
            message: "Usuario o contraseña incorrectos"
          });
        }
        return res.render("auth/login", {
          titulo: "Iniciar Sesión - TodoStock S.A.",
          error: "Usuario o contraseña incorrectos",
          datos: { username },
        });
      }

      // Actualizar último acceso
      usuario.ultimoAcceso = new Date();
      await usuario.save();

      // Datos del usuario para la sesión/token
      const userData = {
        id: usuario._id,
        username: usuario.username,
        email: usuario.email,
        nombreCompleto: usuario.nombreCompleto,
        rol: usuario.rol,
      };

      // Generar token JWT
      const token = authJWT.generateToken(usuario);

      // Guardar en cookie (para que funcione con navegador)
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 24 horas
      });

      // Guardar sesión (para compatibilidad con vistas)
      req.session.usuario = userData;

      // Si es petición API, devolver JSON con token
      if (req.xhr || req.headers.accept?.includes('application/json')) {
        return res.json({
          success: true,
          token: token,
          usuario: userData
        });
      }

      // Para vistas normales, redirigir al dashboard
      res.redirect("/dashboard");
    } catch (error) {
      console.error('Error en login:', error);
      
      if (req.xhr || req.headers.accept?.includes('application/json')) {
        return res.status(500).json({
          success: false,
          message: "Error al iniciar sesión"
        });
      }
      
      res.render("auth/login", {
        titulo: "Iniciar Sesión - TodoStock S.A.",
        error: "Error al iniciar sesión. Intente nuevamente",
        datos: req.body,
      });
    }
  },

  // Mostrar formulario de registro
  registerForm: (req, res) => {
    res.render("auth/register", {
      titulo: "Registrarse - TodoStock S.A.",
      error: null,
      datos: null,
    });
  },

  // Procesar registro
  register: async (req, res) => {
    try {
      const { username, email, password, confirmPassword, nombreCompleto } =
        req.body;

      // Validar que las contraseñas coincidan
      if (password !== confirmPassword) {
        return res.render("auth/register", {
          titulo: "Registrarse - TodoStock S.A.",
          error: "Las contraseñas no coinciden",
          datos: { username, email, nombreCompleto },
        });
      }

      // Validar que la contraseña tenga al menos 6 caracteres
      if (password.length < 6) {
        return res.render("auth/register", {
          titulo: "Registrarse - TodoStock S.A.",
          error: "La contraseña debe tener al menos 6 caracteres",
          datos: { username, email, nombreCompleto },
        });
      }

      // Verificar si ya existe el usuario o email
      const existeUsuario = await Usuario.findOne({
        $or: [
          { username: username.toLowerCase() },
          { email: email.toLowerCase() },
        ],
      });

      if (existeUsuario) {
        return res.render("auth/register", {
          titulo: "Registrarse - TodoStock S.A.",
          error: "El nombre de usuario o email ya está registrado",
          datos: { username, email, nombreCompleto },
        });
      }

      // Crear nuevo usuario
      const nuevoUsuario = new Usuario({
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        password: password,
        nombreCompleto: nombreCompleto,
        rol: "usuario",
        activo: true,
      });

      await nuevoUsuario.save();

      res.render("auth/login", {
        titulo: "Iniciar Sesión - TodoStock S.A.",
        error: null,
        mensajeExito: "Registro exitoso. Ahora puedes iniciar sesión",
        datos: { username },
      });
    } catch (error) {
      console.error(error);
      res.render("auth/register", {
        titulo: "Registrarse - TodoStock S.A.",
        error: "Error al registrar usuario. Intente nuevamente",
        datos: req.body,
      });
    }
  },

  // MODIFICAR: Logout para eliminar token
  logout: (req, res) => {
    // Eliminar cookie JWT
    res.clearCookie('token');
    
    // Destruir sesión
    req.session.destroy((err) => {
      if (err) {
        console.error('Error al destruir sesión:', err);
      }
      
      // Si es petición API
      if (req.xhr || req.headers.accept?.includes('application/json')) {
        return res.json({
          success: true,
          message: "Sesión cerrada exitosamente"
        });
      }
      
      res.redirect("/login");
    });
  },

  // Dashboard después del login
  dashboard: async (req, res) => {
    try {
      const Producto = require("../models/Producto");
      const Cliente = require("../models/Cliente");
      const Proveedor = require("../models/Proveedor");
      const OrdenPago = require("../models/OrdenPago");
      const FacturaProveedor = require("../models/FacturaProveedor");

      const totalProductos = await Producto.countDocuments();
      const totalClientes = await Cliente.countDocuments();
      const totalProveedores = await Proveedor.countDocuments();
      const totalOrdenesPago = await OrdenPago.countDocuments();
      const facturasPendientes = await FacturaProveedor.countDocuments({
        estatus: "Pendiente",
      });

      // Obtener últimas 5 órdenes de pago
      const ultimasOrdenes = await OrdenPago.find()
        .sort({ createdAt: -1 })
        .limit(5);

      res.render("auth/dashboard", {
        titulo: "Dashboard - TodoStock S.A.",
        usuario: req.session.usuario,
        totalProductos,
        totalClientes,
        totalProveedores,
        totalOrdenesPago,
        facturasPendientes,
        ultimasOrdenes,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Error al cargar dashboard");
    }
  },

  // NUEVO: Método para verificar token (para pruebas)
  verifyToken: async (req, res) => {
    try {
      // Este método usa el middleware authJWT.verifyToken
      res.json({
        success: true,
        usuario: req.usuario
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al verificar token"
      });
    }
  },

  // NUEVO: Renovar token
  refreshToken: async (req, res) => {
    try {
      const usuario = await Usuario.findById(req.usuario.id);
      if (!usuario) {
        return res.status(404).json({
          success: false,
          message: "Usuario no encontrado"
        });
      }

      const newToken = authJWT.generateToken(usuario);
      
      // Actualizar cookie
      res.cookie('token', newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000
      });

      res.json({
        success: true,
        token: newToken
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al renovar token"
      });
    }
  }
};

// Exportar el controlador Y los middlewares
module.exports = {
  authController,
  isAuthenticated,
  isGuest,
  isAuthenticatedAPI, // NUEVO: para usar en rutas API
};