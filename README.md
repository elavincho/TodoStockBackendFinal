<img src="https://i.ibb.co/VYkx7wHV/ifts29-Logo.png" width="80" height="80" alt="ifts-29"/>

# Proyecto Integrador

# TodoStock S.A. - Sistema de Gestión Empresarial

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Mongoose](https://img.shields.io/badge/Mongoose-880000?style=for-the-badge&logo=mongoose&logoColor=white)
![Pug](https://img.shields.io/badge/Pug-A86454?style=for-the-badge&logo=pug&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

## 📋 Información del Proyecto

**Materia:** Desarrollo de Sistemas Web - Back End  
**Carrera:** Tecnicatura Superior en Desarrollo de Software  
**Institución:** Instituto de Formación Técnica Superior N° 29 (IFTS 29)  
**Período:** 2026 - 1er Cuatrimestre  
**Tipo de Entrega:** Parcial Final (Entrega 3/3)  
**Grupo:** 404Solution

**Estado del Proyecto:** ✅ Completado y desplegado  
**Versión Actual:** 2.1.0  
**Última Actualización:** Junio 2026

🔗 **Repositorio:** [https://github.com/IFTS29/404_Solutions_Entrega_Final.git](https://github.com/IFTS29/404_Solutions_Entrega_Final.git)  
🌐 **Demo en vivo:** [https://404-solutions-entrega-final.vercel.app](https://404-solutions-entrega-final.vercel.app/login)

---

## 📖 Descripción del Proyecto

**TodoStock S.A.** es un sistema integral de gestión empresarial desarrollado para una distribuidora de productos de limpieza. Este proyecto representa la **evolución completa** a través de tres entregas progresivas, cada una agregando complejidad y funcionalidad al sistema.

### **Características Actuales (Versión 2.0):**

- ✅ **Base de datos MongoDB** con Mongoose ODM
- ✅ **Autenticación segura** con bcrypt + hashing de contraseñas
- ✅ **Sesiones persistentes** con express-session + connect-mongo
- ✅ **Sistema de roles** y autorización (admin, contador, usuario)
- ✅ **Módulos completos** de facturación, notas de crédito/débito, órdenes de pago, recibos de cobro, presupuestos
- ✅ **Cobro y pago múltiple** con selección de documentos (facturas + NC + ND) y generación de comprobantes
- ✅ **Gestión automática de stock** con control de movimientos
- ✅ **Middleware de manejo de errores** centralizado
- ✅ **Interfaz responsive** con CSS moderno y mobile-first
- ✅ **Despliegue en Vercel** como Serverless Function
- ✅ **Documentación completa** con diagramas y manuales

La plataforma permite gestionar de forma integral: productos, clientes, proveedores, facturación, órdenes de pago, notas contables y reportes financieros.

---

## 🎯 Objetivos Cumplidos

### **Objetivos Generales:**
- ✅ Desarrollar una aplicación web funcional utilizando Node.js y Express
- ✅ Aplicar conceptos de Backend: ruteo, middleware, asincronía, manejo de errores
- ✅ Implementar base de datos MongoDB con Mongoose
- ✅ Desplegar la aplicación en un servicio cloud (Vercel + MongoDB Atlas)
- ✅ Seguir buenas prácticas de desarrollo y arquitectura MVC
- ✅ Integrar conocimientos de otras materias (Frontend, Ingeniería de Software)

### **Objetivos Específicos:**
- ✅ Implementar autenticación y autorización segura
- ✅ Crear un sistema de roles con permisos diferenciados
- ✅ Desarrollar CRUDs completos para todas las entidades
- ✅ Implementar lógica de negocio compleja (facturación, stock, finanzas)
- ✅ Manejar relaciones entre entidades (referencias en MongoDB)
- ✅ Crear middlewares personalizados para protección de rutas
- ✅ Implementar manejo centralizado de errores
- ✅ Diseñar interfaz de usuario intuitiva y responsive
- ✅ Documentar el proyecto de forma profesional

---

## 🎯 Funcionalidades Principales

### 🔐 Autenticación y Seguridad
- Registro de usuarios con validaciones
- Login con usuario/email + contraseña encriptada (bcrypt)
- Sesiones persistentes en MongoDB
- Logout seguro
- Protección de rutas según autenticación
- Control de acceso por roles

### 👥 Sistema de Roles
- **Admin**: Acceso total, gestión de usuarios
- **Contador**: Acceso a módulos financieros y facturación
- **Usuario**: Operaciones básicas (productos, clientes, proveedores)

### 📦 Gestión de Inventario
- CRUD completo de productos
- Control de stock automático
- Alertas de stock mínimo
- Actualización de stock desde facturas
- Historial de movimientos

### 👤 Gestión de Clientes y Proveedores
- CRUD completo con validaciones
- Soporte para DNI y CUIT
- Manejo de cuentas corrientes
- Consulta de saldos

### 🧾 Facturación
- **Facturas a Clientes**: Con descuento automático de stock
- **Facturas de Proveedores**: Con aumento automático de stock
- Cálculo automático de IVA (21% y 10.5%)
- Estados: Pendiente, Pagada, Anulada, Parcial
- Anulación con reversión de stock

### 💰 Gestión Financiera
- Órdenes de pago con múltiples facturas
- Recibos de cobro con selección de facturas pendientes
- Cobro múltiple a clientes (facturas - NC + ND = total neto)
- Pago múltiple a proveedores con generación de orden de pago
- Notas de crédito (devoluciones y ajustes negativos)
- Notas de débito (cargos adicionales)
- Presupuestos con fechas de validez
- Estados de documentos: Pendiente, Pagada, Anulada, Parcial
- Cálculo automático de saldos
- Resumen financiero por cliente y proveedor
- Botón de cobro/pago directo desde las vistas de cuentas por cobrar/pagar

### 🛡️ Manejo de Errores
- Middleware centralizado de errores
- Páginas de error personalizadas (404, 500)
- Logging de errores en desarrollo
- Mensajes de error amigables al usuario

---

## 🏗️ Arquitectura y Tecnologías

### Stack Tecnológico

| Tecnología | Versión | Uso |
|------------|---------|-----|
| **Node.js** | 18+ | Entorno de ejecución |
| **Express.js** | 5.2.1 | Framework web |
| **MongoDB** | 4.17.2 | Base de datos |
| **Mongoose** | 9.6.2 | ODM para MongoDB |
| **bcryptjs** | 3.0.3 | Encriptación de contraseñas |
| **express-session** | 1.19.0 | Gestión de sesiones |
| **connect-mongo** | 4.6.0 | Store de sesiones en MongoDB |
| **Pug** | 3.0.4 | Motor de plantillas |
| **dotenv** | 17.4.2 | Variables de entorno |

### Patrón de Diseño: MVC (Model-View-Controller)

```
📁 Estructura del Proyecto
├── 📂 config/              # Configuración de base de datos
│   └── database.js
├── 📂 controllers/         # Lógica de negocio (13 controladores)
│   ├── authController.js
│   ├── clienteController.js
│   ├── facturaClienteController.js
│   ├── facturaProveedorController.js
│   ├── finanzasController.js
│   ├── homeController.js
│   ├── notaDeCreditoController.js
│   ├── notaDeDebitoController.js
│   ├── ordenPagoController.js
│   ├── presupuestoController.js
│   ├── productoController.js
│   ├── proveedorController.js
│   └── reciboCobroController.js
├── 📂 models/              # Schemas de Mongoose (11 modelos)
│   ├── Cliente.js
│   ├── FacturaCliente.js
│   ├── FacturaProveedor.js
│   ├── NotaDeCredito.js
│   ├── NotaDeDebito.js
│   ├── OrdenPago.js
│   ├── Presupuesto.js
│   ├── Producto.js
│   ├── Proveedor.js
│   ├── ReciboCobro.js
│   └── Usuario.js
├── 📂 routes/              # Definición de endpoints (16 rutas)
│   ├── adminRoutes.js
│   ├── apiRoutes.js
│   ├── authRoutes.js
│   ├── clienteRoutes.js
│   ├── cobranzasRoutes.js
│   ├── facturaClienteRoutes.js
│   ├── facturaProveedorRoutes.js
│   ├── finanzasRoutes.js
│   ├── homeRoutes.js
│   ├── notaDeCreditoRoutes.js
│   ├── notaDeDebitoRoutes.js
│   ├── ordenPagoRoutes.js
│   ├── presupuestoRoutes.js
│   ├── productoRoutes.js
│   ├── proveedorRoutes.js
│   └── reciboCobroRoutes.js
├── 📂 middlewares/         # Middlewares personalizados
│   ├── authJWT.js         # Autenticación JWT
│   └── errorHandler.js    # Manejo centralizado de errores
├── 📂 services/            # Lógica de negocio reutilizable
│   └── stockService.js    # Gestión de inventario
├── 📂 views/               # Plantillas Pug
│   ├── layout.pug         # Layout base
│   ├── error.pug          # Página de error
│   ├── 📂 auth/
│   ├── 📂 clientes/
│   ├── 📂 cobranzas/
│   ├── 📂 facturas-cliente/
│   ├── 📂 facturas-proveedor/
│   ├── 📂 finanzas/
│   ├── 📂 home/
│   ├── 📂 notas-credito/
│   ├── 📂 notas-debito/
│   ├── 📂 ordenes-pago/
│   ├── 📂 presupuestos/
│   ├── 📂 productos/
│   ├── 📂 proveedores/
│   └── 📂 recibos-cobro/
├── 📂 public/              # Archivos estáticos
│   ├── 📂 css/
│   ├── 📂 img/
│   └── 📂 js/
├── .env                    # Variables de entorno (no versionado)
├── .gitignore
├── app.js                  # Punto de entrada
├── package.json
├── vercel.json             # Configuración de despliegue
└── README.md
```

---

## 🚀 Instalación y Configuración

### Prerrequisitos

- **Node.js** v18 o superior
- **MongoDB** (local o MongoDB Atlas)
- **Git**
- **npm** o **yarn**

### Paso 1: Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd backend_2da_entrega_commonjs_mongo
```

### Paso 2: Instalar dependencias

```bash
npm install
```

### Paso 3: Configurar variables de entorno

Crear un archivo `.env` en la raíz del proyecto (usar `.env.example` como referencia):

```env
# Base de Datos MongoDB
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/todostock

# Clave secreta para sesiones (generar una única y segura)
SESSION_SECRET=tu_clave_secreta_super_segura_cambiar_en_produccion

# Puerto del servidor
PORT=3000

# Entorno
NODE_ENV=development
```

**⚠️ IMPORTANTE:**
- Generar una `SESSION_SECRET` única con: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
- NUNCA subir el archivo `.env` al repositorio
- Para MongoDB Atlas, crear un usuario con permisos específicos

### Paso 4: Iniciar el servidor

**Modo desarrollo (con nodemon):**
```bash
npm run dev
```

**Modo producción:**
```bash
npm start
```

El servidor estará disponible en `http://localhost:3000`

---

## 🧪 Ejecución de Pruebas

### **Estado Actual: Pruebas Manuales**

**Justificación técnica:** El enunciado del parcial final indica: *"No es necesario ahondar en este punto"* respecto al testing automatizado. Por lo tanto, se priorizó la funcionalidad completa del sistema y se realizaron pruebas manuales exhaustivas.

### **Pruebas Manuales Ejecutadas:**

#### **1. Autenticación y Seguridad**
| Prueba | Procedimiento | Resultado Esperado | Estado |
|--------|---------------|-------------------|--------|
| Registro de usuario | Completar formulario con datos válidos | Usuario creado y redirigido al login | ✅ PASS |
| Login exitoso | Ingresar credenciales correctas | Sesión iniciada, redirección al dashboard | ✅ PASS |
| Login con contraseña incorrecta | Ingresar contraseña errónea | Mensaje de error, sin acceso | ✅ PASS |
| Logout | Hacer clic en "Cerrar sesión" | Sesión terminada, redirección al login | ✅ PASS |
| Acceso sin autenticación | Intentar acceder a ruta protegida sin login | Redirección automática al login | ✅ PASS |

#### **2. Sistema de Roles y Autorización**
| Prueba | Rol | Procedimiento | Resultado Esperado | Estado |
|--------|-----|---------------|-------------------|--------|
| Acceso al panel de admin | Usuario | Intentar acceder a `/admin` | Error 403 - Acceso denegado | ✅ PASS |
| Acceso al panel de admin | Admin | Acceder a `/admin` | Acceso permitido | ✅ PASS |
| Acceso a finanzas | Usuario | Intentar acceder a `/finanzas` | Error 403 - Acceso denegado | ✅ PASS |
| Acceso a finanzas | Contador | Acceder a `/finanzas` | Acceso permitido | ✅ PASS |

#### **3. CRUD de Productos**
| Prueba | Procedimiento | Resultado Esperado | Estado |
|--------|---------------|-------------------|--------|
| Crear producto | Completar formulario con datos válidos | Producto guardado en BD | ✅ PASS |
| Listar productos | Acceder a `/productos` | Listado completo de productos | ✅ PASS |
| Editar producto | Modificar nombre y precio | Cambios guardados correctamente | ✅ PASS |
| Eliminar producto | Hacer clic en eliminar | Producto removido de la BD | ✅ PASS |
| Validación de precio | Ingresar precio negativo | Error de validación | ✅ PASS |

#### **4. Facturación y Stock**
| Prueba | Procedimiento | Resultado Esperado | Estado |
|--------|---------------|-------------------|--------|
| Crear factura a cliente | Agregar productos y guardar | Factura creada, stock descontado | ✅ PASS |
| Verificar descuento de stock | Revisar stock después de facturar | Stock actualizado correctamente | ✅ PASS |
| Anular factura | Cambiar estado a "Anulada" | Stock reversado al valor original | ✅ PASS |
| Factura de proveedor | Crear factura de compra | Stock incrementado | ✅ PASS |
| Cálculo de IVA 21% | Crear factura con producto IVA 21% | IVA calculado correctamente | ✅ PASS |
| Cálculo de IVA 10.5% | Crear factura con producto IVA 10.5% | IVA calculado correctamente | ✅ PASS |

#### **5. Gestión Financiera**
| Prueba | Procedimiento | Resultado Esperado | Estado |
|--------|---------------|-------------------|--------|
| Crear orden de pago | Seleccionar facturas y crear OP | OP creada con total correcto | ✅ PASS |
| Marcar OP como pagada | Cambiar estado a "Pagada" | Estado actualizado | ✅ PASS |
| Crear nota de crédito | Registrar devolución | NC creada, monto negativo | ✅ PASS |
| Crear nota de débito | Registrar cargo adicional | ND creada, monto positivo | ✅ PASS |
| Crear presupuesto | Generar presupuesto con validez | Presupuesto guardado con fecha | ✅ PASS |
| Crear recibo de cobro | Seleccionar facturas de cliente y cobrar | Recibo emitido, facturas pagadas | ✅ PASS |
| Cobro múltiple con NC y ND | Seleccionar facturas + NC + ND de cliente | Total neto calculado correctamente | ✅ PASS |
| Pago múltiple a proveedor | Seleccionar varias facturas del proveedor | Orden de pago generada con total | ✅ PASS |
| Anular recibo de cobro | Anular recibo emitido | Facturas vuelven a Pendiente | ✅ PASS |
| Pagar desde cuentas por pagar | Click en "Pagar" en factura de proveedor | Redirige a orden de pago con proveedor preseleccionado | ✅ PASS |

#### **6. Manejo de Errores**
| Prueba | Procedimiento | Resultado Esperado | Estado |
|--------|---------------|-------------------|--------|
| Página 404 | Acceder a ruta inexistente `/asd` | Página de error 404 personalizada | ✅ PASS |
| Error 500 | Forzar error de servidor | Página de error 500 amigable | ✅ PASS |
| Validación de formularios | Enviar formulario vacío | Mensajes de error claros | ✅ PASS |

#### **7. Responsive y UI/UX**
| Prueba | Dispositivo | Procedimiento | Resultado Esperado | Estado |
|--------|-------------|---------------|-------------------|--------|
| Vista móvil | iPhone 12 (390x844) | Navegar por todas las páginas | Layout responsive, navbar colapsado | ✅ PASS |
| Vista tablet | iPad (768x1024) | Probar formularios y tablas | Elementos adaptados correctamente | ✅ PASS |
| Vista desktop | 1920x1080 | Navegar dashboard y listados | Diseño optimizado, uso de espacio | ✅ PASS |

### **Herramientas de Prueba Utilizadas:**
- **Navegadores:** Chrome, Firefox, Edge
- **DevTools:** Inspección de red, consola, responsive mode
- **MongoDB Compass:** Verificación directa de datos en BD
- **Postman:** (opcional) Pruebas de endpoints específicos

### **Resultados Totales:**
- ✅ **Pruebas exitosas:** 35/35 (100%)
- ❌ **Pruebas fallidas:** 0/35 (0%)
- ⚠️ **Limitaciones identificadas:** Ver sección "Problemas Conocidos"

### **Mejoras Futuras (Testing Automatizado):**

Para versiones futuras del proyecto, se recomienda implementar:

```javascript
// Ejemplo de test con Jest + Supertest
const request = require('supertest');
const app = require('../app');

describe('POST /auth/login', () => {
  it('should login with valid credentials', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({
        username: 'admin',
        password: 'admin123'
      });
    
    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe('/dashboard');
  });
  
  it('should reject invalid credentials', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({
        username: 'admin',
        password: 'wrongpassword'
      });
    
    expect(res.statusCode).toBe(401);
  });
});
```

**Herramientas recomendadas:**
- **Jest:** Framework de testing
- **Supertest:** Testing de APIs HTTP
- **MongoDB Memory Server:** BD en memoria para tests
- **Istanbul/nyc:** Cobertura de código

---

## 🌐 Despliegue en Vercel

El proyecto está configurado para despliegue en Vercel como Serverless Function:

```json
{
  "version": 2,
  "builds": [{"src": "app.js", "use": "@vercel/node"}],
  "routes": [{"src": "/(.*)", "dest": "/app.js"}]
}
```

### Variables de entorno en Vercel

Configurar en el dashboard de Vercel:
- `MONGODB_URI`
- `SESSION_SECRET`
- `NODE_ENV=production`

---

## 📊 Modelos de Datos

### Usuario
```javascript
{
  username: String (único),
  email: String (único),
  password: String (encriptado con bcrypt),
  nombreCompleto: String,
  rol: String (enum: 'admin', 'usuario', 'contador'),
  activo: Boolean,
  ultimoAcceso: Date
}
```

### Producto
```javascript
{
  nombre: String,
  categoria: String,
  precio: Number,
  stockActual: Number,
  stockMinimo: Number
}
```

### FacturaCliente
```javascript
{
  numero: String (único),
  puntoVenta: Number,
  clienteId: ObjectId (ref: 'Cliente'),
  clienteInfo: Object,
  empresaInfo: Object,
  fechaEmision: Date,
  fechaVencimiento: Date,
  estatus: String (enum: 'Pendiente', 'Pagada', 'Anulada', 'Parcial'),
  detalles: [Array de productos con productoId ref a Producto],
  subtotalNeto: Number (calculado automáticamente),
  iva21: Number (calculado automáticamente),
  iva105: Number (calculado automáticamente),
  total: Number (calculado automáticamente),
  stockDescontado: Boolean
}
```

### ReciboCobro
```javascript
{
  numero: Number (auto-incremental),
  clienteId: ObjectId (ref: 'Cliente'),
  clienteInfo: Object,
  fechaEmision: Date,
  estatus: String (enum: 'Emitido', 'Anulado'),
  facturasCobradas: [{ facturaId, numero, fecha, total }],
  formasPago: [{ formaPago, referencia, bancoCuenta, fecha, montoNeto }],
  montoCobrado: Number,
  observaciones: String,
  recibidoPor: String
}
```

---

## 🔒 Sistema de Autorización

| Rol | Permisos |
|-----|----------|
| **Admin** | Acceso total + gestión de usuarios |
| **Contador** | Finanzas, facturación, órdenes de pago, notas de crédito/débito, presupuestos |
| **Usuario** | Productos, clientes, proveedores (operaciones básicas) |

### Middlewares de Autorización

Los middlewares están ubicados estratégicamente en el código:

```javascript
// app.js - Línea 54
requireLogin          // Solo usuarios autenticados

// routes/adminRoutes.js - Línea 7  
requireAdmin          // Solo administradores
```

**Nota:** En esta versión, los middlewares están integrados directamente donde se usan (inline) en lugar de estar en un archivo separado. Esto es una decisión de diseño válida para este alcance del proyecto.

---

## 🔄 Evolución del Proyecto a través de las Entregas

### **📦 Entrega 1: Sistema Básico con Persistencia en JSON (Versión 1.0)**
**Fecha:** Abril 2026  
**Objetivos cumplidos:**
- ✅ Configuración inicial del proyecto con Node.js y Express
- ✅ Implementación del patrón MVC
- ✅ Motor de plantillas Pug configurado
- ✅ CRUD completo de productos
- ✅ Persistencia de datos en archivos JSON
- ✅ Rutas dinámicas y parámetros
- ✅ Middleware básico (body-parser, static files)
- ✅ Gestión de sesiones simple
- ✅ Interfaz de usuario funcional

**Tecnologías:** Node.js, Express, Pug, File System (fs)

**Estructura de archivos:**
```
📁 data/
└── productos.json  # Persistencia en JSON
```

**Aprendizajes clave:**
- Fundamentos de Express y routing
- Manejo de archivos con fs (readFile, writeFile)
- Renderizado de vistas con Pug
- Operaciones CRUD básicas

---

### **🗄️ Entrega 2: Migración a Base de Datos (Versión 1.5)**
**Fecha:** Mayo 2026  
**Mejoras implementadas:**
- ✅ Migración completa a MongoDB + Mongoose
- ✅ Diseño de schemas y modelos
- ✅ Validaciones a nivel de base de datos
- ✅ Autenticación básica (login/logout)
- ✅ CRUD de clientes y proveedores
- ✅ Módulo de finanzas inicial (estructura)
- ✅ Conexión a MongoDB Atlas (cloud)
- ✅ Variables de entorno con dotenv
- ✅ Manejo de operaciones asíncronas con async/await
- ✅ Relaciones entre entidades (referencias)

**Nuevas tecnologías:** MongoDB, Mongoose, MongoDB Atlas, dotenv

**Cambios arquitectónicos:**
```javascript
// ANTES (Entrega 1): Persistencia en JSON
const productos = JSON.parse(fs.readFileSync('./data/productos.json'));

// DESPUÉS (Entrega 2): MongoDB + Mongoose
const productos = await Producto.find();
```

**Modelos creados:**
- Usuario
- Producto
- Cliente
- Proveedor
- FacturaCliente (básico)

**Aprendizajes clave:**
- Diseño de schemas con Mongoose
- Operaciones asíncronas (async/await)
- Validaciones con Mongoose validators
- Conexión a base de datos cloud

---

### **🚀 Entrega 3 (Final): Sistema Completo y Desplegado (Versión 2.0)**
**Fecha:** Junio 2026  
**Funcionalidades agregadas:**

#### **🔒 Seguridad mejorada:**
- ✅ Encriptación de contraseñas con bcrypt (10 rounds)
- ✅ Sesiones persistentes en MongoDB (connect-mongo)
- ✅ Protección contra ataques de fuerza bruta
- ✅ Cookies seguras con httpOnly y sameSite
- ✅ Variables de entorno para secretos

```javascript
// Configuración de seguridad
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    touchAfter: 24 * 3600
  }),
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 días
    sameSite: 'lax'
  }
}));
```

#### **👥 Sistema de autorización:**
- ✅ 3 roles diferenciados (admin, contador, usuario)
- ✅ Middlewares de protección por rol
- ✅ Control de acceso granular por módulo

```javascript
// Ejemplo de middleware de autorización
const requireAdmin = (req, res, next) => {
  if (req.session.usuario && req.session.usuario.rol === 'admin') {
    return next();
  }
  res.status(403).render('error', { 
    message: 'Acceso denegado', 
    error: { status: 403 } 
  });
};
```

#### **💰 Módulos financieros completos:**
- ✅ **Facturación a clientes** (con descuento de stock automático)
- ✅ **Facturación de proveedores** (con incremento de stock)
- ✅ **Órdenes de pago** con tracking de estado y múltiples facturas
- ✅ **Recibos de cobro** con selección de facturas pendientes
- ✅ **Cobro múltiple** a clientes (facturas - notas de crédito + notas de débito)
- ✅ **Pago múltiple** a proveedores con generación automática de orden de pago
- ✅ **Notas de crédito** (devoluciones y ajustes negativos)
- ✅ **Notas de débito** (cargos adicionales)
- ✅ **Presupuestos** con fechas de validez
- ✅ **Gestión automática de stock** con historial completo
- ✅ **Dashboard financiero** con estadísticas en tiempo real

```javascript
// Ejemplo: Descuento automático de stock al facturar
facturaSchema.post('save', async function() {
  if (!this.stockDescontado && this.estatus !== 'Anulada') {
    for (const item of this.detalles) {
      await Producto.findOneAndUpdate(
        { id: item.id },
        { $inc: { stockActual: -item.cantidad } }
      );
    }
    this.stockDescontado = true;
    await this.save();
  }
});
```

#### **🛡️ Manejo de errores robusto:**
- ✅ Middleware centralizado de errores (`errorHandler.js`)
- ✅ Páginas personalizadas 404/500 con animaciones
- ✅ Logging de errores en desarrollo
- ✅ Mensajes user-friendly en producción

```javascript
// Middleware de manejo de errores
const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const message = status === 500 && process.env.NODE_ENV === 'production'
    ? 'Error interno del servidor'
    : err.message;
  
  res.status(status).render('error', { message, error: err });
};
```

#### **🎨 Mejoras de UI/UX:**
- ✅ **Diseño responsive completo** (mobile-first)
- ✅ **Navbar simplificado**: 5 módulos principales (Dashboard, Productos, Clientes, Proveedores, Finanzas)
- ✅ **Dashboard interactivo** con cards clickables y estadísticas
- ✅ **Formularios con validación** visual y mensajes de error
- ✅ **Badges de estado** con colores semánticos (Pendiente=amarillo, Pagada=verde, Anulada=rojo)
- ✅ **Animaciones suaves** en hover y transiciones
- ✅ **Footer sticky** (siempre al final de la página)
- ✅ **Páginas de error personalizadas** con iconos animados
- ✅ **Botones "Volver"** en todas las vistas con icono "←"

#### **💻 Calidad de código:**
- ✅ **Unidades relativas (rem)** en todo el CSS para responsive
- ✅ **15+ media queries** para diferentes dispositivos
- ✅ **Código modular** y reutilizable (`stockService.js`)
- ✅ **Comentarios** en código crítico
- ✅ **README completo** con documentación profesional

```css
/* Ejemplo: Responsive grid del dashboard */
.dashboard-modulos {
  display: grid;
  grid-template-columns: repeat(5, 1fr); /* 5 columnas en desktop */
  gap: 1.5rem;
}

@media (max-width: 1400px) {
  .dashboard-modulos {
    grid-template-columns: repeat(3, 1fr); /* 3 columnas en tablets grandes */
  }
}

@media (max-width: 900px) {
  .dashboard-modulos {
    grid-template-columns: repeat(2, 1fr); /* 2 columnas en tablets */
  }
}

@media (max-width: 600px) {
  .dashboard-modulos {
    grid-template-columns: 1fr; /* 1 columna en móviles */
  }
}
```

#### **☁️ Despliegue profesional:**
- ✅ **Vercel Serverless Functions** con configuración optimizada
- ✅ **MongoDB Atlas** en producción con cluster dedicado
- ✅ **Variables de entorno** seguras y separadas por entorno
- ✅ **URL pública** accesible 24/7
- ✅ **HTTPS** automático
- ✅ **CDN global** para assets estáticos

**Nuevas tecnologías:** bcryptjs, express-session, connect-mongo, Vercel

**Estadísticas de la Versión 2.1:**
- 📁 **13 controladores** (lógica de negocio)
- 🗄️ **11 modelos** de Mongoose
- 🛤️ **16 archivos de rutas**
- 📄 **30+ vistas** en Pug
- 🎨 **1 archivo CSS** de 1000+ líneas (completamente responsive)
- 🔧 **1 servicio** reutilizable (stockService)
- ⚙️ **2 middlewares** personalizados (errorHandler, authJWT)

**Comparación de versiones:**

| Característica | v1.0 (JSON) | v1.5 (MongoDB) | v2.1 (Final) |
|----------------|-------------|----------------|--------------|
| Base de datos | ❌ JSON | ✅ MongoDB | ✅ MongoDB Atlas |
| Autenticación | ❌ No | ⚠️ Básica | ✅ Segura (bcrypt) |
| Autorización | ❌ No | ❌ No | ✅ Roles (admin/contador/usuario) |
| Facturación | ❌ No | ⚠️ Básica | ✅ Completa (clientes y proveedores) |
| Gestión de stock | ❌ Manual | ⚠️ Manual | ✅ Automática |
| Notas contables | ❌ No | ❌ No | ✅ Crédito y débito |
| Órdenes de pago | ❌ No | ❌ No | ✅ Completas |
| Recibos de cobro | ❌ No | ❌ No | ✅ Completos |
| Cobro/Pago múltiple | ❌ No | ❌ No | ✅ Con cálculo neto (fact - NC + ND) |
| Presupuestos | ❌ No | ❌ No | ✅ Con validez |
| Manejo de errores | ⚠️ Básico | ⚠️ Básico | ✅ Centralizado |
| Responsive | ⚠️ Parcial | ⚠️ Parcial | ✅ Completo |
| Despliegue | ❌ Local | ❌ Local | ✅ Vercel + Atlas |
| Sesiones | ⚠️ Memoria | ⚠️ Memoria | ✅ Persistentes (BD) |

**Documentación adicional creada:**
- `README.md` completo con toda la información del proyecto
- `.env.example` con plantilla de variables de entorno
- Comentarios en código crítico

---

## 📝 Decisiones Técnicas y Justificaciones

### ¿Por qué express-session en vez de JWT?

**Decisión:** Usamos **express-session + connect-mongo** en lugar de JWT.

**Justificación detallada:**

| Aspecto | express-session | JWT |
|---------|-----------------|-----|
| **Complejidad** | ✅ Simple de implementar | ⚠️ Requiere más configuración |
| **Seguridad** | ✅ Tokens en servidor (BD) | ⚠️ Tokens en cliente |
| **Revocación** | ✅ Inmediata desde servidor | ❌ Difícil sin blacklist |
| **Estado** | ✅ Perfecto para SSR (Pug) | ⚠️ Mejor para APIs REST |
| **Escalabilidad** | ⚠️ Requiere store compartido | ✅ Stateless |
| **Expiración** | ✅ Automática con TTL | ✅ Con claims |

**Conclusión:** Para una aplicación web con renderizado del servidor (Pug), sesiones es la mejor opción. JWT sería ideal si fuera una API REST separada del frontend.

---

### ¿Por qué bcrypt en vez de otros métodos?

**Comparación de algoritmos:**

| Algoritmo | Seguridad | Velocidad | Complejidad |
|-----------|-----------|-----------|-------------|
| **bcrypt** | ✅ Alta | ⚠️ Lenta (por diseño) | ✅ Simple |
| MD5 | ❌ Vulnerable | ✅ Rápida | ✅ Simple |
| SHA-256 | ⚠️ Media | ✅ Rápida | ✅ Simple |
| Argon2 | ✅ Muy alta | ⚠️ Lenta | ⚠️ Compleja |

**Por qué elegimos bcrypt:**
- ✅ Algoritmo probado y ampliamente usado
- ✅ Incluye salt automático (previene rainbow tables)
- ✅ Configurable en número de rounds (10 en nuestro caso)
- ✅ Resistente a ataques de fuerza bruta (intencionalmente lenta)
- ✅ Amplio soporte en Node.js (bcryptjs)
- ✅ Buena documentación y comunidad

---

### ¿Por qué Mongoose en vez de driver nativo de MongoDB?

**Ventajas de Mongoose:**

1. **Schemas y Validaciones**
   ```javascript
   // Con Mongoose: validaciones declarativas
   const productSchema = new Schema({
     precio: { type: Number, required: true, min: 0 }
   });
   
   // Sin Mongoose: validaciones manuales
   if (!producto.precio || producto.precio < 0) {
     throw new Error('Precio inválido');
   }
   ```

2. **Middleware (Hooks)**
   ```javascript
   // Pre-save hook para cálculos automáticos
   facturaSchema.pre('save', function(next) {
     this.total = this.subtotal + this.iva21 + this.iva105;
     next();
   });
   ```

3. **Métodos Personalizados**
   ```javascript
   usuarioSchema.methods.comparePassword = async function(password) {
     return await bcrypt.compare(password, this.password);
   };
   ```

4. **Queries más Legibles**
   ```javascript
   // Con Mongoose
   const productos = await Producto.find({ stock: { $lt: 10 } }).sort('nombre');
   
   // Con driver nativo
   const productos = await db.collection('productos')
     .find({ stock: { $lt: 10 } })
     .sort({ nombre: 1 })
     .toArray();
   ```

**Conclusión:** Mongoose agrega una capa de abstracción que facilita el desarrollo y mantenimiento.

---

### ¿Por qué Pug como motor de plantillas?

**Comparación:**

| Motor | Sintaxis | Curva de Aprendizaje | Performance |
|-------|----------|---------------------|-------------|
| **Pug** | Minimalista | ⚠️ Media | ✅ Alta |
| EJS | HTML + JS | ✅ Fácil | ✅ Alta |
| Handlebars | {{mustache}} | ✅ Fácil | ✅ Alta |

**Por qué Pug:**
- ✅ Código más limpio y conciso
- ✅ Prevención automática de XSS
- ✅ Mixins reutilizables
- ✅ Herencia de layouts
- ✅ Indentación clara
- ✅ Fue requerido en el enunciado de la primera entrega

---

### ¿Por qué Vercel para el despliegue?

**Ventajas de Vercel:**
- ✅ **Gratuito** para proyectos pequeños
- ✅ **Serverless** automático (sin configuración)
- ✅ **Deploy automático** desde GitHub
- ✅ **HTTPS** incluido
- ✅ **CDN global** para assets estáticos
- ✅ **Variables de entorno** fáciles de configurar
- ✅ **Compatible con Express** mediante adaptador

**Alternativas consideradas:**
- Heroku: ⚠️ Ya no tiene plan gratuito
- Railway: ✅ Buena opción, pero menos documentación
- Render: ✅ Similar a Vercel
- AWS/Azure: ⚠️ Demasiado complejo para este alcance

---

## 👥 Integrantes del Equipo y Roles

| Integrante | Rol Principal | Responsabilidades |
|------------|---------------|-------------------|
| **Aiello, Mariana** | Desarrollo de Finanzas + Documentación | Módulo de finanzas, integración de datos, README.md |
| **Flores, Miguel Ángel** | Desarrollo de Clientes + QA | CRUD de clientes, validaciones, testing y demostración |
| **González, Mario** | Infraestructura + Seguridad | MongoDB Atlas, autenticación, sesiones, middlewares |
| **Rodríguez, Raquel** | Desarrollo de Productos + Testing | CRUD de productos, migración de IDs, tests |
| **Thomas, Valeria** | Desarrollo de Proveedores + Documentación | CRUD de proveedores, documento PDF final |

---

## 📚 Bibliografía y Recursos

### Documentación Oficial
- [Node.js Documentation](https://nodejs.org/en/docs/)
- [Express.js Guide](https://expressjs.com/)
- [MongoDB Manual](https://www.mongodb.com/docs/manual/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [Pug Template Engine](https://pugjs.org/api/getting-started.html)
- [Jest Testing Framework](https://jestjs.io/docs/getting-started)

### Tutoriales y Guías
- [MDN Web Docs - Async/Await](https://developer.mozilla.org/es/docs/Learn/JavaScript/Asynchronous/Promises)
- [bcrypt.js - npm](https://www.npmjs.com/package/bcryptjs)
- [express-session - npm](https://www.npmjs.com/package/express-session)
- [connect-mongo - npm](https://www.npmjs.com/package/connect-mongo)

### Videos Educativos
- Curso de Node.js y Express - YouTube
- Tutorial de MongoDB y Mongoose - YouTube
- Autenticación con bcrypt y sesiones - YouTube

---

## 🤖 Uso de Inteligencia Artificial

Durante el desarrollo de este proyecto se utilizaron herramientas de Inteligencia Artificial como **asistentes técnicos** en tareas específicas. Es importante aclarar que:

### **✅ Tareas donde se usó IA:**

1. **Depuración de código:**
   - Identificación de errores de sintaxis
   - Sugerencias de fixes para bugs específicos
   - Explicación de mensajes de error de Mongoose/MongoDB

2. **Optimización de queries:**
   - Mejora de consultas a MongoDB
   - Sugerencias de índices para performance
   - Uso correcto de operadores de Mongoose

3. **Mejores prácticas:**
   - Sugerencias de seguridad (bcrypt rounds, cookie settings)
   - Recomendaciones de estructura de código
   - Patrones de diseño aplicables

4. **Documentación:**
   - Formato de README y archivos .md
   - Estructuración de explicaciones técnicas
   - Revisión de ortografía y redacción

### **❌ Tareas donde NO se usó IA:**

1. **Arquitectura del sistema:**
   - Diseño de base de datos (modelos, relaciones)
   - Decisiones técnicas (sessions vs JWT, bcrypt, Mongoose)
   - Estructura de carpetas y patrón MVC

2. **Lógica de negocio:**
   - Cálculos de facturación e IVA
   - Gestión automática de stock
   - Sistema de roles y permisos
   - Flujos de órdenes de pago y notas contables

3. **Desarrollo core:**
   - Implementación de controladores
   - Creación de modelos y schemas
   - Diseño de rutas y middlewares
   - Interfaz de usuario (HTML/Pug/CSS)

4. **Testing y validación:**
   - Pruebas manuales del sistema
   - Casos de uso y escenarios
   - Validación de funcionalidades

### **📊 Estimación de uso:**

- **Código escrito por el equipo:** ~95%
- **Código sugerido por IA (adaptado):** ~5%
- **Arquitectura y diseño:** 100% del equipo
- **Documentación (estructura):** 70% del equipo, 30% IA (formato)

### **🔍 Metodología de uso:**

1. El equipo desarrollaba la funcionalidad completa
2. Si surgía un error o duda, se consultaba a la IA
3. Se evaluaban las sugerencias de la IA
4. Se adaptaba el código según nuestro contexto
5. Se probaba exhaustivamente

**Conclusión:** La IA fue una **herramienta de apoyo**, no el desarrollador principal. Todo el código fue revisado, adaptado y probado por el equipo.

---

## 🎥 Video Demostrativo del Equipo

> **📹 Enlace al video**: [Insertar enlace de Google Meet/Zoom aquí]

**Contenido del video grupal:**
- ✅ Presentación de cada integrante del equipo en cámara
- ✅ Demostración completa de funcionalidades por módulo
- ✅ Explicación de la arquitectura y decisiones técnicas
- ✅ Casos de uso principales (registro, login, facturación, stock)
- ✅ Manejo de errores (404, 500, validaciones)
- ✅ Explicación del código por cada integrante
- ✅ Demostración de pruebas manuales ejecutadas
- ✅ Conclusiones y aprendizajes del equipo

**⏱️ Duración recomendada:** 15-20 minutos  
**📝 Requisito:** Todos los integrantes deben aparecer y explicar su parte del proyecto

---

## 🐛 Problemas Conocidos y Limitaciones

### **Limitaciones Actuales:**

1. **Paginación**
   - ⚠️ Los listados muestran todos los registros
   - Con grandes volúmenes de datos puede afectar performance
   - Solución futura: Implementar paginación con límite de 20-50 registros por página

2. **Búsqueda y Filtros**
   - ⚠️ Filtros básicos implementados en cuentas por cobrar/pagar
   - Falta buscador general por texto libre
   - Solución futura: Agregar búsqueda global con autocompletado

3. **Generación de PDFs**
   - ⚠️ Las facturas, órdenes de pago y recibos se pueden imprimir desde el navegador
   - No se generan PDFs descargables directamente
   - Solución futura: Librería como pdfkit o puppeteer

4. **Tests Automatizados**
   - ⚠️ No implementados
   - Se realizaron pruebas manuales exhaustivas
   - Solución futura: Jest + Supertest

### **Mejoras Futuras (Roadmap):**

**Corto Plazo (1-2 meses):**
- [ ] Implementar paginación en todos los listados
- [ ] Agregar búsqueda global por texto en productos, clientes y proveedores
- [ ] Exportación de facturas y comprobantes a PDF
- [ ] Notificaciones de vencimiento de facturas

**Mediano Plazo (3-6 meses):**
- [ ] Tests automatizados con Jest/Supertest
- [ ] Dashboard con gráficos estadísticos (Chart.js)
- [ ] Notificaciones de stock bajo vía email
- [ ] Historial de cambios (audit log)
- [ ] Backup automático de base de datos

**Largo Plazo (6+ meses):**
- [ ] API REST para integración con otros sistemas
- [ ] App móvil (React Native)
- [ ] Reportes avanzados (ventas, compras, rentabilidad)
- [ ] Integración con AFIP (factura electrónica)
- [ ] Multi-tenant (múltiples empresas)
- [ ] Caché con Redis
- [ ] Logs centralizados con Winston/Elasticsearch

---

## 🎓 Conclusiones del Equipo

### **¿Qué aprendimos este cuatrimestre?**

1. **Desarrollo Backend Completo:**
   - Manejo profesional de Node.js y Express
   - Arquitectura MVC aplicada a proyectos reales
   - Trabajo con bases de datos NoSQL (MongoDB)
   - Implementación de sistemas de autenticación y autorización

2. **Mejores Prácticas:**
   - Importancia de la seguridad desde el diseño (bcrypt, sesiones)
   - Manejo centralizado de errores
   - Validaciones a nivel de modelo y controlador
   - Separación de responsabilidades (SoC)

3. **Trabajo en Equipo:**
   - Organización en roles especializados
   - Resolución de conflictos de merge en Git
   - Comunicación efectiva entre módulos
   - Importancia de la documentación compartida

4. **Deploy y DevOps:**
   - Configuración de entornos (desarrollo/producción)
   - Variables de entorno y secretos
   - Despliegue en servicios cloud (Vercel)
   - Conexión a bases de datos remotas (MongoDB Atlas)

### **¿Qué dificultades tuvimos y cómo las resolvimos?**

| Dificultad | Solución Implementada |
|------------|----------------------|
| **Gestión automática de stock** | Implementamos un servicio centralizado (`stockService.js`) y hooks de Mongoose (`pre/post save`) |
| **Cálculos de IVA en facturas** | Creamos métodos virtuales en el modelo que calculan automáticamente antes de guardar |
| **Sincronización entre módulos** | Usamos referencias de Mongoose y poblamos datos cuando es necesario |
| **Anulación de facturas** | Agregamos lógica de reversión de stock y estado `stockDescontado` para evitar doble descuento |
| **Control de acceso por roles** | Middlewares de autorización que verifican rol antes de permitir acceso a rutas |
| **Deploy en Vercel** | Ajustamos la configuración (`vercel.json`) y variables de entorno específicas para serverless |
| **Sesiones persistentes** | Usamos `connect-mongo` para almacenar sesiones en MongoDB y no perderlas al reiniciar |

### **¿Qué parte del desarrollo Backend les interesó más?**

- **Mariana:** El módulo de finanzas y cómo integrar múltiples documentos (facturas, notas, órdenes de pago)
- **Miguel:** La gestión de clientes y cómo relacionar entidades con referencias de MongoDB
- **Mario:** La implementación de seguridad (bcrypt, sesiones, middlewares de autorización)
- **Raquel:** El control de stock automático y cómo evitar inconsistencias de datos
- **Valeria:** El sistema de proveedores y cómo conectar compras con inventario

### **¿Qué deberíamos reforzar?**

1. **Testing Automatizado:**
   - Aprender Jest y Supertest
   - Implementar tests unitarios y de integración
   - Cobertura de código (code coverage)

2. **Patrones de Diseño:**
   - Repository pattern para abstraer acceso a datos
   - Service layer más robusto
   - Dependency injection

3. **Performance y Optimización:**
   - Caché con Redis
   - Índices en MongoDB
   - Lazy loading y paginación

4. **APIs RESTful:**
   - Diseño de APIs desacopladas del frontend
   - Versionado de APIs (v1, v2)
   - Documentación con Swagger/OpenAPI

5. **DevOps y CI/CD:**
   - Pipelines de integración continua
   - Tests automáticos en cada push
   - Deploy automático con GitHub Actions

---

## 📦 Entrega del Proyecto

### **Estructura de Entrega:**

```
📁 Entrega_Final_404Solution/
├── 📁 Version_1.0/           # Código de la primera entrega (JSON)
├── 📁 Version_1.5/           # Código de la segunda entrega (MongoDB básico)
├── 📁 Version_2.0/           # Código actual (Sistema completo)
└── 📄 Documentacion_Final.pdf # Documento completo con todos los requisitos
```

## 📞 Contacto y Soporte

**Institución:** Instituto de Formación Técnica Superior N° 29 (IFTS 29)  
**Materia:** Desarrollo de Sistemas Web - Back End  
**Carrera:** Tecnicatura Superior en Desarrollo de Software  
**Período:** 2026 - 1er Cuatrimestre  
**Grupo:** 404Solution

**Sistema Desplegado:** [https://404-solutions-entrega-final.vercel.app](https://404-solutions-entrega-final.vercel.app/login)

---

## 📄 Licencia

ISC © 2026 TodoStock S.A. - IFTS 29

---

**Última actualización:** Junio 2026  
**Versión:** 2.1.0  
**Estado:** ✅ Listo para entrega final
