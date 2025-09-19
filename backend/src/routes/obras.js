const express = require('express');
const { body } = require('express-validator');
const { 
  listarObras, 
  obterObra, 
  criarObra, 
  atualizarObra, 
  excluirObra 
} = require('../controllers/obraController');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Validações
const obraValidation = [
  body('codigo').notEmpty().withMessage('Código é obrigatório'),
  body('nome').notEmpty().withMessage('Nome é obrigatório'),
  body('cliente').optional().notEmpty(),
  body('responsavel').optional().notEmpty(),
  body('status').optional().isIn(['planejamento', 'em_andamento', 'pausado', 'concluido', 'cancelado'])
];

// Rotas
router.get('/', auth, listarObras);
router.get('/:id', auth, obterObra);
router.post('/', auth, authorize(['Administrador', 'AdministradorEngenheiro', 'GerenteDeEstoque']), obraValidation, criarObra);
router.put('/:id', auth, authorize(['Administrador', 'AdministradorEngenheiro', 'GerenteDeEstoque']), obraValidation, atualizarObra);
router.delete('/:id', auth, authorize(['Administrador']), excluirObra);

module.exports = router;

