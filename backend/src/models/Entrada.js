module.exports = (sequelize, DataTypes) => {
  const Entrada = sequelize.define('Entrada', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    data: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    fornecedor_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'fornecedores',
        key: 'id'
      }
    },
    nf_numero: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    nf_chave: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    criado_por: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    tableName: 'entradas',
    timestamps: false
  });

  return Entrada;
};

