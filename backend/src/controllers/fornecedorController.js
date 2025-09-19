const { Fornecedor } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

const listarFornecedores = async (req, res) => {
  try {
    const { search, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    
    if (search) {
      where[Op.or] = [
        { razao_social: { [Op.iLike]: `%${search}%` } },
        { cnpj: { [Op.iLike]: `%${search}%` } },
        { contato: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows } = await Fornecedor.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['razao_social', 'ASC']]
    });

    res.json({
      fornecedores: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    console.error('Erro ao listar fornecedores:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const obterFornecedor = async (req, res) => {
  try {
    const { id } = req.params;

    const fornecedor = await Fornecedor.findByPk(id);

    if (!fornecedor) {
      return res.status(404).json({ error: 'Fornecedor não encontrado' });
    }

    res.json(fornecedor);
  } catch (error) {
    console.error('Erro ao obter fornecedor:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const criarFornecedor = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      razao_social,
      cnpj,
      contato,
      telefone,
      email
    } = req.body;

    const fornecedor = await Fornecedor.create({
      razao_social,
      cnpj,
      contato,
      telefone,
      email
    });

    res.status(201).json(fornecedor);
  } catch (error) {
    console.error('Erro ao criar fornecedor:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const atualizarFornecedor = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const {
      razao_social,
      cnpj,
      contato,
      telefone,
      email
    } = req.body;

    const fornecedor = await Fornecedor.findByPk(id);
    if (!fornecedor) {
      return res.status(404).json({ error: 'Fornecedor não encontrado' });
    }

    await fornecedor.update({
      razao_social,
      cnpj,
      contato,
      telefone,
      email
    });

    res.json(fornecedor);
  } catch (error) {
    console.error('Erro ao atualizar fornecedor:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const excluirFornecedor = async (req, res) => {
  try {
    const { id } = req.params;

    const fornecedor = await Fornecedor.findByPk(id);
    if (!fornecedor) {
      return res.status(404).json({ error: 'Fornecedor não encontrado' });
    }

    await fornecedor.destroy();

    res.json({ message: 'Fornecedor excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir fornecedor:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

module.exports = {
  listarFornecedores,
  obterFornecedor,
  criarFornecedor,
  atualizarFornecedor,
  excluirFornecedor
};

