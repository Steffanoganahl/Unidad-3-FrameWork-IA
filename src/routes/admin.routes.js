
const express = require('express');
const router = express.Router();

const adminController = require('../controllers/admin.controller');
const authenticateJWT = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');

// Todas las rutas requieren autenticación y rol ADMIN.
router.use(authenticateJWT);
router.use(authorize(['ADMIN']));

// Consultar todos los usuarios.
router.get('/users', (req, res, next) =>
  adminController.getAllUsers(req, res, next)
);

module.exports = router;
