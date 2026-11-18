
const taskRepository = require('../repositories/task.repository');

const VALID_STATUSES = [
  'PENDING',
  'IN_PROGRESS',
  'COMPLETED'
];

class TaskService {

  // Validar identidad y rol del usuario
  validateUser(user) {
    if (
      !user ||
      !user.id ||
      !['USER', 'ADMIN'].includes(user.role)
    ) {
      const error = new Error('Usuario no autorizado');
      error.statusCode = 401;
      throw error;
    }
  }

  async createTask(userId, { title, description, status } = {}) {

    if (!userId) {
      const error = new Error('Usuario no autorizado');
      error.statusCode = 401;
      throw error;
    }

    if (typeof title !== 'string' || title.trim() === '') {
      const error = new Error('El título de la tarea es obligatorio y debe ser texto');
      error.statusCode = 400;
      throw error;
    }

    if (
      description !== undefined &&
      description !== null &&
      typeof description !== 'string'
    ) {
      const error = new Error('La descripción debe ser texto');
      error.statusCode = 400;
      throw error;
    }

    const taskStatus = status || 'PENDING';

    if (!VALID_STATUSES.includes(taskStatus)) {
      const error = new Error('El estado de la tarea no es válido');
      error.statusCode = 400;
      throw error;
    }

    return await taskRepository.create({
      title: title.trim(),
      description: description ? description.trim() : null,
      status: taskStatus,
      userId: String(userId)
    });
  }

  async getTasks(user) {

    this.validateUser(user);

    if (user.role === 'ADMIN') {
      return await taskRepository.findAll();
    }

    return await taskRepository.findByUserId(user.id);
  }

  async getTaskById(taskId, user) {

    this.validateUser(user);

    const task = await taskRepository.findById(taskId);

    if (!task) {
      const error = new Error('Tarea no encontrada');
      error.statusCode = 404;
      throw error;
    }

    if (
      user.role !== 'ADMIN' &&
      String(task.userId) !== String(user.id)
    ) {
      const error = new Error(
        'Acceso denegado: no tienes permisos para ver esta tarea'
      );
      error.statusCode = 403;
      throw error;
    }

    return task;
  }

  async updateTask(taskId, updateData, user) {

    this.validateUser(user);

    const task = await taskRepository.findById(taskId);

    if (!task) {
      const error = new Error('Tarea no encontrada');
      error.statusCode = 404;
      throw error;
    }

    if (
      user.role !== 'ADMIN' &&
      String(task.userId) !== String(user.id)
    ) {
      const error = new Error(
        'Acceso denegado: no tienes permisos para modificar esta tarea'
      );
      error.statusCode = 403;
      throw error;
    }

    if (
      !updateData ||
      typeof updateData !== 'object' ||
      Array.isArray(updateData)
    ) {
      const error = new Error('Los datos de actualización no son válidos');
      error.statusCode = 400;
      throw error;
    }

    const dataToUpdate = {};

    if (updateData.title !== undefined) {

      if (
        typeof updateData.title !== 'string' ||
        updateData.title.trim() === ''
      ) {
        const error = new Error('El título debe ser un texto no vacío');
        error.statusCode = 400;
        throw error;
      }

      dataToUpdate.title = updateData.title.trim();
    }

    if (updateData.description !== undefined) {

      if (
        updateData.description !== null &&
        typeof updateData.description !== 'string'
      ) {
        const error = new Error('La descripción debe ser texto o null');
        error.statusCode = 400;
        throw error;
      }

      dataToUpdate.description =
        updateData.description === null ||
        updateData.description.trim() === ''
          ? null
          : updateData.description.trim();
    }

    if (updateData.status !== undefined) {

      if (!VALID_STATUSES.includes(updateData.status)) {
        const error = new Error('El estado de la tarea no es válido');
        error.statusCode = 400;
        throw error;
      }

      dataToUpdate.status = updateData.status;
    }

    if (Object.keys(dataToUpdate).length === 0) {
      const error = new Error('No se proporcionaron datos para actualizar');
      error.statusCode = 400;
      throw error;
    }

    return await taskRepository.update(taskId, dataToUpdate);
  }

  async deleteTask(taskId, user) {

    this.validateUser(user);

    if (user.role !== 'ADMIN') {
      const error = new Error(
        'Acceso denegado: solo un administrador puede eliminar tareas'
      );
      error.statusCode = 403;
      throw error;
    }

    const task = await taskRepository.findById(taskId);

    if (!task) {
      const error = new Error('Tarea no encontrada');
      error.statusCode = 404;
      throw error;
    }

    await taskRepository.delete(taskId);

    return {
      message: 'Tarea eliminada exitosamente'
    };
  }
}

module.exports = new TaskService();
