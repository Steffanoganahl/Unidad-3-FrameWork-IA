
const userRepository = require('../repositories/user.repository');

class AdminService {
  /**
   * Obtiene todos los usuarios registrados.
   */
  async getAllUsers() {
    return await userRepository.findAll();
  }
}

module.exports = new AdminService();
