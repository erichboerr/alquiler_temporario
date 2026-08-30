export default (sequelize, DataTypes) => {
  const MesCard = sequelize.define(
    "MesCard",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      propiedadId: { type: DataTypes.INTEGER, allowNull: false },
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
    MesCard.belongsTo(models.Propiedad, {
      foreignKey: "propiedadId",
      as: "propiedad",
    });
    // Una tarjeta de mes tiene muchos períodos (renglones de fecha + precio)
    MesCard.hasMany(models.Periodo, {
      foreignKey: "mesId",
      as: "periodos",
    });
  };

  return MesCard;
};
