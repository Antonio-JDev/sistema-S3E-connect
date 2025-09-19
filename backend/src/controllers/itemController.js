const { Item, Categoria, UnidadeMedida, Estoque } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

const listarItens = async (req, res) => {
  try {
    const { search, categoria, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    
    if (search) {
      where[Op.or] = [
        { codigo: { [Op.iLike]: `%${search}%` } },
        { descricao: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (categoria) {
      where.categoria_id = categoria;
    }

    const { count, rows } = await Item.findAndCountAll({
      where,
      include: [
        { model: Categoria, as: 'categoria' },
        { model: UnidadeMedida, as: 'unidadeBase' },
        { model: Estoque, as: 'estoques' }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['descricao', 'ASC']]
    });

    res.json({
      itens: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    console.error('Erro ao listar itens:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const obterItem = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await Item.findByPk(id, {
      include: [
        { model: Categoria, as: 'categoria' },
        { model: UnidadeMedida, as: 'unidadeBase' },
        { model: Estoque, as: 'estoques' }
      ]
    });

    if (!item) {
      return res.status(404).json({ error: 'Item não encontrado' });
    }

    res.json(item);
  } catch (error) {
    console.error('Erro ao obter item:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const criarItem = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      codigo,
      descricao,
      categoria_id,
      unidade_base_id,
      estoque_minimo,
      comprimento_por_unidade
    } = req.body;

    const item = await Item.create({
      codigo,
      descricao,
      categoria_id,
      unidade_base_id,
      estoque_minimo,
      comprimento_por_unidade
    });

    // Criar registro de estoque inicial
    await Estoque.create({
      item_id: item.id,
      local: 'DEPÓSITO',
      saldo_base: 0
    });

    const itemCompleto = await Item.findByPk(item.id, {
      include: [
        { model: Categoria, as: 'categoria' },
        { model: UnidadeMedida, as: 'unidadeBase' },
        { model: Estoque, as: 'estoques' }
      ]
    });

    res.status(201).json(itemCompleto);
  } catch (error) {
    console.error('Erro ao criar item:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Código do item já existe' });
    }
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const atualizarItem = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const {
      codigo,
      descricao,
      categoria_id,
      unidade_base_id,
      estoque_minimo,
      comprimento_por_unidade,
      ativo
    } = req.body;

    const item = await Item.findByPk(id);
    if (!item) {
      return res.status(404).json({ error: 'Item não encontrado' });
    }

    await item.update({
      codigo,
      descricao,
      categoria_id,
      unidade_base_id,
      estoque_minimo,
      comprimento_por_unidade,
      ativo
    });

    const itemAtualizado = await Item.findByPk(id, {
      include: [
        { model: Categoria, as: 'categoria' },
        { model: UnidadeMedida, as: 'unidadeBase' },
        { model: Estoque, as: 'estoques' }
      ]
    });

    res.json(itemAtualizado);
  } catch (error) {
    console.error('Erro ao atualizar item:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Código do item já existe' });
    }
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const excluirItem = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await Item.findByPk(id);
    if (!item) {
      return res.status(404).json({ error: 'Item não encontrado' });
    }

    // Soft delete - apenas desativa o item
    await item.update({ ativo: false });

    res.json({ message: 'Item desativado com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir item:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

module.exports = {
  listarItens,
  obterItem,
  criarItem,
  atualizarItem,
  excluirItem
};

