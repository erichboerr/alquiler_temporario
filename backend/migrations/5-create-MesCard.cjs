"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("meses", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      propiedadId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "propiedades",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      // Título de la tarjeta, ej: "Diciembre". Texto libre: el admin podría
      // poner "Diciembre - Fiestas" si quisiera, no está atado a un enum de meses.
      titulo: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      // Orden de aparición de las tarjetas en la landing (izquierda a derecha / arriba a abajo)
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
    await queryInterface.dropTable("meses");
  },
};
