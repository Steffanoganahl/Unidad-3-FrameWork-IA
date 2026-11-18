
const taskService = require('../services/task.service');

const VALID_STATUSES = ['PENDING', 'IN_PROGRESS', 'COMPLETED'];

const isValidUUID = (value) => {
  return typeof value === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
};

const isValidRequestBody = (body) => {
  return body !== null &&
    typeof body === 'object' &&
    !Array.isArray(body);
};

class TaskController {

  async create(req, res, next) {
    try {
      if (!isValidRequestBody(req.body)) {
        return res.status(400).json({
          status: 'error',
          message: 'El cuerpo de la solicitud debe ser un objeto válido'
        });
      }

      const { title, description, status } = req.body;

      if (typeof title !== 'string' || !title.trim()) {
        return res.status(400).json({
          status: 'error',
          message: 'El título de la tarea es obligatorio y debe ser texto'
        });
      }

      if (description !== undefined &&
          description !== null &&
          typeof description !== 'string') {
        return res.status(400).json({
          status: 'error',
          message: 'La descripción debe ser texto'
        });
      }

      if (status !== undefined && !VALID_STATUSES.includes(status)) {
        return res.status(400).json({
          status: 'error',
          message: `El estado no es válido. Opciones: ${VALID_STATUSES.join(', ')}`
        });
      }

      const newTask = await taskService.createTask(req.user.id, {
        title: title.trim(),
        description,
        status
      });

      return res.status(201).json({
        status: 'success',
        message: 'Tarea creada exitosamente',
        data: newTask
      });

    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const tasks = await taskService.getTasks(req.user);

      return res.status(200).json({
        status: 'success',
        results: tasks.length,
        data: tasks
      });

    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const taskId = req.params.id;

      if (!isValidUUID(taskId)) {
        return res.status(400).json({
          status: 'error',
          message: 'El identificador UUID de la tarea no es válido'
        });
      }

      const task = await taskService.getTaskById(taskId, req.user);

      return res.status(200).json({
        status: 'success',
        data: task
      });

    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      if (!isValidRequestBody(req.body)) {
        return res.status(400).json({
          status: 'error',
          message: 'El cuerpo de la solicitud debe ser un objeto válido'
        });
      }

      const taskId = req.params.id;

      if (!isValidUUID(taskId)) {
        return res.status(400).json({
          status: 'error',
          message: 'El identificador UUID de la tarea no es válido'
        });
      }

      const { title, description, status } = req.body;

      if (
        title !== undefined &&
        (typeof title !== 'string' || !title.trim())
      ) {
        return res.status(400).json({
          status: 'error',
          message: 'El título debe ser texto y no puede estar vacío'
        });
      }

      if (
        description !== undefined &&
        description !== null &&
        typeof description !== 'string'
      ) {
        return res.status(400).json({
          status: 'error',
          message: 'La descripción debe ser texto'
        });
      }

      if (status !== undefined && !VALID_STATUSES.includes(status)) {
        return res.status(400).json({
          status: 'error',
          message: `El estado no es válido. Opciones: ${VALID_STATUSES.join(', ')}`
        });
      }

      if (
        title === undefined &&
        description === undefined &&
        status === undefined
      ) {
        return res.status(400).json({
          status: 'error',
          message: 'Debe proporcionar al menos un campo para actualizar'
        });
      }

      const updateData = {
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && { description }),
        ...(status !== undefined && { status })
      };

      const updatedTask = await taskService.updateTask(
        taskId,
        updateData,
        req.user
      );

      return res.status(200).json({
        status: 'success',
        message: 'Tarea actualizada exitosamente',
        data: updatedTask
      });

    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const taskId = req.params.id;

      if (!isValidUUID(taskId)) {
        return res.status(400).json({
          status: 'error',
          message: 'El identificador UUID de la tarea no es válido'
        });
      }

      const result = await taskService.deleteTask(taskId, req.user);

      return res.status(200).json({
        status: 'success',
        message: result.message
      });

    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TaskController();
