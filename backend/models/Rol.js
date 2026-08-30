// models/Rol.js
export default (sequelize, DataTypes) => {
  if (!sequelize || typeof sequelize.define !== 'function') {
    throw new Error('La instancia de sequelize no fue pasada correctamente al modelo Rol');
  }

  const Rol = sequelize.define("Rol", {
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    descripcion: DataTypes.STRING
  }, {
    tableName: "roles",
    timestamps: true
  });

  Rol.associate = (models) => {
    Rol.hasMany(models.Usuario, { foreignKey: 'rolId' });
  };

  return Rol;
};