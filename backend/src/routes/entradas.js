const express = require('express');
const { body } = require('express-validator');
const { 
  listarEntradas, 
  obterEntrada, 
  criarEntrada, 
  atualizarEntrada, 
  excluirEntrada 
} = require('../controllers/entradaController');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Validações
const entradaValidation = [
  body('fornecedor_id').optional().isInt(),
  body('nf_numero').optional().notEmpty(),
  body('nf_chave').optional().notEmpty(),
  body('itens').isArray({ min: 1 }).withMessage('Pelo menos um item é obrigatório'),
  body('itens.*.item_id').isInt().withMessage('ID do item é obrigatório'),
  body('itens.*.quantidade_base').isDecimal().withMessage('Quantidade é obrigatória'),
  body('itens.*.valor_total').isDecimal().withMessage('Valor total é obrigatório'),
  body('itens.*.unidade_id').optional().isInt()
];

// Rotas
router.get('/', auth, listarEntradas);
router.get('/:id', auth, obterEntrada);
router.post('/', auth, authorize(['Administrador', 'GerenteDeEstoque', 'Compras']), entradaValidation, criarEntrada);
router.put('/:id', auth, authorize(['Administrador', 'GerenteDeEstoque', 'Compras']), atualizarEntrada);
router.delete('/:id', auth, authorize(['Administrador']), excluirEntrada);

module.exports = router;

