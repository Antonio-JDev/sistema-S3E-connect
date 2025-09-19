# Guia de Deploy - Sistema S3E

Este guia fornece instruções detalhadas para fazer o deploy do Sistema de Gestão de Estoque S3E.

## 🐳 Deploy com Docker (Recomendado)

### Pré-requisitos
- Docker 20.10+
- Docker Compose 2.0+
- 2GB RAM mínimo
- 10GB espaço em disco

### Passo a Passo

#### 1. Preparação do Servidor
```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Instalar Docker Compose
sudo apt install docker-compose-plugin

# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER
newgrp docker
```

#### 2. Configuração do Projeto
```bash
# Clonar ou transferir arquivos do projeto
# Assumindo que os arquivos estão em /opt/s3e
cd /opt/s3e

# Verificar estrutura de arquivos
ls -la
# Deve conter: docker-compose.yml, Dockerfile.backend, Dockerfile.frontend, etc.
```

#### 3. Configuração de Produção
```bash
# Editar docker-compose.yml
nano docker-compose.yml

# Alterar as seguintes configurações:
# - POSTGRES_PASSWORD: senha forte
# - JWT_SECRET: chave secreta forte
# - Portas se necessário (80:80 para frontend, 3001:3001 para backend)
```

#### 4. Configuração de Segurança
```bash
# Gerar senha forte para PostgreSQL
openssl rand -base64 32

# Gerar JWT secret
openssl rand -base64 64

# Editar docker-compose.yml com as senhas geradas
```

#### 5. Deploy
```bash
# Construir e iniciar todos os serviços
docker-compose up -d

# Verificar status dos containers
docker-compose ps

# Verificar logs
docker-compose logs -f

# Testar aplicação
curl http://localhost/
curl http://localhost:3001/api/health
```

#### 6. Configuração de Domínio (Opcional)
```bash
# Se usando domínio próprio, configurar proxy reverso
# Exemplo com Nginx no host:

sudo apt install nginx

# Criar configuração
sudo nano /etc/nginx/sites-available/s3e

# Conteúdo do arquivo:
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Ativar site
sudo ln -s /etc/nginx/sites-available/s3e /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🔧 Deploy Manual

### Pré-requisitos
- Ubuntu 20.04+ ou CentOS 8+
- Node.js 18+
- PostgreSQL 14+
- Nginx
- PM2 (para gerenciamento de processos)

### Backend

#### 1. Preparação do Ambiente
```bash
# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PM2
sudo npm install -g pm2

# Instalar PostgreSQL
sudo apt install postgresql postgresql-contrib
```

#### 2. Configuração do Banco
```bash
# Configurar PostgreSQL
sudo -u postgres psql

-- No prompt do PostgreSQL:
CREATE DATABASE stock_management;
CREATE USER s3e_user WITH PASSWORD 'senha_forte_aqui';
GRANT ALL PRIVILEGES ON DATABASE stock_management TO s3e_user;
\q

# Executar script de inicialização
sudo -u postgres psql -d stock_management -f backend/scripts/init-db.sql
```

#### 3. Deploy do Backend
```bash
# Navegar para diretório do backend
cd /opt/s3e/backend

# Instalar dependências
npm install --production

# Configurar variáveis de ambiente
cp .env.example .env
nano .env

# Conteúdo do .env para produção:
DB_HOST=localhost
DB_PORT=5432
DB_NAME=stock_management
DB_USER=s3e_user
DB_PASSWORD=senha_forte_aqui
PORT=3001
NODE_ENV=production
JWT_SECRET=jwt_secret_muito_forte_aqui
JWT_EXPIRES_IN=24h
CORS_ORIGIN=*

# Iniciar com PM2
pm2 start server.js --name "s3e-backend"
pm2 save
pm2 startup
```

### Frontend

#### 1. Build do Frontend
```bash
# Navegar para diretório do frontend
cd /opt/s3e/frontend

# Instalar dependências
npm install

# Configurar API URL para produção
nano src/lib/api.js
# Alterar API_BASE_URL para URL do seu servidor

# Build da aplicação
npm run build
```

#### 2. Configuração do Nginx
```bash
# Instalar Nginx
sudo apt install nginx

# Copiar arquivos buildados
sudo cp -r dist/* /var/www/html/

# Configurar Nginx
sudo nano /etc/nginx/sites-available/default

# Conteúdo da configuração:
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    root /var/www/html;
    index index.html;

    server_name _;

    # Frontend (SPA)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API Backend
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Cache para assets estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# Testar configuração
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

## 🔒 Configurações de Segurança

### Firewall
```bash
# Configurar UFW
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw status
```

### SSL/HTTPS (Recomendado)
```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obter certificado SSL
sudo certbot --nginx -d seu-dominio.com

# Renovação automática
sudo crontab -e
# Adicionar linha:
0 12 * * * /usr/bin/certbot renew --quiet
```

### Backup do Banco
```bash
# Criar script de backup
sudo nano /opt/backup-s3e.sh

#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/backups"
mkdir -p $BACKUP_DIR

# Backup do banco
sudo -u postgres pg_dump stock_management > $BACKUP_DIR/s3e_backup_$DATE.sql

# Manter apenas últimos 7 backups
find $BACKUP_DIR -name "s3e_backup_*.sql" -mtime +7 -delete

# Tornar executável
sudo chmod +x /opt/backup-s3e.sh

# Agendar backup diário
sudo crontab -e
# Adicionar linha:
0 2 * * * /opt/backup-s3e.sh
```

## 📊 Monitoramento

### Logs
```bash
# Logs do Docker
docker-compose logs -f

# Logs do PM2
pm2 logs s3e-backend

# Logs do Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Logs do PostgreSQL
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

### Monitoramento de Recursos
```bash
# Status dos containers
docker-compose ps

# Uso de recursos
docker stats

# Status do PM2
pm2 status
pm2 monit

# Status do sistema
htop
df -h
free -h
```

## 🔄 Atualizações

### Com Docker
```bash
# Parar serviços
docker-compose down

# Atualizar código
git pull  # ou transferir novos arquivos

# Reconstruir e iniciar
docker-compose up -d --build

# Verificar logs
docker-compose logs -f
```

### Deploy Manual
```bash
# Atualizar backend
cd /opt/s3e/backend
git pull  # ou transferir arquivos
npm install --production
pm2 restart s3e-backend

# Atualizar frontend
cd /opt/s3e/frontend
git pull  # ou transferir arquivos
npm install
npm run build
sudo cp -r dist/* /var/www/html/
```

## 🆘 Troubleshooting

### Problemas Comuns

#### Container não inicia
```bash
# Verificar logs
docker-compose logs [service_name]

# Verificar configuração
docker-compose config

# Reconstruir container
docker-compose up -d --build [service_name]
```

#### Erro de conexão com banco
```bash
# Verificar se PostgreSQL está rodando
docker-compose ps postgres

# Verificar logs do banco
docker-compose logs postgres

# Testar conexão
docker-compose exec postgres psql -U postgres -d stock_management
```

#### Frontend não carrega
```bash
# Verificar se Nginx está rodando
sudo systemctl status nginx

# Verificar configuração
sudo nginx -t

# Verificar logs
sudo tail -f /var/log/nginx/error.log
```

#### API não responde
```bash
# Verificar se backend está rodando
pm2 status
# ou
docker-compose ps backend

# Verificar logs
pm2 logs s3e-backend
# ou
docker-compose logs backend

# Testar API diretamente
curl http://localhost:3001/api/health
```

### Comandos Úteis

```bash
# Reiniciar todos os serviços (Docker)
docker-compose restart

# Reiniciar serviço específico
docker-compose restart backend

# Ver uso de recursos
docker stats

# Limpar containers parados
docker system prune

# Backup completo
docker-compose exec postgres pg_dump -U postgres stock_management > backup.sql

# Restaurar backup
docker-compose exec -T postgres psql -U postgres stock_management < backup.sql
```

## 📞 Suporte

Para problemas durante o deploy:

1. Verificar logs conforme instruções acima
2. Consultar seção de troubleshooting
3. Verificar configurações de rede e firewall
4. Entrar em contato com a equipe de desenvolvimento

## ✅ Checklist de Deploy

- [ ] Servidor preparado com Docker/Node.js
- [ ] Banco de dados configurado
- [ ] Variáveis de ambiente configuradas
- [ ] Senhas alteradas para produção
- [ ] Firewall configurado
- [ ] SSL configurado (se aplicável)
- [ ] Backup configurado
- [ ] Monitoramento configurado
- [ ] Testes de funcionamento realizados
- [ ] Documentação atualizada

