import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

// Criar instância do axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar respostas
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Funções de autenticação
export const auth = {
  login: async (email, senha) => {
    const response = await api.post('/auth/login', { email, senha });
    return response.data;
  },
  
  register: async (nome, email, senha, perfil) => {
    const response = await api.post('/auth/register', { nome, email, senha, perfil });
    return response.data;
  },
  
  me: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};

// Funções para itens
export const itens = {
  list: async (params = {}) => {
    const response = await api.get('/itens', { params });
    return response.data;
  },
  
  get: async (id) => {
    const response = await api.get(`/itens/${id}`);
    return response.data;
  },
  
  create: async (data) => {
    const response = await api.post('/itens', data);
    return response.data;
  },
  
  update: async (id, data) => {
    const response = await api.put(`/itens/${id}`, data);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/itens/${id}`);
    return response.data;
  }
};

// Funções para fornecedores
export const fornecedores = {
  list: async (params = {}) => {
    const response = await api.get('/fornecedores', { params });
    return response.data;
  },
  
  get: async (id) => {
    const response = await api.get(`/fornecedores/${id}`);
    return response.data;
  },
  
  create: async (data) => {
    const response = await api.post('/fornecedores', data);
    return response.data;
  },
  
  update: async (id, data) => {
    const response = await api.put(`/fornecedores/${id}`, data);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/fornecedores/${id}`);
    return response.data;
  }
};

// Funções para obras
export const obras = {
  list: async (params = {}) => {
    const response = await api.get('/obras', { params });
    return response.data;
  },
  
  get: async (id) => {
    const response = await api.get(`/obras/${id}`);
    return response.data;
  },
  
  create: async (data) => {
    const response = await api.post('/obras', data);
    return response.data;
  },
  
  update: async (id, data) => {
    const response = await api.put(`/obras/${id}`, data);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/obras/${id}`);
    return response.data;
  }
};

// Funções para entradas
export const entradas = {
  list: async (params = {}) => {
    const response = await api.get('/entradas', { params });
    return response.data;
  },
  
  get: async (id) => {
    const response = await api.get(`/entradas/${id}`);
    return response.data;
  },
  
  create: async (data) => {
    const response = await api.post('/entradas', data);
    return response.data;
  },
  
  update: async (id, data) => {
    const response = await api.put(`/entradas/${id}`, data);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/entradas/${id}`);
    return response.data;
  }
};

// Funções para saídas
export const saidas = {
  list: async (params = {}) => {
    const response = await api.get('/saidas', { params });
    return response.data;
  },
  
  get: async (id) => {
    const response = await api.get(`/saidas/${id}`);
    return response.data;
  },
  
  create: async (data) => {
    const response = await api.post('/saidas', data);
    return response.data;
  },
  
  update: async (id, data) => {
    const response = await api.put(`/saidas/${id}`, data);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/saidas/${id}`);
    return response.data;
  }
};

export default api;

