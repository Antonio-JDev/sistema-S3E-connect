const { app, initializeDatabase } = require('./src/app');

const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    // Inicializar banco de dados
    await initializeDatabase();
    
    // Iniciar servidor
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Servidor rodando na porta ${PORT}`);
      console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
      console.log(`URL: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Erro ao iniciar o servidor:', error);
    process.exit(1);
  }
};

startServer();

