const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authenticateJWT = require('../middlewares/auth.middleware');

// Rutas públicas
router.post('/register', (req, res, next) => authController.register(req, res, next));
router.post('/login', (req, res, next) => authController.login(req, res, next));

// Ruta protegida (requiere token JWT en cabecera Authorization: Bearer <token>)
router.get('/me', authenticateJWT, (req, res, next) => authController.getProfile(req, res, next));

module.exports = router;