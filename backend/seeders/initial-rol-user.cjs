'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface, Sequelize) {

    // --- 1. Crear roles base ---
    await queryInterface.bulkInsert('roles', [
      {
        nombre: 'Root',
        descripcion: 'Administrador total del sistema',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'Administrador',
        descripcion: 'Administrador con permisos limitados',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    // --- 2. Obtener el ID del rol Root dinámicamente ---
    // No asumimos que Root es el ID 1 — puede haber registros previos
    // o el autoincrement puede no arrancar desde 1 en todos los ambientes.
    // Buscamos por 'nombre' que tiene restricción UNIQUE, así el resultado es siempre exacto.
    const [roles] = await queryInterface.sequelize.query(
      `SELECT id FROM roles WHERE nombre = 'Root' LIMIT 1`
    );

    if (!roles || roles.length === 0) {
      throw new Error('No se encontró el rol Root después de insertarlo. Seed abortado.');
    }

    const rootRolId = roles[0].id;

    // --- 3. Crear usuario Root inicial ---
    // La password se hashea acá porque el seeder usa queryInterface directamente
    // (no pasa por los hooks de Sequelize que hashean automáticamente en el modelo)
    const hashedPassword = await bcrypt.hash('Root123', 10);

    await queryInterface.bulkInsert('usuarios', [
      {
        // El username se guarda en lowercase para que coincida con la normalización
        // que aplica auth.service.js al momento del login (normalizeUser)
        user: 'root',
        password: hashedPassword,
        rolId: rootRolId, // ID obtenido dinámicamente, no hardcodeado
        flagHabilitado: true,
        createdAt: new Date(),
        updatedAt: new Date()
        // deletedAt: null — no hace falta, PostgreSQL lo deja NULL por defecto
      }
    ]);

    console.log(`✅ Seed completado. Usuario: root / Root123 (rol Root, id: ${rootRolId})`);
    console.log('⚠️  Cambiá la contraseña de Root apenas inicies sesión.');
  },

  async down(queryInterface, Sequelize) {
    // Primero usuarios (FK), después roles — el orden importa por la restricción RESTRICT
    await queryInterface.bulkDelete('usuarios', null, {});
    await queryInterface.bulkDelete('roles', null, {});
  }
};