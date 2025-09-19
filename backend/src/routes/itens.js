const express = require('express');
const { body } = require('express-validator');
const { 
  listarItens, 
  obterItem, 
  criarItem, 
  atualizarItem, 
  excluirItem 
} = require('../controllers/itemController');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Validações
const itemValidation = [
  body('codigo').notEmpty().withMessage('Código é obrigatório'),
  body('descricao').notEmpty().withMessage('Descrição é obrigatória'),
  body('unidade_base_id').isInt().withMessage('Unidade base é obrigatória'),
  body('categoria_id').optional().isInt(),
  body('estoque_minimo').optional().isDecimal(),
  body('comprimento_por_unidade').optional().isDecimal()
];

// Rotas
router.get('/', auth, listarItens);
router.get('/:id', auth, obterItem);
router.post('/', auth, authorize(['Administrador', 'GerenteDeEstoque']), itemValidation, criarItem);
router.put('/:id', auth, authorize(['Administrador', 'GerenteDeEstoque']), itemValidation, atualizarItem);
router.delete('/:id', auth, authorize(['Administrador']), excluirItem);

module.exports = router;

