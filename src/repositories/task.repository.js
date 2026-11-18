
const prisma = require('../lib/prisma');

class TaskRepository {
  /**
   * Crea una nueva tarea asociada al UUID del usuario
   */
  async create(taskData) {
    return await prisma.task.create({
      data: taskData
    });
  }

  /**
   * Busca una tarea por su UUID primario
   */
  async findById(id) {
    return await prisma.task.findUnique({
      where: { id: String(id) }
    });
  }

  /**
   * Obtiene todas las tareas del sistema (Para ADMIN)
   */
  async findAll() {
    return await prisma.task.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Obtiene las tareas del usuario autenticado (Para USER)
   */
  async findByUserId(userId) {
    return await prisma.task.findMany({
      where: { userId: String(userId) },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Actualiza los datos de una tarea por su UUID
   */
  async update(id, taskData) {
    return await prisma.task.update({
      where: { id: String(id) },
      data: taskData
    });
  }

  /**
   * Elimina una tarea por su UUID
   */
  async delete(id) {
    return await prisma.task.delete({
      where: { id: String(id) }
    });
  }
}

module.exports = new TaskRepository();
