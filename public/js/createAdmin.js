// // Ejecutar en la consola para crear el admin: node scripts/createAdmin.js

// const mongoose = require('mongoose');
// const Usuario = require('../models/Usuario');
// require('dotenv').config();

// const createAdmin = async () => {
//   try {
//     await mongoose.connect(process.env.MONGODB_URI);
    
//     const adminExists = await Usuario.findOne({ username: 'admin' });
    
//     if (!adminExists) {
//       const admin = new Usuario({
//         username: 'admin',
//         email: 'admin@todostock.com',
//         password: 'admin123',
//         nombreCompleto: 'Administrador',
//         rol: 'admin',
//         activo: true
//       });
      
//       await admin.save();
//       console.log('✅ Usuario administrador creado');
//       console.log('   Usuario: admin');
//       console.log('   Contraseña: admin123');
//     } else {
//       console.log('⚠️ El usuario administrador ya existe');
//     }
    
//     process.exit(0);
//   } catch (error) {
//     console.error('❌ Error:', error);
//     process.exit(1);
//   }
// };

// createAdmin();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Conectar a MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error.message);
    process.exit(1);
  }
};

// Definir el schema de Usuario (mismo que en models/Usuario.js)
const usuarioSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true, lowercase: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  nombreCompleto: { type: String, required: true },
  rol: { type: String, enum: ['admin', 'usuario', 'contador'], default: 'usuario' },
  activo: { type: Boolean, default: true },
  ultimoAcceso: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
});

const Usuario = mongoose.model('Usuario', usuarioSchema);

// Función para crear administrador
const createAdmin = async () => {
  try {
    await connectDB();
    
    // Verificar si ya existe un administrador
    const adminExists = await Usuario.findOne({ 
      $or: [
        { username: 'admin' },
        { email: 'admin@todostock.com' }
      ]
    });
    
    if (adminExists) {
      console.log('⚠️ El usuario administrador ya existe:');
      console.log(`   Usuario: ${adminExists.username}`);
      console.log(`   Email: ${adminExists.email}`);
      console.log(`   Rol: ${adminExists.rol}`);
      
      // Preguntar si quiere resetear la contraseña
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      readline.question('¿Desea resetear la contraseña del administrador? (s/n): ', async (answer) => {
        if (answer.toLowerCase() === 's') {
          const salt = await bcrypt.genSalt(10);
          const newPassword = 'admin123';
          const hashedPassword = await bcrypt.hash(newPassword, salt);
          
          await Usuario.updateOne(
            { _id: adminExists._id },
            { password: hashedPassword }
          );
          console.log('✅ Contraseña reseteada a: admin123');
        }
        readline.close();
        process.exit(0);
      });
    } else {
      // Crear nuevo administrador
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      const admin = new Usuario({
        username: 'admin',
        email: 'admin@todostock.com',
        password: hashedPassword,
        nombreCompleto: 'Administrador del Sistema',
        rol: 'admin',
        activo: true
      });
      
      await admin.save();
      
      console.log('✅ Usuario administrador creado exitosamente:');
      console.log('   📝 Usuario: admin');
      console.log('   📝 Contraseña: admin123');
      console.log('   📝 Email: admin@todostock.com');
      console.log('   📝 Rol: admin');
    }
    
    setTimeout(() => process.exit(0), 1000);
  } catch (error) {
    console.error('❌ Error creando administrador:', error);
    process.exit(1);
  }
};

createAdmin();