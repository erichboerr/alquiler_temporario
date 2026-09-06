"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("temporadas", {
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
      // Etiqueta libre para identificar la temporada, ej: "2026-2027"
      etiqueta: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      // Solo una temporada por propiedad debería estar activa a la vez
      // (eso se controla a nivel service, no con una constraint acá).
      // La landing pública siempre muestra la que tiene activa = true.
      activa: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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
  async down(queryInterface) {
    await queryInterface.dropTable("temporadas");
  },
};
