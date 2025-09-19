import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Users, Building, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { itens, fornecedores, obras } from '../lib/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalItens: 0,
    itensAtivos: 0,
    totalFornecedores: 0,
    totalObras: 0,
    itensEstoqueBaixo: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [itensData, fornecedoresData, obrasData] = await Promise.all([
          itens.list({ limit: 1000 }),
          fornecedores.list({ limit: 1000 }),
          obras.list({ limit: 1000 })
        ]);

        const itensAtivos = itensData.itens.filter(item => item.ativo);
        const itensEstoqueBaixo = itensData.itens.filter(item => {
          const saldoAtual = item.estoques?.[0]?.saldo_base || 0;
          return parseFloat(saldoAtual) <= parseFloat(item.estoque_minimo || 0);
        });

        setStats({
          totalItens: itensData.total,
          itensAtivos: itensAtivos.length,
          totalFornecedores: fornecedoresData.total,
          totalObras: obrasData.total,
          itensEstoqueBaixo: itensEstoqueBaixo.length
        });
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total de Itens',
      value: stats.totalItens,
      description: `${stats.itensAtivos} ativos`,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Fornecedores',
      value: stats.totalFornecedores,
      description: 'Cadastrados no sistema',
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Projetos/Obras',
      value: stats.totalObras,
      description: 'Em andamento',
      icon: Building,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Estoque Baixo',
      value: stats.itensEstoqueBaixo,
      description: 'Itens abaixo do mínimo',
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.description}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Alertas e Informações */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span>Alertas de Estoque</span>
            </CardTitle>
            <CardDescription>
              Itens com estoque abaixo do mínimo
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.itensEstoqueBaixo > 0 ? (
              <div className="space-y-2">
                <Badge variant="destructive" className="mb-2">
                  {stats.itensEstoqueBaixo} item(s) em falta
                </Badge>
                <p className="text-sm text-gray-600">
                  Verifique a seção de Materiais para mais detalhes sobre os itens que precisam de reposição.
                </p>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm">Todos os itens estão com estoque adequado</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              <span>Resumo do Sistema</span>
            </CardTitle>
            <CardDescription>
              Visão geral das operações
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Itens Cadastrados</span>
                <Badge variant="secondary">{stats.totalItens}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Fornecedores Ativos</span>
                <Badge variant="secondary">{stats.totalFornecedores}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Projetos em Andamento</span>
                <Badge variant="secondary">{stats.totalObras}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>
            Acesse rapidamente as funcionalidades mais utilizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <Package className="h-8 w-8 text-blue-500 mb-2" />
              <h3 className="font-medium">Cadastrar Material</h3>
              <p className="text-sm text-gray-600">Adicionar novo item ao estoque</p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <TrendingUp className="h-8 w-8 text-green-500 mb-2" />
              <h3 className="font-medium">Registrar Entrada</h3>
              <p className="text-sm text-gray-600">Dar entrada de materiais</p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <Building className="h-8 w-8 text-purple-500 mb-2" />
              <h3 className="font-medium">Nova Obra</h3>
              <p className="text-sm text-gray-600">Cadastrar novo projeto</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;

