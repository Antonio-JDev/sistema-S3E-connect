module.exports = (sequelize, DataTypes) => {
  const UnidadeMedida = sequelize.define('UnidadeMedida', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    sigla: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true
    },
    descricao: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    fator_base: {
      type: DataTypes.DECIMAL(18, 6),
      allowNull: false,
      defaultValue: 1
    }
  }, {
    tableName: 'unidades_medida',
    timestamps: false
  });

  return UnidadeMedida;
};

