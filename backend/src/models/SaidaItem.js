module.exports = (sequelize, DataTypes) => {
  const SaidaItem = sequelize.define('SaidaItem', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    saida_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'saidas',
        key: 'id'
      }
    },
    item_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'itens',
        key: 'id'
      }
    },
    quantidade_base: {
      type: DataTypes.DECIMAL(18, 6),
      allowNull: false
    },
    valor_unit_referencia: {
      type: DataTypes.DECIMAL(18, 6),
      allowNull: true
    },
    unidade_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'unidades_medida',
        key: 'id'
      }
    }
  }, {
    tableName: 'saidas_itens',
    timestamps: false
  });

  return SaidaItem;
};

