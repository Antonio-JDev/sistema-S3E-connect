const { Obra } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

const listarObras = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    
    if (search) {
      where[Op.or] = [
        { codigo: { [Op.iLike]: `%${search}%` } },
        { nome: { [Op.iLike]: `%${search}%` } },
        { cliente: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (status) {
      where.status = status;
    }

    const { count, rows } = await Obra.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['nome', 'ASC']]
    });

    res.json({
      obras: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    console.error('Erro ao listar obras:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const obterObra = async (req, res) => {
  try {
    const { id } = req.params;

    const obra = await Obra.findByPk(id);

    if (!obra) {
      return res.status(404).json({ error: 'Obra não encontrada' });
    }

    res.json(obra);
  } catch (error) {
    console.error('Erro ao obter obra:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const criarObra = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      codigo,
      nome,
      cliente,
      responsavel,
      status
    } = req.body;

    const obra = await Obra.create({
      codigo,
      nome,
      cliente,
      responsavel,
      status: status || 'planejamento'
    });

    res.status(201).json(obra);
  } catch (error) {
    console.error('Erro ao criar obra:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Código da obra já existe' });
    }
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const atualizarObra = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const {
      codigo,
      nome,
      cliente,
      responsavel,
      status
    } = req.body;

    const obra = await Obra.findByPk(id);
    if (!obra) {
      return res.status(404).json({ error: 'Obra não encontrada' });
    }

    await obra.update({
      codigo,
      nome,
      cliente,
      responsavel,
      status
    });

    res.json(obra);
  } catch (error) {
    console.error('Erro ao atualizar obra:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Código da obra já existe' });
    }
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const excluirObra = async (req, res) => {
  try {
    const { id } = req.params;

    const obra = await Obra.findByPk(id);
    if (!obra) {
      return res.status(404).json({ error: 'Obra não encontrada' });
    }

    await obra.destroy();

    res.json({ message: 'Obra excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir obra:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

module.exports = {
  listarObras,
  obterObra,
  criarObra,
  atualizarObra,
  excluirObra
};

