module.exports = (sequelize, DataTypes) => {
  const Categoria = sequelize.define('Categoria', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nome: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true
    }
  }, {
    tableName: 'categorias',
    timestamps: false
  });

  return Categoria;
};

