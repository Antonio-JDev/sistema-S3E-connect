module.exports = (sequelize, DataTypes) => {
  const Obra = sequelize.define('Obra', {
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
    nome: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    cliente: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    responsavel: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'obras',
    timestamps: false
  });

  return Obra;
};

