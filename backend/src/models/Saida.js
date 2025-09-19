module.exports = (sequelize, DataTypes) => {
  const Saida = sequelize.define('Saida', {
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
    obra_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'obras',
        key: 'id'
      }
    },
    criado_por: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    tableName: 'saidas',
    timestamps: false
  });

  return Saida;
};

