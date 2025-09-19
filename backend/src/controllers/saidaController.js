const { Saida, SaidaItem, Item, Obra, UnidadeMedida, Estoque, Entrada, EntradaItem } = require('../models');
const { validationResult } = require('express-validator');
const { sequelize } = require('../models');
const { Op } = require('sequelize');

const listarSaidas = async (req, res) => {
  try {
    const { page = 1, limit = 50, obra_id, data_inicio, data_fim } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    
    if (obra_id) {
      where.obra_id = obra_id;
    }

    if (data_inicio && data_fim) {
      where.data = {
        [Op.between]: [new Date(data_inicio), new Date(data_fim)]
      };
    }

    const { count, rows } = await Saida.findAndCountAll({
      where,
      include: [
        { model: Obra, as: 'obra' },
        {
          model: SaidaItem,
          as: 'itens',
          include: [
            { model: Item, as: 'item' },
            { model: UnidadeMedida, as: 'unidade' }
          ]
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['data', 'DESC']]
    });

    res.json({
      saidas: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    console.error('Erro ao listar saídas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const obterSaida = async (req, res) => {
  try {
    const { id } = req.params;

    const saida = await Saida.findByPk(id, {
      include: [
        { model: Obra, as: 'obra' },
        {
          model: SaidaItem,
          as: 'itens',
          include: [
            { model: Item, as: 'item' },
            { model: UnidadeMedida, as: 'unidade' }
          ]
        }
      ]
    });

    if (!saida) {
      return res.status(404).json({ error: 'Saída não encontrada' });
    }

    res.json(saida);
  } catch (error) {
    console.error('Erro ao obter saída:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const obterUltimoPrecoCompra = async (item_id, data_saida) => {
  try {
    const ultimaEntrada = await EntradaItem.findOne({
      include: [{
        model: Entrada,
        as: 'entrada',
        where: {
          data: { [Op.lte]: data_saida }
        }
      }],
      where: { item_id },
      order: [['entrada', 'data', 'DESC']],
      limit: 1
    });

    return ultimaEntrada ? ultimaEntrada.valor_unit_ultima_compra : 0;
  } catch (error) {
    console.error('Erro ao obter último preço de compra:', error);
    return 0;
  }
};

const criarSaida = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      await transaction.rollback();
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      obra_id,
      itens
    } = req.body;

    // Verificar se há estoque suficiente para todos os itens
    for (const itemData of itens) {
      const { item_id, quantidade_base } = itemData;
      
      const estoque = await Estoque.findOne({
        where: { item_id },
        transaction
      });

      if (!estoque || parseFloat(estoque.saldo_base) < parseFloat(quantidade_base)) {
        await transaction.rollback();
        const item = await Item.findByPk(item_id);
        return res.status(400).json({ 
          error: `Estoque insuficiente para o item: ${item?.descricao || 'Desconhecido'}` 
        });
      }
    }

    // Criar saída
    const saida = await Saida.create({
      obra_id,
      criado_por: req.usuario.id
    }, { transaction });

    // Processar itens da saída
    for (const itemData of itens) {
      const { item_id, quantidade_base, unidade_id } = itemData;

      // Obter valor de referência (última compra)
      const valor_unit_referencia = await obterUltimoPrecoCompra(item_id, saida.data);

      // Criar item da saída
      await SaidaItem.create({
        saida_id: saida.id,
        item_id,
        quantidade_base,
        valor_unit_referencia,
        unidade_id
      }, { transaction });

      // Atualizar estoque
      const estoque = await Estoque.findOne({
        where: { item_id },
        transaction
      });

      await estoque.update({
        saldo_base: parseFloat(estoque.saldo_base) - parseFloat(quantidade_base)
      }, { transaction });
    }

    await transaction.commit();

    // Buscar saída completa para retorno
    const saidaCompleta = await Saida.findByPk(saida.id, {
      include: [
        { model: Obra, as: 'obra' },
        {
          model: SaidaItem,
          as: 'itens',
          include: [
            { model: Item, as: 'item' },
            { model: UnidadeMedida, as: 'unidade' }
          ]
        }
      ]
    });

    res.status(201).json(saidaCompleta);
  } catch (error) {
    await transaction.rollback();
    console.error('Erro ao criar saída:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const atualizarSaida = async (req, res) => {
  try {
    const { id } = req.params;
    const { obra_id } = req.body;

    const saida = await Saida.findByPk(id);
    if (!saida) {
      return res.status(404).json({ error: 'Saída não encontrada' });
    }

    await saida.update({ obra_id });

    const saidaAtualizada = await Saida.findByPk(id, {
      include: [
        { model: Obra, as: 'obra' },
        {
          model: SaidaItem,
          as: 'itens',
          include: [
            { model: Item, as: 'item' },
            { model: UnidadeMedida, as: 'unidade' }
          ]
        }
      ]
    });

    res.json(saidaAtualizada);
  } catch (error) {
    console.error('Erro ao atualizar saída:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const excluirSaida = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;

    const saida = await Saida.findByPk(id, {
      include: [{ model: SaidaItem, as: 'itens' }],
      transaction
    });

    if (!saida) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Saída não encontrada' });
    }

    // Reverter estoque
    for (const item of saida.itens) {
      const estoque = await Estoque.findOne({
        where: { item_id: item.item_id },
        transaction
      });

      if (estoque) {
        await estoque.update({
          saldo_base: parseFloat(estoque.saldo_base) + parseFloat(item.quantidade_base)
        }, { transaction });
      }
    }

    // Excluir itens da saída
    await SaidaItem.destroy({
      where: { saida_id: id },
      transaction
    });

    // Excluir saída
    await saida.destroy({ transaction });

    await transaction.commit();
    res.json({ message: 'Saída excluída com sucesso' });
  } catch (error) {
    await transaction.rollback();
    console.error('Erro ao excluir saída:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

module.exports = {
  listarSaidas,
  obterSaida,
  criarSaida,
  atualizarSaida,
  excluirSaida
};

