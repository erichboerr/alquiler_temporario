"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("propiedades", "ocupantes", {
      // STRING y no INTEGER a propósito: el admin necesita poder escribir
      // cosas como "4 + 1" (4 personas + 1 más en sofá cama, por ejemplo),
      // no solo un número.
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn("propiedades", "ocupantes");
  },
};
