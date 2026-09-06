"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("caracteristicas", {
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
      descripcion: {
        type: Sequelize.STRING,
        allowNull: false,
      },
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

    // Backfill: lo que ya estuviera cargado como array JSON en propiedades.caracteristicas
    // pasa a ser una fila por ítem en la tabla nueva, respetando el orden que tenía en el array.
    const [propiedades] = await queryInterface.sequelize.query(
      `SELECT id, caracteristicas FROM "propiedades" WHERE caracteristicas IS NOT NULL;`,
    );

    for (const propiedad of propiedades) {
      const items = Array.isArray(propiedad.caracteristicas) ? propiedad.caracteristicas : [];
      for (let orden = 0; orden < items.length; orden += 1) {
        const descripcion = typeof items[orden] === "string" ? items[orden] : items[orden]?.descripcion;
        if (!descripcion) continue;
        await queryInterface.sequelize.query(
          `INSERT INTO "caracteristicas" ("propiedadId", "descripcion", "orden", "createdAt", "updatedAt")
           VALUES (:propiedadId, :descripcion, :orden, NOW(), NOW());`,
          { replacements: { propiedadId: propiedad.id, descripcion, orden } },
        );
      }
    }

    // La columna JSON queda obsoleta: ya migramos su contenido a la tabla nueva.
    await queryInterface.removeColumn("propiedades", "caracteristicas");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn("propiedades", "caracteristicas", {
      type: Sequelize.JSONB,
      allowNull: false,
      defaultValue: [],
    });

    const [filas] = await queryInterface.sequelize.query(
      `SELECT "propiedadId", "descripcion" FROM "caracteristicas" ORDER BY "propiedadId", "orden" ASC;`,
    );
    const porPropiedad = {};
    for (const fila of filas) {
      porPropiedad[fila.propiedadId] = porPropiedad[fila.propiedadId] || [];
      porPropiedad[fila.propiedadId].push(fila.descripcion);
    }
    for (const [propiedadId, items] of Object.entries(porPropiedad)) {
      await queryInterface.sequelize.query(
        `UPDATE "propiedades" SET caracteristicas = :items WHERE id = :propiedadId;`,
        { replacements: { items: JSON.stringify(items), propiedadId } },
      );
    }

    await queryInterface.dropTable("caracteristicas");
  },
};
