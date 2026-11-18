
const authService = require('../services/auth.service');

class AuthController {

  /**
   * Endpoint de Registro: POST /api/v1/auth/register
   */
  async register(req, res, next) {
    try {
      const { name, email, password } = req.body || {};

      // 1. Validar campos obligatorios y tipos
      if (
        typeof name !== 'string' ||
        typeof email !== 'string' ||
        typeof password !== 'string' ||
        !name.trim() ||
        !email.trim() ||
        !password
      ) {
        return res.status(400).json({
          status: 'error',
          message: 'Debe ingresar un nombre, correo electrónico y contraseña válidos'
        });
      }

      const normalizedName = name.trim();
      const normalizedEmail = email.trim().toLowerCase();

      // 2. Validar longitud del nombre
      if (normalizedName.length < 2 || normalizedName.length > 80) {
        return res.status(400).json({
          status: 'error',
          message: 'El nombre debe contener entre 2 y 80 caracteres'
        });
      }

      // 3. Validar formato del correo
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(normalizedEmail) || normalizedEmail.length > 254) {
        return res.status(400).json({
          status: 'error',
          message: 'El formato del correo electrónico ingresado no es válido'
        });
      }

      // 4. Validar contraseña
      if (password.length < 6 || password.length > 72) {
        return res.status(400).json({
          status: 'error',
          message: 'La contraseña debe contener entre 6 y 72 caracteres'
        });
      }

      // 5. Registrar usuario sin aceptar roles desde el cliente
      const newUser = await authService.register({
        name: normalizedName,
        email: normalizedEmail,
        password
      });

      // 6. Devolver únicamente datos públicos
      return res.status(201).json({
        status: 'success',
        message: 'Usuario registrado exitosamente',
        data: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role
        }
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Endpoint de Login: POST /api/v1/auth/login
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body || {};

      if (
        typeof email !== 'string' ||
        typeof password !== 'string' ||
        !email.trim() ||
        !password
      ) {
        return res.status(400).json({
          status: 'error',
          message: 'Debe ingresar su correo electrónico y contraseña'
        });
      }

      const normalizedEmail = email.trim().toLowerCase();

      const result = await authService.login({
        email: normalizedEmail,
        password
      });

      return res.status(200).json({
        status: 'success',
        message: 'Inicio de sesión exitoso',
        data: result
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Endpoint de Perfil: GET /api/v1/auth/me
   */
  async getProfile(req, res, next) {
    try {
      const profile = await authService.getProfile(req.user.id);

      if (!profile) {
        return res.status(404).json({
          status: 'error',
          message: 'Usuario no encontrado'
        });
      }

      return res.status(200).json({
        status: 'success',
        data: {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          role: profile.role
        }
      });

    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
