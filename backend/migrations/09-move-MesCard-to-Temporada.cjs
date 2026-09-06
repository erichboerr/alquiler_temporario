"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1) Agregamos la columna temporadaId, nullable por ahora porque todavía
    //    no hay temporadas creadas para los meses que ya existen en la tabla.
    await queryInterface.addColumn("meses", "temporadaId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "temporadas",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });

    // 2) Backfill: por cada propiedad que ya tenga meses cargados, le creamos
    //    una temporada "2026-2027" activa, y le asignamos esos meses.
    //    Así no se pierde nada de lo que ya se haya cargado antes de este cambio.
    const [propiedadesConMeses] = await queryInterface.sequelize.query(
      `SELECT DISTINCT "propiedadId" FROM "meses";`,
    );

    for (const { propiedadId } of propiedadesConMeses) {
      const [[temporada]] = await queryInterface.sequelize.query(
        `INSERT INTO "temporadas" ("propiedadId", "etiqueta", "activa", "createdAt", "updatedAt")
         VALUES (:propiedadId, '2026-2027', true, NOW(), NOW())
         RETURNING id;`,
        { replacements: { propiedadId } },
      );

      await queryInterface.sequelize.query(
        `UPDATE "meses" SET "temporadaId" = :temporadaId WHERE "propiedadId" = :propiedadId;`,
        { replacements: { temporadaId: temporada.id, propiedadId } },
      );
    }

    // 3) Ahora que todos los meses existentes ya tienen temporadaId, la hacemos
    //    obligatoria y sacamos la columna vieja propiedadId (queda redundante:
    //    la propiedad de un mes se sabe a través de su temporada).
    await queryInterface.changeColumn("meses", "temporadaId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "temporadas",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });

    await queryInterface.removeColumn("meses", "propiedadId");
  },

  async down(queryInterface, Sequelize) {
    // Reconstruye propiedadId a partir de la temporada, para poder revertir.
    await queryInterface.addColumn("meses", "propiedadId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "propiedades",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });

    await queryInterface.sequelize.query(`
      UPDATE "meses" m
      SET "propiedadId" = t."propiedadId"
      FROM "temporadas" t
      WHERE m."temporadaId" = t.id;
    `);

    await queryInterface.changeColumn("meses", "propiedadId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "propiedades",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });

    await queryInterface.removeColumn("meses", "temporadaId");
  },
};
