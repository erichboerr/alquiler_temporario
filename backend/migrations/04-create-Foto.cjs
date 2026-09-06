"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("fotos", {
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
        onDelete: "CASCADE", // Si se borra la propiedad, se borran sus fotos
      },
      // Ruta relativa servida como estática desde el backend, ej: /uploads/propiedad/foto-123.jpg
      url: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      // Define el orden de aparición en el acordeón. Lo controla el admin (drag & drop o flechas).
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
    await queryInterface.dropTable("fotos");
  },
};
