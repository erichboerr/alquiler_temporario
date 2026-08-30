"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("periodos", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      mesId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "meses",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE", // Si se borra la tarjeta de mes, se borran sus períodos
      },
      // DATEONLY: guardamos solo fecha (sin hora), no importa la hora de entrada/salida acá
      fechaDesde: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      fechaHasta: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      // Nullable a propósito: si disponible = false, el precio puede quedar vacío
      // (se muestra "No disponible" y no importa el precio)
      precio: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      disponible: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      // Orden del renglón dentro de la tarjeta (arriba a abajo)
      orden: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
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
    await queryInterface.dropTable("periodos");
  },
};
