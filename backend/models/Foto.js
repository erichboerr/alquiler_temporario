export default (sequelize, DataTypes) => {
  const Foto = sequelize.define(
    "Foto",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      propiedadId: { type: DataTypes.INTEGER, allowNull: false },
      url: { type: DataTypes.STRING, allowNull: false },
      orden: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    },
    {
      tableName: "fotos",
      freezeTableName: true,
      timestamps: true,
    },
  );

  Foto.associate = (models) => {
    Foto.belongsTo(models.Propiedad, {
      foreignKey: "propiedadId",
      as: "propiedad",
    });
  };

  return Foto;
};
