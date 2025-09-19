const express = require('express');
const { body } = require('express-validator');
const { 
  listarFornecedores, 
  obterFornecedor, 
  criarFornecedor, 
  atualizarFornecedor, 
  excluirFornecedor 
} = require('../controllers/fornecedorController');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Validações
const fornecedorValidation = [
  body('razao_social').notEmpty().withMessage('Razão social é obrigatória'),
  body('cnpj').optional().notEmpty(),
  body('contato').optional().notEmpty(),
  body('telefone').optional().notEmpty(),
  body('email').optional().isEmail().withMessage('Email inválido')
];

// Rotas
router.get('/', auth, listarFornecedores);
router.get('/:id', auth, obterFornecedor);
router.post('/', auth, authorize(['Administrador', 'GerenteDeEstoque', 'Compras']), fornecedorValidation, criarFornecedor);
router.put('/:id', auth, authorize(['Administrador', 'GerenteDeEstoque', 'Compras']), fornecedorValidation, atualizarFornecedor);
router.delete('/:id', auth, authorize(['Administrador']), excluirFornecedor);

module.exports = router;

