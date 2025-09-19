module.exports = (sequelize, DataTypes) => {
  const Estoque = sequelize.define('Estoque', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    item_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'itens',
        key: 'id'
      }
    },
    local: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: 'DEPÓSITO'
    },
    saldo_base: {
      type: DataTypes.DECIMAL(18, 6),
      allowNull: false,
      defaultValue: 0
    }
  }, {
    tableName: 'estoques',
    timestamps: false
  });

  return Estoque;
};

