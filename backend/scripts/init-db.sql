-- Script de inicialização do banco de dados
-- Sistema de Gestão de Estoque S3E

-- Criar banco de dados (se não existir)
-- CREATE DATABASE stock_management;

-- Conectar ao banco
\c stock_management;

-- Criar tabelas conforme esquema fornecido

CREATE TABLE IF NOT EXISTS unidades_medida (
  id SERIAL PRIMARY KEY,
  sigla TEXT UNIQUE NOT NULL, -- m, un, rolo
  descricao TEXT,
  fator_base NUMERIC(18,6) NOT NULL DEFAULT 1 -- conversão para unidade base do item
);

CREATE TABLE IF NOT EXISTS categorias (
  id SERIAL PRIMARY KEY,
  nome TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS itens (
  id SERIAL PRIMARY KEY,
  codigo TEXT UNIQUE NOT NULL,
  descricao TEXT NOT NULL,
  categoria_id INT REFERENCES categorias(id),
  unidade_base_id INT REFERENCES unidades_medida(id) NOT NULL,
  estoque_minimo NUMERIC(18,6) DEFAULT 0,
  comprimento_por_unidade NUMERIC(18,6), -- ex.: 1 rolo = 100 m
  ativo BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS fornecedores (
  id SERIAL PRIMARY KEY,
  razao_social TEXT NOT NULL,
  cnpj TEXT,
  contato TEXT,
  telefone TEXT,
  email TEXT
);

CREATE TABLE IF NOT EXISTS obras (
  id SERIAL PRIMARY KEY,
  codigo TEXT UNIQUE NOT NULL,
  nome TEXT NOT NULL,
  cliente TEXT,
  responsavel TEXT,
  status TEXT
);

CREATE TABLE IF NOT EXISTS estoques (
  id SERIAL PRIMARY KEY,
  item_id INT REFERENCES itens(id),
  local TEXT DEFAULT 'DEPÓSITO',
  saldo_base NUMERIC(18,6) NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS entradas (
  id SERIAL PRIMARY KEY,
  data TIMESTAMP NOT NULL DEFAULT NOW(),
  fornecedor_id INT REFERENCES fornecedores(id),
  nf_numero TEXT,
  nf_chave TEXT,
  criado_por INT
);

CREATE TABLE IF NOT EXISTS entradas_itens (
  id SERIAL PRIMARY KEY,
  entrada_id INT REFERENCES entradas(id),
  item_id INT REFERENCES itens(id),
  quantidade_base NUMERIC(18,6) NOT NULL,
  valor_total NUMERIC(18,6) NOT NULL,
  valor_unit_ultima_compra NUMERIC(18,6) GENERATED ALWAYS AS (valor_total/NULLIF(quantidade_base,0)) STORED,
  unidade_id INT REFERENCES unidades_medida(id)
);

CREATE TABLE IF NOT EXISTS saidas (
  id SERIAL PRIMARY KEY,
  data TIMESTAMP NOT NULL DEFAULT NOW(),
  obra_id INT REFERENCES obras(id),
  criado_por INT
);

CREATE TABLE IF NOT EXISTS saidas_itens (
  id SERIAL PRIMARY KEY,
  saida_id INT REFERENCES saidas(id),
  item_id INT REFERENCES itens(id),
  quantidade_base NUMERIC(18,6) NOT NULL,
  valor_unit_referencia NUMERIC(18,6), -- última compra na data ou CMP
  unidade_id INT REFERENCES unidades_medida(id)
);

-- Tabela de usuários para autenticação
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  perfil VARCHAR(50) NOT NULL DEFAULT 'TecnicoCampo',
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- View para histórico de preços
CREATE OR REPLACE VIEW historico_precos AS
SELECT ei.item_id, e.fornecedor_id, e.data::date AS data,
       ei.quantidade_base, ei.valor_total,
       ei.valor_unit_ultima_compra AS valor_unit
FROM entradas_itens ei
JOIN entradas e ON e.id = ei.entrada_id;

-- Inserir dados iniciais

-- Unidades de medida
INSERT INTO unidades_medida (sigla, descricao, fator_base) VALUES
('m', 'Metro', 1.0),
('un', 'Unidade', 1.0),
('rolo', 'Rolo', 1.0),
('kg', 'Quilograma', 1.0),
('pc', 'Peça', 1.0),
('cx', 'Caixa', 1.0)
ON CONFLICT (sigla) DO NOTHING;

-- Categorias
INSERT INTO categorias (nome) VALUES
('Cabos'),
('Disjuntores'),
('Eletrodutos'),
('Iluminação'),
('Tomadas'),
('Conectores'),
('Quadros'),
('Bornes'),
('Contatores'),
('Outros')
ON CONFLICT (nome) DO NOTHING;

-- Fornecedores
INSERT INTO fornecedores (razao_social, cnpj, contato, telefone, email) VALUES
('Distribuidora Elétrica Ltda', '12.345.678/0001-90', 'João Silva', '(11) 99999-9999', 'joao@distribuidora.com'),
('Ferragens & Cia', '98.765.432/0001-10', 'Maria Santos', '(11) 88888-8888', 'maria@ferragens.com'),
('Iluminação Premium', '11.222.333/0001-44', 'Pedro Costa', '(11) 77777-7777', 'pedro@iluminacao.com'),
('Materiais de Construção São Paulo', '55.666.777/0001-88', 'Ana Oliveira', '(11) 66666-6666', 'ana@materiais.com'),
('Tecnologia em Energia', '99.888.777/0001-66', 'Carlos Ferreira', '(11) 55555-5555', 'carlos@energia.com');

-- Obras
INSERT INTO obras (codigo, nome, cliente, responsavel, status) VALUES
('OBR001', 'Shopping Center', 'Construtora ABC', 'Eng. João Silva', 'em_andamento'),
('OBR002', 'Residencial Alphaville', 'Incorporadora XYZ', 'Eng. Maria Santos', 'em_andamento'),
('OBR003', 'Galpão Industrial', 'Indústrias Beta', 'Eng. Pedro Costa', 'concluido'),
('OBR004', 'Edifício Commercial', 'Empreendimentos Gamma', 'Eng. Ana Oliveira', 'planejamento'),
('OBR005', 'Hospital Municipal', 'Prefeitura Municipal', 'Eng. Carlos Ferreira', 'pausado');

-- Usuário administrador padrão (senha: admin123)
INSERT INTO usuarios (nome, email, senha, perfil) VALUES
('Administrador', 'admin@s3e.com.br', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrador')
ON CONFLICT (email) DO NOTHING;

-- Itens de exemplo
INSERT INTO itens (codigo, descricao, categoria_id, unidade_base_id, estoque_minimo, comprimento_por_unidade) VALUES
('CAB001', 'Cabo Flexível 2,5mm² Vermelho', 1, 1, 100, NULL),
('CAB002', 'Cabo Flexível 4,0mm² Azul', 1, 1, 50, NULL),
('DIS001', 'Disjuntor Bipolar 25A', 2, 2, 20, NULL),
('DIS002', 'Disjuntor Tripolar 40A', 2, 2, 15, NULL),
('ELE001', 'Eletroduto 25mm PVC', 3, 1, 50, NULL),
('LUM001', 'Luminária LED 18W', 4, 2, 10, NULL),
('TOM001', 'Tomada 2P+T 10A', 5, 2, 30, NULL),
('CON001', 'Conector 16mm²', 6, 2, 100, NULL);

-- Criar estoques iniciais para os itens
INSERT INTO estoques (item_id, local, saldo_base)
SELECT id, 'DEPÓSITO', 0
FROM itens
ON CONFLICT DO NOTHING;

