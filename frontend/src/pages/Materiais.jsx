import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Search, Edit, Trash2, Package, AlertTriangle } from 'lucide-react';
import { itens } from '../lib/api';

const Materiais = () => {
  const [materiaisList, setMateriaisList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    codigo: '',
    descricao: '',
    categoria_id: '',
    unidade_base_id: '',
    estoque_minimo: '',
    comprimento_por_unidade: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Dados estáticos para categorias e unidades (podem vir da API)
  const categorias = [
    { id: 1, nome: 'Cabos' },
    { id: 2, nome: 'Disjuntores' },
    { id: 3, nome: 'Eletrodutos' },
    { id: 4, nome: 'Iluminação' },
    { id: 5, nome: 'Tomadas' },
    { id: 6, nome: 'Conectores' }
  ];

  const unidades = [
    { id: 1, sigla: 'm', descricao: 'Metro' },
    { id: 2, sigla: 'un', descricao: 'Unidade' },
    { id: 3, sigla: 'rolo', descricao: 'Rolo' },
    { id: 4, sigla: 'kg', descricao: 'Quilograma' }
  ];

  useEffect(() => {
    fetchMateriais();
  }, []);

  const fetchMateriais = async () => {
    try {
      setLoading(true);
      const response = await itens.list({ limit: 1000 });
      setMateriaisList(response.itens || []);
    } catch (error) {
      setError('Erro ao carregar materiais');
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const data = {
        ...formData,
        categoria_id: formData.categoria_id ? parseInt(formData.categoria_id) : null,
        unidade_base_id: parseInt(formData.unidade_base_id),
        estoque_minimo: formData.estoque_minimo ? parseFloat(formData.estoque_minimo) : 0,
        comprimento_por_unidade: formData.comprimento_por_unidade ? parseFloat(formData.comprimento_por_unidade) : null
      };

      if (editingItem) {
        await itens.update(editingItem.id, data);
        setSuccess('Material atualizado com sucesso!');
      } else {
        await itens.create(data);
        setSuccess('Material criado com sucesso!');
      }

      setDialogOpen(false);
      setEditingItem(null);
      setFormData({
        codigo: '',
        descricao: '',
        categoria_id: '',
        unidade_base_id: '',
        estoque_minimo: '',
        comprimento_por_unidade: ''
      });
      fetchMateriais();
    } catch (error) {
      setError(error.response?.data?.error || 'Erro ao salvar material');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      codigo: item.codigo,
      descricao: item.descricao,
      categoria_id: item.categoria_id?.toString() || '',
      unidade_base_id: item.unidade_base_id?.toString() || '',
      estoque_minimo: item.estoque_minimo || '',
      comprimento_por_unidade: item.comprimento_por_unidade || ''
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este material?')) {
      try {
        await itens.delete(id);
        setSuccess('Material excluído com sucesso!');
        fetchMateriais();
      } catch (error) {
        setError('Erro ao excluir material');
      }
    }
  };

  const filteredMateriais = materiaisList.filter(material =>
    material.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.descricao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getEstoqueStatus = (material) => {
    const saldoAtual = parseFloat(material.estoques?.[0]?.saldo_base || 0);
    const estoqueMinimo = parseFloat(material.estoque_minimo || 0);
    
    if (saldoAtual <= estoqueMinimo) {
      return { status: 'baixo', color: 'destructive' };
    } else if (saldoAtual <= estoqueMinimo * 1.5) {
      return { status: 'atenção', color: 'secondary' };
    }
    return { status: 'ok', color: 'default' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Materiais</h1>
          <p className="text-gray-600">Gerencie o catálogo de materiais do estoque</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingItem(null);
              setFormData({
                codigo: '',
                descricao: '',
                categoria_id: '',
                unidade_base_id: '',
                estoque_minimo: '',
                comprimento_por_unidade: ''
              });
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Material
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? 'Editar Material' : 'Novo Material'}
              </DialogTitle>
              <DialogDescription>
                {editingItem ? 'Edite as informações do material' : 'Adicione um novo material ao catálogo'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="codigo">Código</Label>
                <Input
                  id="codigo"
                  value={formData.codigo}
                  onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                  placeholder="Ex: CAB001"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Input
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Ex: Cabo Flexível 2,5mm²"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria</Label>
                <Select value={formData.categoria_id} onValueChange={(value) => setFormData({ ...formData, categoria_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map((categoria) => (
                      <SelectItem key={categoria.id} value={categoria.id.toString()}>
                        {categoria.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="unidade">Unidade Base</Label>
                <Select value={formData.unidade_base_id} onValueChange={(value) => setFormData({ ...formData, unidade_base_id: value })} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma unidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {unidades.map((unidade) => (
                      <SelectItem key={unidade.id} value={unidade.id.toString()}>
                        {unidade.sigla} - {unidade.descricao}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="estoque_minimo">Estoque Mínimo</Label>
                <Input
                  id="estoque_minimo"
                  type="number"
                  step="0.01"
                  value={formData.estoque_minimo}
                  onChange={(e) => setFormData({ ...formData, estoque_minimo: e.target.value })}
                  placeholder="0"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="comprimento_por_unidade">Comprimento por Unidade</Label>
                <Input
                  id="comprimento_por_unidade"
                  type="number"
                  step="0.01"
                  value={formData.comprimento_por_unidade}
                  onChange={(e) => setFormData({ ...formData, comprimento_por_unidade: e.target.value })}
                  placeholder="Ex: 100 (para 1 rolo = 100m)"
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingItem ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por código ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Materials Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Lista de Materiais</span>
          </CardTitle>
          <CardDescription>
            {filteredMateriais.length} material(is) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Carregando materiais...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Unidade</TableHead>
                  <TableHead>Estoque Atual</TableHead>
                  <TableHead>Estoque Mín.</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMateriais.map((material) => {
                  const estoqueStatus = getEstoqueStatus(material);
                  const saldoAtual = parseFloat(material.estoques?.[0]?.saldo_base || 0);
                  
                  return (
                    <TableRow key={material.id}>
                      <TableCell className="font-medium">{material.codigo}</TableCell>
                      <TableCell>{material.descricao}</TableCell>
                      <TableCell>{material.categoria?.nome || '-'}</TableCell>
                      <TableCell>{material.unidadeBase?.sigla}</TableCell>
                      <TableCell>{saldoAtual.toFixed(2)}</TableCell>
                      <TableCell>{parseFloat(material.estoque_minimo || 0).toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={estoqueStatus.color}>
                          {estoqueStatus.status === 'baixo' && <AlertTriangle className="mr-1 h-3 w-3" />}
                          {estoqueStatus.status === 'baixo' ? 'Baixo' : 
                           estoqueStatus.status === 'atenção' ? 'Atenção' : 'OK'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(material)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(material.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Materiais;

