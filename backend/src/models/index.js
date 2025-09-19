const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

// Importar todos os modelos
const UnidadeMedida = require('./UnidadeMedida')(sequelize, DataTypes);
const Categoria = require('./Categoria')(sequelize, DataTypes);
const Item = require('./Item')(sequelize, DataTypes);
const Fornecedor = require('./Fornecedor')(sequelize, DataTypes);
const Obra = require('./Obra')(sequelize, DataTypes);
const Estoque = require('./Estoque')(sequelize, DataTypes);
const Entrada = require('./Entrada')(sequelize, DataTypes);
const EntradaItem = require('./EntradaItem')(sequelize, DataTypes);
const Saida = require('./Saida')(sequelize, DataTypes);
const SaidaItem = require('./SaidaItem')(sequelize, DataTypes);
const Usuario = require('./Usuario')(sequelize, DataTypes);

// Definir associações
Item.belongsTo(Categoria, { foreignKey: 'categoria_id', as: 'categoria' });
Item.belongsTo(UnidadeMedida, { foreignKey: 'unidade_base_id', as: 'unidadeBase' });

Estoque.belongsTo(Item, { foreignKey: 'item_id', as: 'item' });

Entrada.belongsTo(Fornecedor, { foreignKey: 'fornecedor_id', as: 'fornecedor' });
Entrada.belongsTo(Usuario, { foreignKey: 'criado_por', as: 'criador' });

EntradaItem.belongsTo(Entrada, { foreignKey: 'entrada_id', as: 'entrada' });
EntradaItem.belongsTo(Item, { foreignKey: 'item_id', as: 'item' });
EntradaItem.belongsTo(UnidadeMedida, { foreignKey: 'unidade_id', as: 'unidade' });

Saida.belongsTo(Obra, { foreignKey: 'obra_id', as: 'obra' });
Saida.belongsTo(Usuario, { foreignKey: 'criado_por', as: 'criador' });

SaidaItem.belongsTo(Saida, { foreignKey: 'saida_id', as: 'saida' });
SaidaItem.belongsTo(Item, { foreignKey: 'item_id', as: 'item' });
SaidaItem.belongsTo(UnidadeMedida, { foreignKey: 'unidade_id', as: 'unidade' });

// Associações inversas
Categoria.hasMany(Item, { foreignKey: 'categoria_id', as: 'itens' });
UnidadeMedida.hasMany(Item, { foreignKey: 'unidade_base_id', as: 'itens' });
Item.hasMany(Estoque, { foreignKey: 'item_id', as: 'estoques' });
Fornecedor.hasMany(Entrada, { foreignKey: 'fornecedor_id', as: 'entradas' });
Entrada.hasMany(EntradaItem, { foreignKey: 'entrada_id', as: 'itens' });
Obra.hasMany(Saida, { foreignKey: 'obra_id', as: 'saidas' });
Saida.hasMany(SaidaItem, { foreignKey: 'saida_id', as: 'itens' });

module.exports = {
  sequelize,
  UnidadeMedida,
  Categoria,
  Item,
  Fornecedor,
  Obra,
  Estoque,
  Entrada,
  EntradaItem,
  Saida,
  SaidaItem,
  Usuario
};

