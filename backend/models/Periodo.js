export default (sequelize, DataTypes) => {
  const Periodo = sequelize.define(
    "Periodo",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      mesId: { type: DataTypes.INTEGER, allowNull: false },
      fechaDesde: { type: DataTypes.DATEONLY, allowNull: false },
      fechaHasta: { type: DataTypes.DATEONLY, allowNull: false },
      precio: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
      disponible: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      orden: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    },
    {
      tableName: "periodos",
      freezeTableName: true,
      timestamps: true,
    },
  );

  Periodo.associate = (models) => {
    Periodo.belongsTo(models.MesCard, {
      foreignKey: "mesId",
      as: "mes",
    });
  };

  return Periodo;
};
