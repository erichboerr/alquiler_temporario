export default (sequelize, DataTypes) => {
  const Propiedad = sequelize.define(
    "Propiedad",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      nombre: { type: DataTypes.STRING, allowNull: false },
      direccion: { type: DataTypes.STRING, allowNull: true },
      descripcion: { type: DataTypes.TEXT, allowNull: true },
      habitaciones: { type: DataTypes.INTEGER, allowNull: true },
      banos: { type: DataTypes.INTEGER, allowNull: true },
      // String y no integer: admite formatos como "4 + 1" (capacidad base + extra)
      ocupantes: { type: DataTypes.STRING, allowNull: true },
      // Array de strings: ["Living comedor y cocina", "Patio con parrilla"]
      caracteristicas: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
      whatsappNumero: { type: DataTypes.STRING, allowNull: true },
      whatsappMensaje: { type: DataTypes.STRING, allowNull: true },
    },
    {
      tableName: "propiedades",
      freezeTableName: true,
      timestamps: true,
    },
  );

  Propiedad.associate = (models) => {
    // Una propiedad tiene muchas fotos
    Propiedad.hasMany(models.Foto, {
      foreignKey: "propiedadId",
      as: "fotos",
    });
    // Una propiedad tiene muchas tarjetas de mes
    Propiedad.hasMany(models.MesCard, {
      foreignKey: "propiedadId",
      as: "meses",
    });
  };

  return Propiedad;
};
