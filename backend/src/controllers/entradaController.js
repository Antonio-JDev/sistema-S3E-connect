const { Entrada, EntradaItem, Item, Fornecedor, UnidadeMedida, Estoque } = require('../models');
const { validationResult } = require('express-validator');
const { sequelize } = require('../models');
const { Op } = require('sequelize');

const listarEntradas = async (req, res) => {
  try {
    const { page = 1, limit = 50, fornecedor_id, data_inicio, data_fim } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    
    if (fornecedor_id) {
      where.fornecedor_id = fornecedor_id;
    }

    if (data_inicio && data_fim) {
      where.data = {
        [Op.between]: [new Date(data_inicio), new Date(data_fim)]
      };
    }

    const { count, rows } = await Entrada.findAndCountAll({
      where,
      include: [
        { model: Fornecedor, as: 'fornecedor' },
        {
          model: EntradaItem,
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
      entradas: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    console.error('Erro ao listar entradas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const obterEntrada = async (req, res) => {
  try {
    const { id } = req.params;

    const entrada = await Entrada.findByPk(id, {
      include: [
        { model: Fornecedor, as: 'fornecedor' },
        {
          model: EntradaItem,
          as: 'itens',
          include: [
            { model: Item, as: 'item' },
            { model: UnidadeMedida, as: 'unidade' }
          ]
        }
      ]
    });

    if (!entrada) {
      return res.status(404).json({ error: 'Entrada não encontrada' });
    }

    res.json(entrada);
  } catch (error) {
    console.error('Erro ao obter entrada:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const criarEntrada = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      await transaction.rollback();
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      fornecedor_id,
      nf_numero,
      nf_chave,
      itens
    } = req.body;

    // Criar entrada
    const entrada = await Entrada.create({
      fornecedor_id,
      nf_numero,
      nf_chave,
      criado_por: req.usuario.id
    }, { transaction });

    // Processar itens da entrada
    for (const itemData of itens) {
      const { item_id, quantidade_base, valor_total, unidade_id } = itemData;

      // Criar item da entrada
      await EntradaItem.create({
        entrada_id: entrada.id,
        item_id,
        quantidade_base,
        valor_total,
        unidade_id
      }, { transaction });

      // Atualizar estoque
      const estoque = await Estoque.findOne({
        where: { item_id },
        transaction
      });

      if (estoque) {
        await estoque.update({
          saldo_base: parseFloat(estoque.saldo_base) + parseFloat(quantidade_base)
        }, { transaction });
      } else {
        await Estoque.create({
          item_id,
          local: 'DEPÓSITO',
          saldo_base: quantidade_base
        }, { transaction });
      }
    }

    await transaction.commit();

    // Buscar entrada completa para retorno
    const entradaCompleta = await Entrada.findByPk(entrada.id, {
      include: [
        { model: Fornecedor, as: 'fornecedor' },
        {
          model: EntradaItem,
          as: 'itens',
          include: [
            { model: Item, as: 'item' },
            { model: UnidadeMedida, as: 'unidade' }
          ]
        }
      ]
    });

    res.status(201).json(entradaCompleta);
  } catch (error) {
    await transaction.rollback();
    console.error('Erro ao criar entrada:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const atualizarEntrada = async (req, res) => {
  try {
    const { id } = req.params;
    const { fornecedor_id, nf_numero, nf_chave } = req.body;

    const entrada = await Entrada.findByPk(id);
    if (!entrada) {
      return res.status(404).json({ error: 'Entrada não encontrada' });
    }

    await entrada.update({
      fornecedor_id,
      nf_numero,
      nf_chave
    });

    const entradaAtualizada = await Entrada.findByPk(id, {
      include: [
        { model: Fornecedor, as: 'fornecedor' },
        {
          model: EntradaItem,
          as: 'itens',
          include: [
            { model: Item, as: 'item' },
            { model: UnidadeMedida, as: 'unidade' }
          ]
        }
      ]
    });

    res.json(entradaAtualizada);
  } catch (error) {
    console.error('Erro ao atualizar entrada:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const excluirEntrada = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;

    const entrada = await Entrada.findByPk(id, {
      include: [{ model: EntradaItem, as: 'itens' }],
      transaction
    });

    if (!entrada) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Entrada não encontrada' });
    }

    // Reverter estoque
    for (const item of entrada.itens) {
      const estoque = await Estoque.findOne({
        where: { item_id: item.item_id },
        transaction
      });

      if (estoque) {
        const novoSaldo = parseFloat(estoque.saldo_base) - parseFloat(item.quantidade_base);
        await estoque.update({
          saldo_base: Math.max(0, novoSaldo)
        }, { transaction });
      }
    }

    // Excluir itens da entrada
    await EntradaItem.destroy({
      where: { entrada_id: id },
      transaction
    });

    // Excluir entrada
    await entrada.destroy({ transaction });

    await transaction.commit();
    res.json({ message: 'Entrada excluída com sucesso' });
  } catch (error) {
    await transaction.rollback();
    console.error('Erro ao excluir entrada:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

module.exports = {
  listarEntradas,
  obterEntrada,
  criarEntrada,
  atualizarEntrada,
  excluirEntrada
};

