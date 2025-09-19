module.exports = (sequelize, DataTypes) => {
  const Fornecedor = sequelize.define('Fornecedor', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    razao_social: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    cnpj: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    contato: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    telefone: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    email: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'fornecedores',
    timestamps: false
  });

  return Fornecedor;
};

