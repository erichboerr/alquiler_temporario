export default (sequelize, DataTypes) => {
  const Caracteristica = sequelize.define(
    "Caracteristica",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      propiedadId: { type: DataTypes.INTEGER, allowNull: false },
      // Texto corto, ej: "Living comedor y cocina", "Patio con parrilla"
      descripcion: { type: DataTypes.STRING, allowNull: false },
      // Posición en la que se muestra en la landing pública
      orden: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    },
    {
      tableName: "caracteristicas",
      freezeTableName: true,
      timestamps: true,
    },
  );

  Caracteristica.associate = (models) => {
    Caracteristica.belongsTo(models.Propiedad, {
      foreignKey: "propiedadId",
      as: "propiedad",
    });
  };

  return Caracteristica;
};
