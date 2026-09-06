export default (sequelize, DataTypes) => {
  const MesCard = sequelize.define(
    "MesCard",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      temporadaId: { type: DataTypes.INTEGER, allowNull: false },
      titulo: { type: DataTypes.STRING, allowNull: false },
      orden: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    },
    {
      tableName: "meses",
      freezeTableName: true,
      timestamps: true,
    },
  );

  MesCard.associate = (models) => {
    // Ahora el mes depende de la temporada, no directo de la propiedad.
    // La propiedad se obtiene navegando mes -> temporada -> propiedad.
    MesCard.belongsTo(models.Temporada, {
      foreignKey: "temporadaId",
      as: "temporada",
    });
    // Una tarjeta de mes tiene muchos períodos (renglones de fecha + precio)
    MesCard.hasMany(models.Periodo, {
      foreignKey: "mesId",
      as: "periodos",
    });
  };

  return MesCard;
};
