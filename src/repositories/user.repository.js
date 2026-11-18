
const prisma = require('../lib/prisma');

class UserRepository {
  /**
   * Busca un usuario por email.
   * Incluye password hasheada para validar el login.
   */
  async findByEmail(email) {
    return await prisma.user.findUnique({
      where: { email: String(email).trim().toLowerCase() },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        role: true
      }
    });
  }

  /**
   * Busca un usuario por UUID sin exponer su contraseña.
   */
  async findById(id) {
    return await prisma.user.findUnique({
      where: { id: String(id) },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }

  /**
   * Obtiene todos los usuarios sin incluir contraseñas.
   */
  async findAll() {
    return await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  /**
   * Registra un nuevo usuario.
   */
  async create(userData) {
    return await prisma.user.create({
      data: userData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });
  }
}

module.exports = new UserRepository();
