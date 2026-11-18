const { PrismaClient } = require('@prisma/client');

// Instancia única para reutilizar la conexión en toda la API
const prisma = new PrismaClient();

module.exports = prisma;