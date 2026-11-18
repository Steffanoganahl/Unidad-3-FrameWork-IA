
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

const authRoutes = require('./routes/auth.routes');
const taskRoutes = require('./routes/task.routes');
const adminRoutes = require('./routes/admin.routes');
const errorHandler = require('./middlewares/error.middleware');

const app = express();

// 1. Configuración de seguridad e infraestructura
app.use(helmet());

// La aplicación sirve su frontend y API desde el mismo origen.
// Si se necesita otro origen, configurar CORS mediante una variable
// de entorno específica.
const allowedOrigin = process.env.CORS_ORIGIN;

app.use(cors({
  origin: allowedOrigin || false
}));

app.use(express.json({ limit: '10kb' }));

// 2. Servir frontend estático
app.use(express.static(path.join(__dirname, '../public')));

// 3. Información general de la API
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API REST - Sistema de Gestión de Tareas Bibliotecarias en ejecución',
    version: '1.0.0',
    endpoints: {
      health: '/api/v1/health',
      auth: '/api/v1/auth',
      tasks: '/api/v1/tasks',
      admin: '/api/v1/admin'
    }
  });
});

app.get('/api/v1', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API REST - Sistema de Gestión de Tareas Bibliotecarias en ejecución',
    version: '1.0.0',
    endpoints: {
      health: '/api/v1/health',
      auth: {
        register: 'POST /api/v1/auth/register',
        login: 'POST /api/v1/auth/login',
        me: 'GET /api/v1/auth/me'
      },
      tasks: {
        list: 'GET /api/v1/tasks',
        getById: 'GET /api/v1/tasks/:id',
        create: 'POST /api/v1/tasks',
        update: 'PUT /api/v1/tasks/:id',
        delete: 'DELETE /api/v1/tasks/:id'
      },
      admin: {
        users: 'GET /api/v1/admin/users'
      }
    }
  });
});

// 4. Verificación de estado
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime()
  });
});

// 5. Montaje de rutas
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/admin', adminRoutes);

// 6. Rutas inexistentes
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
  });
});

// 7. Manejo centralizado de errores
app.use(errorHandler);

module.exports = app;
