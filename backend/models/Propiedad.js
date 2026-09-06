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
    // Una propiedad tiene muchas temporadas (ej: "2026-2027", "2027-2028")
    // y cada temporada tiene sus propias tarjetas de mes.
    Propiedad.hasMany(models.Temporada, {
      foreignKey: "propiedadId",
      as: "temporadas",
    });
    // Ítems cortos tipo lista (ej: "Pileta", "WiFi"), cada uno con su propio orden
    Propiedad.hasMany(models.Caracteristica, {
      foreignKey: "propiedadId",
      as: "caracteristicas",
    });
  };

  return Propiedad;
};
