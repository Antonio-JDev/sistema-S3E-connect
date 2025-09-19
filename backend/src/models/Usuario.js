const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const Usuario = sequelize.define('Usuario', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nome: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    senha: {
      type: DataTypes.STRING,
      allowNull: false
    },
    perfil: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'TecnicoCampo'
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    tableName: 'usuarios',
    timestamps: true,
    hooks: {
      beforeCreate: async (usuario) => {
        if (usuario.senha) {
          usuario.senha = await bcrypt.hash(usuario.senha, 10);
        }
      },
      beforeUpdate: async (usuario) => {
        if (usuario.changed('senha')) {
          usuario.senha = await bcrypt.hash(usuario.senha, 10);
        }
      }
    }
  });

  Usuario.prototype.validarSenha = async function(senha) {
    return await bcrypt.compare(senha, this.senha);
  };

  return Usuario;
};

