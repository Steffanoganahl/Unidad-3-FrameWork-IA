const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/user.repository');

class AuthService {
  /**
   * Registra un nuevo usuario con contraseña hasheada y rol asignado
   */
  async register({ name, email, password }) {
    // 1. Verificar si el usuario ya existe por su correo
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      const error = new Error('El correo electrónico ya se encuentra registrado');
      error.statusCode = 400;
      throw error;
    }

    // 2. Hashear la contraseña con bcrypt (10 rondas de salt por seguridad)
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 3. El registro público siempre asigna el rol USER
    const assignedRole = 'USER';

    // 4. Persistir a través del repositorio
    const newUser = await userRepository.create({
      name,
      email,
      password: hashedPassword,
      role: assignedRole
    });

    return newUser;
  }

  /**
   * Valida credenciales de acceso y emite un JWT firmado
   */
  async login({ email, password }) {
    if (!process.env.JWT_SECRET) {
      const error = new Error('La configuración de autenticación no está disponible.');
      error.statusCode = 500;
      throw error;
    }
    // 1. Buscar usuario por email
    const user = await userRepository.findByEmail(email);
    if (!user) {
      const error = new Error('Credenciales inválidas');
      error.statusCode = 401;
      throw error;
    }

    // 2. Comparar la contraseña en texto plano contra el hash almacenado
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      const error = new Error('Credenciales inválidas');
      error.statusCode = 401;
      throw error;
    }

    // 3. Construir el payload del token (sin incluir datos confidenciales como contraseñas)
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    // 4. Firmar el token JWT
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '2h'
    });

    // 5. Retornar el token y los datos básicos del usuario autenticado
    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    };
  }

  /**
   * Obtiene la información del perfil del usuario autenticado
   */
  async getProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      const error = new Error('Usuario no encontrado');
      error.statusCode = 404;
      throw error;
    }
    return user;
  }
}

module.exports = new AuthService();