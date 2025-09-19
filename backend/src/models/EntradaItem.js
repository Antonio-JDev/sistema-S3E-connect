module.exports = (sequelize, DataTypes) => {
  const EntradaItem = sequelize.define('EntradaItem', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    entrada_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'entradas',
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
    valor_total: {
      type: DataTypes.DECIMAL(18, 6),
      allowNull: false
    },
    valor_unit_ultima_compra: {
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
    tableName: 'entradas_itens',
    timestamps: false,
    hooks: {
      beforeSave: (entradaItem) => {
        if (entradaItem.quantidade_base && entradaItem.valor_total) {
          entradaItem.valor_unit_ultima_compra = entradaItem.valor_total / entradaItem.quantidade_base;
        }
      }
    }
  });

  return EntradaItem;
};

