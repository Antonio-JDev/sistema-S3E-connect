module.exports = (sequelize, DataTypes) => {
  const Item = sequelize.define('Item', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    codigo: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true
    },
    descricao: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    categoria_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'categorias',
        key: 'id'
      }
    },
    unidade_base_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'unidades_medida',
        key: 'id'
      }
    },
    estoque_minimo: {
      type: DataTypes.DECIMAL(18, 6),
      allowNull: true,
      defaultValue: 0
    },
    comprimento_por_unidade: {
      type: DataTypes.DECIMAL(18, 6),
      allowNull: true
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true
    }
  }, {
    tableName: 'itens',
    timestamps: false
  });

  return Item;
};

