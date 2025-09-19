# Sistema de Gestão de Estoque S3E

Sistema completo de gestão de estoque desenvolvido com Node.js, React e PostgreSQL.

## 🚀 Tecnologias Utilizadas

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **PostgreSQL** - Banco de dados relacional
- **Sequelize** - ORM para Node.js
- **JWT** - Autenticação e autorização
- **bcryptjs** - Hash de senhas

### Frontend
- **React** - Biblioteca para interfaces
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Framework CSS
- **shadcn/ui** - Componentes UI
- **React Router** - Roteamento
- **Axios** - Cliente HTTP

### Infraestrutura
- **Docker** - Containerização
- **Docker Compose** - Orquestração de containers
- **Nginx** - Servidor web para frontend

## 📋 Funcionalidades

### Autenticação e Autorização
- Sistema de login/logout
- Controle de acesso baseado em perfis (RBAC)
- Autenticação JWT
- Proteção de rotas

### Gestão de Materiais
- Cadastro de materiais/itens
- Categorização de produtos
- Controle de unidades de medida
- Alertas de estoque baixo
- Busca e filtros

### Gestão de Fornecedores
- Cadastro de fornecedores
- Informações de contato
- Histórico de compras

### Gestão de Obras/Projetos
- Cadastro de obras
- Controle de status
- Associação com saídas de material

### Movimentação de Estoque
- Entradas de material
- Saídas para obras
- Histórico de movimentações
- Controle de saldo

### Dashboard e Relatórios
- Visão geral do estoque
- Estatísticas em tempo real
- Alertas e notificações
- Relatórios de movimentação

## 🛠️ Instalação e Configuração

### Pré-requisitos
- Node.js 18+ 
- PostgreSQL 14+
- Docker e Docker Compose (opcional)

### Instalação Local

#### 1. Clone o repositório
```bash
git clone <repository-url>
cd stock_management
```

#### 2. Configure o banco de dados
```bash
# Instalar PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Criar banco de dados
sudo -u postgres createdb stock_management

# Executar script de inicialização
sudo -u postgres psql -d stock_management -f backend/scripts/init-db.sql
```

#### 3. Configure o backend
```bash
cd backend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas configurações

# Iniciar servidor
npm run dev
```

#### 4. Configure o frontend
```bash
cd frontend

# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

### Instalação com Docker

#### 1. Configure as variáveis de ambiente
```bash
# Editar docker-compose.yml se necessário
# Alterar senhas e configurações de produção
```

#### 2. Execute com Docker Compose
```bash
# Construir e iniciar todos os serviços
docker-compose up -d

# Verificar logs
docker-compose logs -f

# Parar serviços
docker-compose down
```

## 🔧 Configuração

### Variáveis de Ambiente (Backend)

```env
# Banco de dados
DB_HOST=localhost
DB_PORT=5432
DB_NAME=stock_management
DB_USER=postgres
DB_PASSWORD=postgres

# Servidor
PORT=3001
NODE_ENV=development

# Autenticação
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=24h

# CORS
CORS_ORIGIN=http://localhost:5173
```

### Configuração do Frontend

O frontend está configurado para se comunicar com o backend na porta 3001. Para alterar, edite o arquivo `src/lib/api.js`:

```javascript
const API_BASE_URL = 'http://localhost:3001/api';
```

## 🚀 Deploy em Produção

### Com Docker (Recomendado)

1. **Prepare o ambiente:**
```bash
# Clone o repositório no servidor
git clone <repository-url>
cd stock_management
```

2. **Configure para produção:**
```bash
# Editar docker-compose.yml
# Alterar senhas, secrets e configurações
# Configurar domínio e SSL se necessário
```

3. **Execute o deploy:**
```bash
# Construir e iniciar
docker-compose up -d

# Verificar status
docker-compose ps
```

### Deploy Manual

1. **Prepare o servidor:**
```bash
# Instalar Node.js, PostgreSQL, Nginx
# Configurar banco de dados
# Configurar proxy reverso no Nginx
```

2. **Deploy do backend:**
```bash
cd backend
npm install --production
npm run build  # se houver build step
pm2 start server.js --name "s3e-backend"
```

3. **Deploy do frontend:**
```bash
cd frontend
npm install
npm run build
# Copiar dist/ para diretório do Nginx
```

## 📊 Estrutura do Banco de Dados

### Principais Tabelas

- **usuarios** - Usuários do sistema
- **categorias** - Categorias de materiais
- **unidades_medida** - Unidades de medida
- **itens** - Catálogo de materiais
- **fornecedores** - Fornecedores
- **obras** - Projetos/obras
- **estoques** - Saldos de estoque
- **entradas** - Entradas de material
- **entradas_itens** - Itens das entradas
- **saidas** - Saídas de material
- **saidas_itens** - Itens das saídas

### Views

- **historico_precos** - Histórico de preços de compra

## 🔐 Segurança

### Autenticação
- Senhas hasheadas com bcrypt
- Tokens JWT com expiração
- Middleware de autenticação em todas as rotas protegidas

### Autorização
- Sistema de perfis de usuário
- Controle de acesso baseado em roles
- Validação de permissões por endpoint

### Configurações de Segurança
- CORS configurado
- Headers de segurança
- Validação de entrada
- Rate limiting

## 🧪 Testes

### Credenciais de Teste
- **Email:** admin.teste@s3e.com.br
- **Senha:** admin123

### URLs de Desenvolvimento
- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:3001
- **API Health:** http://localhost:3001/api/health

## 📝 API Documentation

### Endpoints Principais

#### Autenticação
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registro
- `GET /api/auth/me` - Dados do usuário

#### Materiais
- `GET /api/itens` - Listar materiais
- `POST /api/itens` - Criar material
- `PUT /api/itens/:id` - Atualizar material
- `DELETE /api/itens/:id` - Excluir material

#### Fornecedores
- `GET /api/fornecedores` - Listar fornecedores
- `POST /api/fornecedores` - Criar fornecedor
- `PUT /api/fornecedores/:id` - Atualizar fornecedor
- `DELETE /api/fornecedores/:id` - Excluir fornecedor

#### Obras
- `GET /api/obras` - Listar obras
- `POST /api/obras` - Criar obra
- `PUT /api/obras/:id` - Atualizar obra
- `DELETE /api/obras/:id` - Excluir obra

#### Movimentações
- `GET /api/entradas` - Listar entradas
- `POST /api/entradas` - Criar entrada
- `GET /api/saidas` - Listar saídas
- `POST /api/saidas` - Criar saída

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para suporte e dúvidas:
- Abra uma issue no GitHub
- Entre em contato com a equipe de desenvolvimento

## 🔄 Changelog

### v1.0.0
- Sistema básico de autenticação
- CRUD de materiais, fornecedores e obras
- Dashboard com estatísticas
- Sistema de movimentação de estoque
- Interface responsiva
- Deploy com Docker

