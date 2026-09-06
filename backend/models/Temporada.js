export default (sequelize, DataTypes) => {
  const Temporada = sequelize.define(
    "Temporada",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      propiedadId: { type: DataTypes.INTEGER, allowNull: false },
      // Etiqueta libre, ej: "2026-2027"
      etiqueta: { type: DataTypes.STRING, allowNull: false },
      // Solo debería haber una temporada activa por propiedad a la vez.
      // Esa es la que se muestra en la landing pública (ver propiedad.service.js).
      activa: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    },
    {
      tableName: "temporadas",
      freezeTableName: true,
      timestamps: true,
    },
  );

  Temporada.associate = (models) => {
    Temporada.belongsTo(models.Propiedad, {
      foreignKey: "propiedadId",
      as: "propiedad",
    });
    // Una temporada tiene muchas tarjetas de mes
    Temporada.hasMany(models.MesCard, {
      foreignKey: "temporadaId",
      as: "meses",
    });
  };

  return Temporada;
};
