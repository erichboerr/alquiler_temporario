import bcrypt from "bcryptjs";

export default (sequelize, DataTypes) => {
  const Usuario = sequelize.define(
    "Usuario",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      user: { type: DataTypes.STRING, allowNull: false, unique: true },
      password: { type: DataTypes.STRING, allowNull: false },
      rolId: { type: DataTypes.INTEGER, allowNull: false },
      flagHabilitado: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    {
      tableName: "usuarios",
      freezeTableName: true,
      timestamps: true,
      paranoid: true,
      hooks: {
        beforeCreate: async (usuario) => {
          const salt = await bcrypt.genSalt(10);
          usuario.password = await bcrypt.hash(usuario.password, salt);
        },
        beforeUpdate: async (usuario) => {
          if (usuario.changed("password")) {
            const salt = await bcrypt.genSalt(10);
            usuario.password = await bcrypt.hash(usuario.password, salt);
          }
        },
      },
    },
  );

  Usuario.associate = (models) => {
    // Un usuario pertenece a un Rol
    Usuario.belongsTo(models.Rol, {
      foreignKey: "rolId",
      as: "rol", // Alias para las consultas
    });
  };

  return Usuario;
};
