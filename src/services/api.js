import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Intercepteur de requête pour attacher le token d'authentification Sanctum
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('immo_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur de réponse pour intercepter les accès non autorisés (401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('immo_token');
      localStorage.removeItem('immo_user');
      // Redirection gérée par le routage si nécessaire
    }
    return Promise.reject(error);
  }
);

export const authService = {
  // Connexion de l'utilisateur
  login: async (credentials) => {
    const res = await api.post('/login', credentials);
    if (res.data.token) {
      localStorage.setItem('immo_token', res.data.token);
      localStorage.setItem('immo_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },
  // Inscription de l'utilisateur
  register: async (userData) => {
    const res = await api.post('/register', userData);
    if (res.data.token) {
      localStorage.setItem('immo_token', res.data.token);
      localStorage.setItem('immo_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },
  // Déconnexion de l'utilisateur
  logout: async () => {
    try {
      await api.post('/logout');
    } finally {
      localStorage.removeItem('immo_token');
      localStorage.removeItem('immo_user');
    }
  },
  // Récupérer le profil utilisateur connecté
  getProfile: async () => {
    const res = await api.get('/profile');
    return res.data;
  },
  // Mettre à jour le profil de l'utilisateur
  updateProfile: async (profileData) => {
    const res = await api.put('/profile', profileData);
    return res.data;
  },
  // Récupérer la liste des agents
  getAgents: async () => {
    const res = await api.get('/users/agents');
    return res.data;
  },
  // Récupérer la liste des clients
  getClients: async () => {
    const res = await api.get('/users/clients');
    return res.data;
  },
};

export const bienService = {
  // Récupérer tous les biens immobiliers avec des filtres
  getAll: async (filters = {}) => {
    const res = await api.get('/biens', { params: filters });
    return res.data;
  },
  // Récupérer les détails d'un bien immobilier par son ID
  getById: async (id) => {
    const res = await api.get(`/biens/${id}`);
    return res.data.data;
  },
  // Créer une nouvelle annonce de bien immobilier (avec images)
  create: async (formData) => {
    const res = await api.post('/biens', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },
  // Mettre à jour un bien existant (POST + _method=PUT pour le support de l'upload d'images)
  update: async (id, formData) => {
    if (formData instanceof FormData) {
      formData.append('_method', 'PUT');
    }
    const res = await api.post(`/biens/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },
  // Supprimer un bien immobilier
  delete: async (id) => {
    const res = await api.delete(`/biens/${id}`);
    return res.data;
  },
};

export const favoriService = {
  // Récupérer tous les favoris du client
  getAll: async () => {
    const res = await api.get('/favoris');
    return res.data.data;
  },
  // Ajouter/Enlever un bien des favoris
  toggle: async (bienId) => {
    const res = await api.post('/favoris/toggle', { bien_id: bienId });
    return res.data;
  },
};

export const visiteService = {
  // Récupérer toutes les demandes de visites
  getAll: async () => {
    const res = await api.get('/visites');
    return res.data.data;
  },
  // Planifier une visite
  create: async (visiteData) => {
    const res = await api.post('/visites', visiteData);
    return res.data;
  },
  // Mettre à jour le statut ou les informations d'une visite
  update: async (id, visiteData) => {
    const res = await api.put(`/visites/${id}`, visiteData);
    return res.data;
  },
  // Supprimer/Annuler une visite
  delete: async (id) => {
    const res = await api.delete(`/visites/${id}`);
    return res.data;
  },
};

export const transactionService = {
  // Récupérer toutes les transactions
  getAll: async () => {
    const res = await api.get('/transactions');
    return res.data.data;
  },
  // Enregistrer une transaction (vente ou location)
  create: async (transactionData) => {
    const res = await api.post('/transactions', transactionData);
    return res.data;
  },
  // Récupérer les détails d'une transaction spécifique
  getById: async (id) => {
    const res = await api.get(`/transactions/${id}`);
    return res.data.data;
  },
  // Annuler/Supprimer une transaction
  delete: async (id) => {
    const res = await api.delete(`/transactions/${id}`);
    return res.data;
  },
};

export const messageService = {
  // Récupérer tous les messages de contact (public)
  getAll: async () => {
    const res = await api.get('/messages');
    return res.data.data;
  },
  // Soumettre un message de contact public
  create: async (messageData) => {
    const res = await api.post('/messages', messageData);
    return res.data;
  },
  // Récupérer un message par son ID
  getById: async (id) => {
    const res = await api.get(`/messages/${id}`);
    return res.data.data;
  },
  // Supprimer un message
  delete: async (id) => {
    const res = await api.delete(`/messages/${id}`);
    return res.data;
  },
};

export default api;
