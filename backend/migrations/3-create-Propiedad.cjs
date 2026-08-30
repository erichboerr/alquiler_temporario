"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("propiedades", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      nombre: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      direccion: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      descripcion: {
        // Texto libre opcional (bajada debajo del título, si se quiere)
        type: Sequelize.TEXT,
        allowNull: true,
      },
      habitaciones: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      banos: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      // Lista libre de características: ["Living comedor y cocina", "Patio con parrilla", ...]
      // Se guarda como JSONB para no tener que armar una tabla aparte para algo tan simple,
      // y porque el admin la va a editar como una lista de texto, no como filas relacionales.
      caracteristicas: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: [],
      },
      whatsappNumero: {
        // Formato internacional sin '+' ni espacios, ej: 5492255123456 (lo que pide wa.me)
        type: Sequelize.STRING,
        allowNull: true,
      },
      whatsappMensaje: {
        // Mensaje predefinido que se abre en WhatsApp al tocar el botón de cada tarjeta
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("propiedades");
  },
};
