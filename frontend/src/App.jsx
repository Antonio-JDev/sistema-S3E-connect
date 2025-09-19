import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Materiais from './pages/Materiais';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="materiais" element={<Materiais />} />
            <Route path="fornecedores" element={<div className="p-6">Fornecedores - Em desenvolvimento</div>} />
            <Route path="projetos" element={<div className="p-6">Projetos - Em desenvolvimento</div>} />
            <Route path="entradas" element={<div className="p-6">Entradas - Em desenvolvimento</div>} />
            <Route path="saidas" element={<div className="p-6">Saídas - Em desenvolvimento</div>} />
            <Route path="relatorios" element={<div className="p-6">Relatórios - Em desenvolvimento</div>} />
            <Route path="configuracoes" element={<div className="p-6">Configurações - Em desenvolvimento</div>} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
