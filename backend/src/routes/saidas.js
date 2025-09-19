const express = require('express');
const { body } = require('express-validator');
const { 
  listarSaidas, 
  obterSaida, 
  criarSaida, 
  atualizarSaida, 
  excluirSaida 
} = require('../controllers/saidaController');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Validações
const saidaValidation = [
  body('obra_id').isInt().withMessage('Obra é obrigatória'),
  body('itens').isArray({ min: 1 }).withMessage('Pelo menos um item é obrigatório'),
  body('itens.*.item_id').isInt().withMessage('ID do item é obrigatório'),
  body('itens.*.quantidade_base').isDecimal().withMessage('Quantidade é obrigatória'),
  body('itens.*.unidade_id').optional().isInt()
];

// Rotas
router.get('/', auth, listarSaidas);
router.get('/:id', auth, obterSaida);
router.post('/', auth, authorize(['Administrador', 'GerenteDeEstoque', 'TecnicoCampo', 'AdministradorEngenheiro']), saidaValidation, criarSaida);
router.put('/:id', auth, authorize(['Administrador', 'GerenteDeEstoque']), atualizarSaida);
router.delete('/:id', auth, authorize(['Administrador']), excluirSaida);

module.exports = router;

