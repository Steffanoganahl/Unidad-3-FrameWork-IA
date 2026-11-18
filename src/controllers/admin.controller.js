
const adminService = require('../services/admin.service');

class AdminController {
  /**
   * GET /api/v1/admin/users
   * Consulta todos los usuarios registrados.
   */
  async getAllUsers(req, res, next) {
    try {
      const users = await adminService.getAllUsers();

      return res.status(200).json({
        status: 'success',
        results: users.length,
        data: users
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminController();
