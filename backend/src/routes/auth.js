const express = require('express');
const { body } = require('express-validator');
const { login, register, me } = require('../controllers/authController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Validações
const loginValidation = [
  body('email').isEmail().withMessage('Email inválido'),
  body('senha').notEmpty().withMessage('Senha é obrigatória')
];

const registerValidation = [
  body('nome').notEmpty().withMessage('Nome é obrigatório'),
  body('email').isEmail().withMessage('Email inválido'),
  body('senha').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres'),
  body('perfil').optional().isIn(['Administrador', 'Desenvolvedor', 'GerenteDeEstoque', 'Compras', 'TecnicoCampo', 'AdministradorFinanceiro', 'AdministradorEngenheiro'])
];

// Rotas
router.post('/login', loginValidation, login);
router.post('/register', registerValidation, register);
router.get('/me', auth, me);

module.exports = router;

