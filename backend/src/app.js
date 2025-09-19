const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const routes = require('./routes');
const { sequelize } = require('./models');

const app = express();

// Configurações de segurança
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP por janela de tempo
  message: 'Muitas requisições deste IP, tente novamente em 15 minutos.'
});
app.use('/api/', limiter);

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rotas
app.use('/api', routes);

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    message: 'API de Gestão de Estoque S3E',
    version: '1.0.0',
    status: 'OK'
  });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Dados inválidos',
      details: err.errors
    });
  }
  
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      error: 'Violação de restrição única',
      details: err.errors
    });
  }
  
  res.status(500).json({
    error: 'Erro interno do servidor'
  });
});

// Middleware para rotas não encontradas
app.use((req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada'
  });
});

// Função para inicializar o banco de dados
const initializeDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexão com o banco de dados estabelecida com sucesso.');
    
    // Não fazer sync automático para evitar conflitos com views existentes
    // O banco já foi inicializado com o script SQL
    console.log('Banco de dados pronto para uso.');
  } catch (error) {
    console.error('Erro ao conectar com o banco de dados:', error);
    process.exit(1);
  }
};

module.exports = { app, initializeDatabase };

