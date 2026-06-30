const jwt = require('jsonwebtoken');

const authJWT = {
  // Middleware para verificar token JWT (para APIs)
  verifyToken: (req, res, next) => {
    // Buscar token en diferentes lugares
    const token = req.headers['authorization']?.split(' ')[1] || 
                  req.cookies?.token || 
                  req.query?.token;

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'No se proporcionó token de autenticación' 
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.usuario = decoded;
      req.userId = decoded.id;
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          success: false, 
          message: 'Token expirado' 
        });
      }
      return res.status(401).json({ 
        success: false, 
        message: 'Token inválido' 
      });
    }
  },

  // Middleware para verificar roles (para APIs)
  verifyRole: (roles) => {
    return (req, res, next) => {
      if (!req.usuario) {
        return res.status(401).json({ 
          success: false, 
          message: 'No autorizado' 
        });
      }
      
      if (!roles.includes(req.usuario.rol)) {
        return res.status(403).json({ 
          success: false, 
          message: 'Acceso denegado. Rol requerido: ' + roles.join(', ') 
        });
      }
      
      next();
    };
  },

  // Middleware para verificar si es admin (para APIs)
  isAdmin: (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ 
        success: false, 
        message: 'No autorizado' 
      });
    }
    
    if (req.usuario.rol !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Acceso denegado. Se requiere rol de administrador' 
      });
    }
    
    next();
  },

  // Función para generar token JWT
  generateToken: (usuario) => {
    return jwt.sign(
      {
        id: usuario._id,
        username: usuario.username,
        email: usuario.email,
        nombreCompleto: usuario.nombreCompleto,
        rol: usuario.rol
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
  }
};

module.exports = authJWT;