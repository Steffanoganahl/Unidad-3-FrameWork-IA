
const bcrypt = require('bcryptjs');
const prisma = require('../src/lib/prisma');

async function createAdmin() {
  try {
    const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

    if (
      typeof ADMIN_NAME !== 'string' ||
      typeof ADMIN_EMAIL !== 'string' ||
      typeof ADMIN_PASSWORD !== 'string' ||
      !ADMIN_NAME.trim() ||
      !ADMIN_EMAIL.trim() ||
      !ADMIN_PASSWORD
    ) {
      throw new Error('Faltan datos para crear el administrador.');
    }

    const name = ADMIN_NAME.trim();
    const email = ADMIN_EMAIL.trim().toLowerCase();

    if (name.length < 2 || name.length > 80) {
      throw new Error('El nombre debe tener entre 2 y 80 caracteres.');
    }

    if (ADMIN_PASSWORD.length < 8 || Buffer.byteLength(ADMIN_PASSWORD, 'utf8') > 72) {
      throw new Error('La contraseña debe tener al menos 8 caracteres y no superar 72 bytes.');
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new Error(
        'Ese correo ya está registrado. No se modificará su rol.'
      );
    }

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

    const admin = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'ADMIN'
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });

    console.log('Administrador creado correctamente:');
    console.log(admin);

  } catch (error) {
    console.error('Error:', error.message);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
