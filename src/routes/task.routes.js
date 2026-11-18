const express = require('express');
const router = express.Router();
const taskController = require('../controllers/task.controller');
const authenticateJWT = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');

// 1. Proteger todas las rutas de tareas: requieren token JWT válido
router.use(authenticateJWT);

// 2. Rutas accesibles tanto para rol USER como ADMIN
// Nota: La capa de servicio se encarga del control a nivel de objeto (USER solo ve/edita lo suyo)
router.get('/', (req, res, next) => taskController.getAll(req, res, next));
router.get('/:id', (req, res, next) => taskController.getById(req, res, next));
router.post('/', (req, res, next) => taskController.create(req, res, next));
router.put('/:id', (req, res, next) => taskController.update(req, res, next));

// 3. Ruta restringida estrictamente a Administradores
router.delete('/:id', authorize(['ADMIN']), (req, res, next) => taskController.delete(req, res, next));

module.exports = router;