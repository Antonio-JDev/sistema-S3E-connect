const express = require('express');
const authRoutes = require('./auth');
const itensRoutes = require('./itens');
const entradasRoutes = require('./entradas');
const saidasRoutes = require('./saidas');
const fornecedoresRoutes = require('./fornecedores');
const obrasRoutes = require('./obras');

const router = express.Router();

// Definir rotas
router.use('/auth', authRoutes);
router.use('/itens', itensRoutes);
router.use('/entradas', entradasRoutes);
router.use('/saidas', saidasRoutes);
router.use('/fornecedores', fornecedoresRoutes);
router.use('/obras', obrasRoutes);

// Rota de health check
router.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

module.exports = router;

