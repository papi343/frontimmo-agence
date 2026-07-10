import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Briefcase, Heart, Calendar, MessageSquare, DollarSign, Plus, Trash2, 
  Edit, Check, X, Camera, RefreshCw, LogOut, ChevronRight, Eye
} from 'lucide-react';
import { 
  authService, bienService, favoriService, visiteService, 
  transactionService, messageService 
} from '../services/api';
import PropertyCard from '../components/PropertyCard';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('');
  const [loading, setLoading] = useState(true);

  // États des données
  const [properties, setProperties] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [visits, setVisits] = useState([]);
  const [messages, setMessages] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [agents, setAgents] = useState([]);
  const [clients, setClients] = useState([]);

  // État du formulaire de profil
  const [profileForm, setProfileForm] = useState({ nom: '', prenom: '', tel: '', email: '' });
  const [profileStatus, setProfileStatus] = useState({ type: '', text: '' });

  // État du modal et du formulaire de bien
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [propertyForm, setPropertyForm] = useState({
    titre: '',
    description: '',
    type: 'maison',
    statut: 'a_vendre',
    prix: '',
    surface: '',
    pieces: '',
    chambres: '',
    salles_de_bain: '',
    adresse: '',
    ville: '',
    code_postal: '',
    featuresString: '',
    agent_id: '',
    proprietaire_id: '',
  });
  const [propertyImages, setPropertyImages] = useState([]);
  const [propertyError, setPropertyError] = useState('');
  const [propertyLoading, setPropertyLoading] = useState(false);

  // État du modal de transaction
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txForm, setTxForm] = useState({
    bien_id: '',
    client_id: '',
    agent_id: '',
    type: 'vente',
    prix_final: '',
    date_transaction: new Date().toISOString().split('T')[0],
  });
  const [txLoading, setTxLoading] = useState(false);

  // Vérifier l'authentification
  useEffect(() => {
    const storedUser = localStorage.getItem('immo_user');
    const token = localStorage.getItem('immo_token');
    
    if (!storedUser || !token) {
      navigate('/login');
      return;
    }

    const currentUser = JSON.parse(storedUser);
    setUser(currentUser);
    setProfileForm({
      nom: currentUser.nom || '',
      prenom: currentUser.prenom || '',
      tel: currentUser.tel || '',
      email: currentUser.email || '',
    });

    // Définir l'onglet par défaut selon le rôle
    if (currentUser.role === 'client') {
      setActiveTab('favorites');
    } else {
      setActiveTab('properties');
    }
  }, [navigate]);

  // Récupérer les données de l'onglet actif lors du changement d'onglet
  useEffect(() => {
    if (!user || !activeTab) return;

    const fetchTabData = async () => {
      try {
        setLoading(true);
        if (activeTab === 'favorites') {
          const favs = await favoriService.getAll();
          setFavorites(favs || []);
        } else if (activeTab === 'visits') {
          const vists = await visiteService.getAll();
          setVisits(vists || []);
        } else if (activeTab === 'properties') {
          const response = await bienService.getAll({ per_page: 100 });
          setProperties(response.data || response || []);
          
          // Charger les agents et clients pour les menus déroulants des formulaires
          if (user.role === 'admin' || user.role === 'agent') {
            const ags = await authService.getAgents();
            setAgents(ags || []);
            const cls = await authService.getClients();
            setClients(cls || []);
          }
        } else if (activeTab === 'messages') {
          const msgs = await messageService.getAll();
          setMessages(msgs || []);
        } else if (activeTab === 'transactions') {
          const txs = await transactionService.getAll();
          setTransactions(txs || []);
          // S'assurer que les biens sont chargés
          const response = await bienService.getAll({ per_page: 100 });
          setProperties(response.data || response || []);
          const cls = await authService.getClients();
          setClients(cls || []);
        }
      } catch (err) {
        console.error('Error fetching tab data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTabData();
  }, [activeTab, user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileStatus({ type: 'info', text: 'Mise à jour...' });
    try {
      const res = await authService.updateProfile(profileForm);
      // Le backend renvoie l'utilisateur mis à jour
      const updatedUser = { ...user, ...res.user };
      localStorage.setItem('immo_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setProfileStatus({ type: 'success', text: 'Profil mis à jour avec succès.' });
    } catch (err) {
      console.error(err);
      setProfileStatus({ type: 'error', text: 'Impossible de mettre à jour le profil.' });
    }
  };

  // Gestionnaires de biens
  const handlePropertyEdit = (prop) => {
    setEditingProperty(prop);
    setPropertyForm({
      titre: prop.titre,
      description: prop.description,
      type: prop.type,
      statut: prop.statut,
      prix: prop.prix,
      surface: prop.surface,
      pieces: prop.pieces || '',
      chambres: prop.chambres || '',
      salles_de_bain: prop.salles_de_bain || '',
      adresse: prop.adresse,
      ville: prop.ville,
      code_postal: prop.code_postal,
      featuresString: prop.features ? prop.features.join(', ') : '',
      agent_id: prop.agent_id || user.id,
      proprietaire_id: prop.proprietaire_id || '',
    });
    setPropertyImages([]);
    setPropertyError('');
    setIsPropertyModalOpen(true);
  };

  const handleOpenCreateProperty = () => {
    setEditingProperty(null);
    setPropertyForm({
      titre: '',
      description: '',
      type: 'maison',
      statut: 'a_vendre',
      prix: '',
      surface: '',
      pieces: '',
      chambres: '',
      salles_de_bain: '',
      adresse: '',
      ville: '',
      code_postal: '',
      featuresString: '',
      agent_id: user.id,
      proprietaire_id: '',
    });
    setPropertyImages([]);
    setPropertyError('');
    setIsPropertyModalOpen(true);
  };

  const handlePropertyImageChange = (e) => {
    setPropertyImages(Array.from(e.target.files));
  };

  const handlePropertyFormChange = (e) => {
    const { name, value } = e.target;
    setPropertyForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePropertySubmit = async (e) => {
    e.preventDefault();
    setPropertyLoading(true);
    setPropertyError('');

    const formData = new FormData();
    Object.entries(propertyForm).forEach(([key, val]) => {
      if (key !== 'featuresString' && val !== '') {
        formData.append(key, val);
      }
    });

    // Analyser et séparer les équipements par des virgules
    if (propertyForm.featuresString) {
      const features = propertyForm.featuresString
        .split(',')
        .map(f => f.trim())
        .filter(f => f !== '');
      
      features.forEach((feature, i) => {
        formData.append(`features[${i}]`, feature);
      });
    }

    // Ajouter les images
    propertyImages.forEach((img) => {
      formData.append('images[]', img);
    });

    try {
      if (editingProperty) {
        await bienService.update(editingProperty.id, formData);
      } else {
        await bienService.create(formData);
      }
      setIsPropertyModalOpen(false);
      // Recharger la liste des biens
      const response = await bienService.getAll({ per_page: 100 });
      setProperties(response.data || response || []);
    } catch (err) {
      console.error(err);
      setPropertyError(err.response?.data?.message || 'Erreur lors de la validation du bien.');
    } finally {
      setPropertyLoading(false);
    }
  };

  const handlePropertyDelete = async (propId) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce bien immobilier ?')) return;
    try {
      await bienService.delete(propId);
      setProperties(prev => prev.filter(p => p.id !== propId));
    } catch (err) {
      console.error(err);
      alert('Impossible de supprimer le bien.');
    }
  };

  // Actions sur les visites
  const handleVisitStatusChange = async (visit, newStatus) => {
    try {
      // Mettre à jour le statut de la visite auprès du backend
      await visiteService.update(visit.id, {
        bien_id: visit.bien_id,
        date_visite: visit.date_visite,
        statut: newStatus
      });
      // Mettre à jour l'état local
      setVisits(prev => prev.map(v => v.id === visit.id ? { ...v, statut: newStatus } : v));
    } catch (err) {
      console.error(err);
      alert('Erreur de mise à jour de la visite.');
    }
  };

  // Actions sur les messages
  const handleMessageDelete = async (msgId) => {
    if (!window.confirm('Voulez-vous supprimer ce message ?')) return;
    try {
      await messageService.delete(msgId);
      setMessages(prev => prev.filter(m => m.id !== msgId));
    } catch (err) {
      console.error(err);
    }
  };

  // Actions sur les transactions
  const handleTxSubmit = async (e) => {
    e.preventDefault();
    setTxLoading(true);
    try {
      await transactionService.create(txForm);
      setIsTxModalOpen(false);
      // Réinitialiser le formulaire
      setTxForm({
        bien_id: '',
        client_id: '',
        agent_id: user.id,
        type: 'vente',
        prix_final: '',
        date_transaction: new Date().toISOString().split('T')[0],
      });
      // Recharger la liste des transactions
      const txs = await transactionService.getAll();
      setTransactions(txs || []);
    } catch (err) {
      console.error(err);
      alert('Erreur lors de l\'enregistrement de la transaction.');
    } finally {
      setTxLoading(false);
    }
  };

  const handleTxDelete = async (txId) => {
    if (!window.confirm('Annuler cette transaction ?')) return;
    try {
      await transactionService.delete(txId);
      setTransactions(prev => prev.filter(t => t.id !== txId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
    window.dispatchEvent(new Event('storage'));
  };

  // Libellés d'affichage de rôles et statuts
  const roleNames = { admin: 'Admin', agent: 'Agent', client: 'Client' };
  
  const statusLabels = {
    a_vendre: 'À Vendre',
    a_louer: 'À Louer',
    vendu: 'Vendu',
    loue: 'Loué',
  };

  const typeLabels = {
    maison: 'Maison',
    appartement: 'Appartement',
    terrain: 'Terrain',
    local_commercial: 'Local Commercial',
  };

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 min-h-screen space-y-8">
      {/* En-tête du profil */}
      <div className="bg-gradient-to-r from-indigo-700 to-purple-800 rounded-3xl p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-white text-2xl font-bold border border-white/20">
            {user.prenom[0]}{user.nom[0]}
          </div>
          <div>
            <h1 className="text-xl md:text-3xl font-extrabold tracking-tight mb-1 text-white">
              Bonjour, {user.prenom} {user.nom}
            </h1>
            <p className="text-indigo-200 text-xs md:text-sm font-semibold flex items-center gap-1">
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white uppercase text-[10px]">
                {roleNames[user.role]}
              </span>
              <span>- Espace Personnel</span>
            </p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-4 py-2 bg-white/15 hover:bg-white/25 rounded-xl text-sm font-bold border border-white/15 transition-all text-white"
        >
          <LogOut size={16} /> Déconnexion
        </button>
      </div>

      {/* Grille principale : Barre latérale + Panneau de détails */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Barre latérale de navigation */}
        <div className="space-y-3">
          {user.role === 'client' ? (
            <>
              <button
                onClick={() => setActiveTab('favorites')}
                className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl text-sm font-bold border text-left transition-all ${
                  activeTab === 'favorites'
                    ? 'bg-indigo-650 border-indigo-700 text-white shadow-md'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                }`}
              >
                <Heart size={18} /> Mes Favoris
              </button>
              <button
                onClick={() => setActiveTab('visits')}
                className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl text-sm font-bold border text-left transition-all ${
                  activeTab === 'visits'
                    ? 'bg-indigo-650 border-indigo-700 text-white shadow-md'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                }`}
              >
                <Calendar size={18} /> Mes Visites
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setActiveTab('properties')}
                className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl text-sm font-bold border text-left transition-all ${
                  activeTab === 'properties'
                    ? 'bg-indigo-650 border-indigo-700 text-white shadow-md'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                }`}
              >
                <Briefcase size={18} /> Gestion des Biens
              </button>
              <button
                onClick={() => setActiveTab('visits')}
                className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl text-sm font-bold border text-left transition-all ${
                  activeTab === 'visits'
                    ? 'bg-indigo-650 border-indigo-700 text-white shadow-md'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                }`}
              >
                <Calendar size={18} /> Gestion des Visites
              </button>
              <button
                onClick={() => setActiveTab('messages')}
                className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl text-sm font-bold border text-left transition-all ${
                  activeTab === 'messages'
                    ? 'bg-indigo-650 border-indigo-700 text-white shadow-md'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                }`}
              >
                <MessageSquare size={18} /> Messages Reçus
              </button>
              <button
                onClick={() => setActiveTab('transactions')}
                className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl text-sm font-bold border text-left transition-all ${
                  activeTab === 'transactions'
                    ? 'bg-indigo-650 border-indigo-700 text-white shadow-md'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                }`}
              >
                <DollarSign size={18} /> Transactions
              </button>
            </>
          )}

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl text-sm font-bold border text-left transition-all ${
              activeTab === 'profile'
                ? 'bg-indigo-650 border-indigo-700 text-white shadow-md'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80'
            }`}
          >
            <User size={18} /> Mon Profil
          </button>
        </div>

        {/* Zone d'affichage du contenu */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 md:p-8 rounded-3xl shadow-md min-h-[500px]">
          
          {loading && activeTab !== 'profile' ? (
            <div className="flex flex-col items-center justify-center h-96 space-y-4">
              <RefreshCw className="animate-spin text-indigo-600" size={32} />
              <p className="text-sm text-slate-500 font-semibold">Chargement des données...</p>
            </div>
          ) : (
            <>
              {/* ONGLET : FAVORIS DU CLIENT */}
              {activeTab === 'favorites' && (
                <div className="space-y-6">
                  <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white mb-0">Mes Propriétés Favorites</h2>
                  {favorites.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {favorites.map(fav => (
                        <PropertyCard 
                          key={fav.id} 
                          property={fav.bien || fav} 
                          onFavoriteToggle={() => setFavorites(prev => prev.filter(f => f.id !== fav.id))}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16 space-y-3">
                      <Heart size={32} className="mx-auto text-slate-300" />
                      <p className="text-slate-505">Vous n'avez pas encore de favoris. Explorez le catalogue pour en ajouter.</p>
                    </div>
                  )}
                </div>
              )}

              {/* ONGLET : VISITES DU CLIENT & DE L'AGENT */}
              {activeTab === 'visits' && (
                <div className="space-y-6">
                  <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white mb-0">Gestion des Visites</h2>
                  
                  {visits.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm text-slate-500 dark:text-slate-400">
                        <thead className="text-xs text-slate-450 uppercase bg-slate-50 dark:bg-slate-850 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
                          <tr>
                            <th className="px-6 py-4 font-bold">Propriété</th>
                            {user.role !== 'client' && <th className="px-6 py-4 font-bold">Client</th>}
                            <th className="px-6 py-4 font-bold">Date & Heure</th>
                            <th className="px-6 py-4 font-bold">Statut</th>
                            {user.role !== 'client' && <th className="px-6 py-4 font-bold">Actions</th>}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {visits.map(visit => (
                            <tr key={visit.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50">
                              <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                                {visit.bien ? (
                                  <Link to={`/biens/${visit.bien.id}`} className="hover:underline text-indigo-600 dark:text-indigo-400">
                                    {visit.bien.titre}
                                  </Link>
                                ) : 'Bien Inconnu'}
                              </td>
                              {user.role !== 'client' && (
                                <td className="px-6 py-4">
                                  {visit.client ? `${visit.client.prenom} ${visit.client.nom}` : 'Client Inconnu'} <br />
                                  <span className="text-xs text-slate-400">{visit.client?.tel}</span>
                                </td>
                              )}
                              <td className="px-6 py-4">
                                {new Date(visit.date_visite).toLocaleDateString('fr-FR', {
                                  day: '2-digit', month: 'short', year: 'numeric'
                                })} à {new Date(visit.date_visite).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                                  visit.statut === 'confirme' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400' :
                                  visit.statut === 'annule' ? 'bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400' :
                                  'bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400'
                                }`}>
                                  {visit.statut === 'confirme' ? 'Confirmé' : visit.statut === 'annule' ? 'Annulé' : 'En Attente'}
                                </span>
                              </td>
                              {user.role !== 'client' && (
                                <td className="px-6 py-4 flex gap-2">
                                  {visit.statut === 'en_attente' && (
                                    <>
                                      <button
                                        onClick={() => handleVisitStatusChange(visit, 'confirme')}
                                        className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg dark:bg-emerald-950/20"
                                        title="Confirmer la visite"
                                      >
                                        <Check size={16} />
                                      </button>
                                      <button
                                        onClick={() => handleVisitStatusChange(visit, 'annule')}
                                        className="p-1.5 bg-red-50 hover:bg-red-100 text-red-650 rounded-lg dark:bg-red-950/20"
                                        title="Refuser/Annuler"
                                      >
                                        <X size={16} />
                                      </button>
                                    </>
                                  )}
                                  {visit.statut !== 'en_attente' && (
                                    <span className="text-xs text-slate-400">-</span>
                                  )}
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-16 space-y-3">
                      <Calendar size={32} className="mx-auto text-slate-305" />
                      <p className="text-slate-505">Aucune visite planifiée.</p>
                    </div>
                  )}
                </div>
              )}

              {/* ONGLET : GESTION DES BIENS (AGENT & ADMIN) */}
              {activeTab === 'properties' && (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white mb-0">Gestion du Catalogue</h2>
                    <button
                      onClick={handleOpenCreateProperty}
                      className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-650 hover:bg-indigo-750 text-white font-bold rounded-xl text-sm shadow-md transition-all shrink-0"
                    >
                      <Plus size={16} /> Ajouter un bien
                    </button>
                  </div>

                  {properties.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm text-slate-500 dark:text-slate-400">
                        <thead className="text-xs text-slate-450 uppercase bg-slate-50 dark:bg-slate-850 text-slate-700 dark:text-slate-350 border-b border-slate-200 dark:border-slate-800">
                          <tr>
                            <th className="px-6 py-4 font-bold">Bien</th>
                            <th className="px-6 py-4 font-bold">Type</th>
                            <th className="px-6 py-4 font-bold">Statut</th>
                            <th className="px-6 py-4 font-bold">Prix</th>
                            <th className="px-6 py-4 font-bold">Ville</th>
                            <th className="px-6 py-4 font-bold text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {properties.map(prop => (
                            <tr key={prop.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50">
                              <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white truncate max-w-[150px]">
                                {prop.titre}
                              </td>
                              <td className="px-6 py-4">{typeLabels[prop.type] || prop.type}</td>
                              <td className="px-6 py-4">
                                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                  prop.statut === 'a_vendre' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20' :
                                  prop.statut === 'a_louer' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/20' :
                                  'bg-slate-100 text-slate-850 dark:bg-slate-800'
                                }`}>
                                  {statusLabels[prop.statut] || prop.statut}
                                </span>
                              </td>
                              <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200">
                                {new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(prop.prix)}
                              </td>
                              <td className="px-6 py-4">{prop.ville}</td>
                              <td className="px-6 py-4 flex justify-center gap-2">
                                <Link
                                  to={`/biens/${prop.id}`}
                                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg dark:bg-slate-800 dark:text-slate-300"
                                  title="Voir l'annonce"
                                >
                                  <Eye size={15} />
                                </Link>
                                <button
                                  onClick={() => handlePropertyEdit(prop)}
                                  className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-650 rounded-lg dark:bg-indigo-950/30"
                                  title="Modifier"
                                >
                                  <Edit size={15} />
                                </button>
                                <button
                                  onClick={() => handlePropertyDelete(prop.id)}
                                  className="p-1.5 bg-red-50 hover:bg-red-100 text-red-650 rounded-lg dark:bg-red-950/30"
                                  title="Supprimer"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <p className="text-slate-500">Aucun bien à gérer. Cliquez sur "Ajouter un bien" pour commencer.</p>
                    </div>
                  )}
                </div>
              )}

              {/* ONGLET : MESSAGES REÇUS (AGENT & ADMIN) */}
              {activeTab === 'messages' && (
                <div className="space-y-6">
                  <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white mb-0">Messages Reçus</h2>
                  {messages.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6">
                      {messages.map(msg => (
                        <div key={msg.id} className="p-6 border border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl relative space-y-4">
                          <button
                            onClick={() => handleMessageDelete(msg.id)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-red-550 transition-colors"
                            title="Supprimer ce message"
                          >
                            <Trash2 size={18} />
                          </button>
                          <div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-base">
                              De : {msg.nom}
                            </h4>
                            <div className="flex gap-4 text-xs text-slate-500 mt-1 flex-wrap">
                              <span>Email : {msg.email}</span>
                              {msg.tel && <span>Tel : {msg.tel}</span>}
                              <span>Date : {new Date(msg.created_at || Date.now()).toLocaleDateString('fr-FR')}</span>
                            </div>
                          </div>
                          <p className="text-sm text-slate-650 dark:text-slate-350 leading-relaxed bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-4 rounded-xl">
                            {msg.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <p className="text-slate-500">Aucun message de contact dans la boîte de réception.</p>
                    </div>
                  )}
                </div>
              )}

              {/* ONGLET : TRANSACTIONS (AGENT & ADMIN) */}
              {activeTab === 'transactions' && (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white mb-0">Suivi des Transactions</h2>
                    <button
                      onClick={() => setIsTxModalOpen(true)}
                      className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-650 hover:bg-indigo-750 text-white font-bold rounded-xl text-sm shadow-md transition-all shrink-0"
                    >
                      <Plus size={16} /> Enregistrer transaction
                    </button>
                  </div>

                  {transactions.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm text-slate-500 dark:text-slate-400">
                        <thead className="text-xs text-slate-450 uppercase bg-slate-50 dark:bg-slate-850 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
                          <tr>
                            <th className="px-6 py-4 font-bold">Bien</th>
                            <th className="px-6 py-4 font-bold">Acheteur/Locataire</th>
                            <th className="px-6 py-4 font-bold">Type</th>
                            <th className="px-6 py-4 font-bold">Montant Final</th>
                            <th className="px-6 py-4 font-bold">Date</th>
                            <th className="px-6 py-4 font-bold text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {transactions.map(tx => (
                            <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50">
                              <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                                {tx.bien?.titre || 'Bien Inconnu'}
                              </td>
                              <td className="px-6 py-4">
                                {tx.client ? `${tx.client.prenom} ${tx.client.nom}` : 'Client Inconnu'}
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                  tx.type === 'vente' ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/20' : 'bg-blue-100 text-blue-800 dark:bg-blue-950/20'
                                }`}>
                                  {tx.type === 'vente' ? 'Vente' : 'Location'}
                                </span>
                              </td>
                              <td className="px-6 py-4 font-bold text-slate-850 dark:text-slate-200">
                                {new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(tx.prix_final)}
                              </td>
                              <td className="px-6 py-4">
                                {new Date(tx.date_transaction).toLocaleDateString('fr-FR')}
                              </td>
                              <td className="px-6 py-4 text-center">
                                <button
                                  onClick={() => handleTxDelete(tx.id)}
                                  className="p-1.5 bg-red-50 hover:bg-red-100 text-red-650 rounded-lg dark:bg-red-950/30"
                                  title="Annuler/Supprimer"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <p className="text-slate-500">Aucune transaction enregistrée. Cliquez sur "Enregistrer transaction".</p>
                    </div>
                  )}
                </div>
              )}

              {/* ONGLET : MON PROFIL */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white mb-0">Modifier mon Profil</h2>
                  
                  <form onSubmit={handleProfileSubmit} className="space-y-4 max-w-xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="prof-prenom" className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Prénom</label>
                        <input
                          type="text"
                          id="prof-prenom"
                          value={profileForm.prenom}
                          required
                          onChange={(e) => setProfileForm(prev => ({ ...prev, prenom: e.target.value }))}
                          className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor="prof-nom" className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Nom</label>
                        <input
                          type="text"
                          id="prof-nom"
                          value={profileForm.nom}
                          required
                          onChange={(e) => setProfileForm(prev => ({ ...prev, nom: e.target.value }))}
                          className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label htmlFor="prof-tel" className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Numéro de téléphone</label>
                        <input
                          type="tel"
                          id="prof-tel"
                          value={profileForm.tel}
                          required
                          onChange={(e) => setProfileForm(prev => ({ ...prev, tel: e.target.value }))}
                          className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label htmlFor="prof-email" className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Adresse email</label>
                        <input
                          type="email"
                          id="prof-email"
                          value={profileForm.email}
                          required
                          onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-indigo-650 hover:bg-indigo-755 text-white font-bold rounded-xl shadow-md transition-all text-sm"
                    >
                      Enregistrer les modifications
                    </button>

                    {profileStatus.text && (
                      <div className={`p-4 rounded-xl text-sm font-medium ${
                        profileStatus.type === 'success' ? 'bg-emerald-500/20 text-emerald-650 dark:bg-emerald-950/20' : 'bg-red-500/20 text-red-655 dark:bg-red-950/20'
                      }`}>
                        {profileStatus.text}
                      </div>
                    )}
                  </form>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* MODAL : AJOUTER / MODIFIER UN BIEN */}
      {isPropertyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-3xl p-6 md:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto animate-fade-in text-slate-800 dark:text-white">
            <button
              onClick={() => setIsPropertyModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full dark:bg-slate-800 dark:text-slate-350"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white mb-6">
              {editingProperty ? 'Modifier le bien immobilier' : 'Créer une annonce immobilière'}
            </h2>

            {propertyError && (
              <div className="p-4 bg-red-50 dark:bg-red-955/20 text-red-650 border border-red-200 rounded-xl text-xs font-semibold mb-4">
                {propertyError}
              </div>
            )}

            <form onSubmit={handlePropertySubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Saisie du Titre */}
                <div className="md:col-span-2">
                  <label htmlFor="prop-titre" className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Titre de l'annonce</label>
                  <input
                    type="text"
                    id="prop-titre"
                    name="titre"
                    value={propertyForm.titre}
                    required
                    onChange={handlePropertyFormChange}
                    placeholder="Ex: Superbe villa contemporaine..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>

                {/* Saisie de la Description */}
                <div className="md:col-span-2">
                  <label htmlFor="prop-desc" className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Description</label>
                  <textarea
                    id="prop-desc"
                    name="description"
                    rows="3"
                    value={propertyForm.description}
                    required
                    onChange={handlePropertyFormChange}
                    placeholder="Décrivez en détail les pièces, l'emplacement, les travaux..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
                  ></textarea>
                </div>

                {/* Choix du Type */}
                <div>
                  <label htmlFor="prop-type" className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Type de bien</label>
                  <select
                    id="prop-type"
                    name="type"
                    value={propertyForm.type}
                    onChange={handlePropertyFormChange}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-855 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white text-sm"
                  >
                    <option value="maison">Maison</option>
                    <option value="appartement">Appartement</option>
                    <option value="terrain">Terrain</option>
                    <option value="local_commercial">Local Commercial</option>
                  </select>
                </div>

                {/* Choix du Statut */}
                <div>
                  <label htmlFor="prop-statut" className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Statut</label>
                  <select
                    id="prop-statut"
                    name="statut"
                    value={propertyForm.statut}
                    onChange={handlePropertyFormChange}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-855 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white text-sm"
                  >
                    <option value="a_vendre">À Vendre</option>
                    <option value="a_louer">À Louer</option>
                    <option value="vendu">Vendu</option>
                    <option value="loue">Loué</option>
                  </select>
                </div>

                {/* Saisie du Prix */}
                <div>
                  <label htmlFor="prop-prix" className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Prix (FCFA)</label>
                  <input
                    type="number"
                    id="prop-prix"
                    name="prix"
                    value={propertyForm.prix}
                    required
                    onChange={handlePropertyFormChange}
                    placeholder="Montant total ou loyer"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white text-sm"
                  />
                </div>

                {/* Saisie de la Surface */}
                <div>
                  <label htmlFor="prop-surface" className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Surface (m²)</label>
                  <input
                    type="number"
                    id="prop-surface"
                    name="surface"
                    value={propertyForm.surface}
                    required
                    onChange={handlePropertyFormChange}
                    placeholder="Surface en mètres carrés"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white text-sm"
                  />
                </div>

                {/* Caractéristiques pour maisons/appartements */}
                {propertyForm.type !== 'terrain' && (
                  <>
                    <div>
                      <label htmlFor="prop-pieces" className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Pièces totales</label>
                      <input
                        type="number"
                        id="prop-pieces"
                        name="pieces"
                        value={propertyForm.pieces}
                        onChange={handlePropertyFormChange}
                        placeholder="Ex: 5"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="prop-chambres" className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Chambres</label>
                      <input
                        type="number"
                        id="prop-chambres"
                        name="chambres"
                        value={propertyForm.chambres}
                        onChange={handlePropertyFormChange}
                        placeholder="Ex: 3"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="prop-sdb" className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Salles de bain</label>
                      <input
                        type="number"
                        id="prop-sdb"
                        name="salles_de_bain"
                        value={propertyForm.salles_de_bain}
                        onChange={handlePropertyFormChange}
                        placeholder="Ex: 2"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white text-sm"
                      />
                    </div>
                  </>
                )}

                {/* Saisie de l'Adresse */}
                <div className="md:col-span-2">
                  <label htmlFor="prop-adresse" className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Adresse</label>
                  <input
                    type="text"
                    id="prop-adresse"
                    name="adresse"
                    value={propertyForm.adresse}
                    required
                    onChange={handlePropertyFormChange}
                    placeholder="12 rue Royale"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white text-sm"
                  />
                </div>

                {/* Saisie de la Ville */}
                <div>
                  <label htmlFor="prop-ville" className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Ville</label>
                  <input
                    type="text"
                    id="prop-ville"
                    name="ville"
                    value={propertyForm.ville}
                    required
                    onChange={handlePropertyFormChange}
                    placeholder="Dakar"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white text-sm"
                  />
                </div>

                {/* Saisie du Code Postal */}
                <div>
                  <label htmlFor="prop-cp" className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Code Postal</label>
                  <input
                    type="text"
                    id="prop-cp"
                    name="code_postal"
                    value={propertyForm.code_postal}
                    required
                    onChange={handlePropertyFormChange}
                    placeholder="12500"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white text-sm"
                  />
                </div>

                {/* Saisie des équipements (séparés par des virgules) */}
                <div className="md:col-span-2">
                  <label htmlFor="prop-feat" className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Équipements (Séparés par des virgules)</label>
                  <input
                    type="text"
                    id="prop-feat"
                    name="featuresString"
                    value={propertyForm.featuresString}
                    onChange={handlePropertyFormChange}
                    placeholder="Piscine, Double vitrage, Garage, Climatisation..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white text-sm"
                  />
                </div>

                {/* Sélecteur de Propriétaire (optionnel) */}
                {clients.length > 0 && (
                  <div>
                    <label htmlFor="prop-owner" className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Propriétaire du Bien (Optionnel)</label>
                    <select
                      id="prop-owner"
                      name="proprietaire_id"
                      value={propertyForm.proprietaire_id}
                      onChange={handlePropertyFormChange}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-855 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white text-sm"
                    >
                      <option value="">Aucun propriétaire (Géré par l'agence)</option>
                      {clients.map(c => (
                        <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Sélecteur d'Agent (pour l'admin) */}
                {user.role === 'admin' && agents.length > 0 && (
                  <div>
                    <label htmlFor="prop-agent" className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Agent Assigné</label>
                    <select
                      id="prop-agent"
                      name="agent_id"
                      value={propertyForm.agent_id}
                      onChange={handlePropertyFormChange}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-855 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white text-sm"
                    >
                      {agents.map(a => (
                        <option key={a.id} value={a.id}>{a.prenom} {a.nom}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Téléchargement d'images */}
                <div className="md:col-span-2 pt-2">
                  <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider flex items-center gap-1">
                    <Camera size={16} /> Ajouter des Images (Max 4Mo par fichier)
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePropertyImageChange}
                    className="w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 dark:file:bg-indigo-950 dark:file:text-indigo-400 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-900 file:transition-colors file:cursor-pointer"
                  />
                  {propertyImages.length > 0 && (
                    <div className="mt-2 text-xs text-slate-500 flex flex-wrap gap-2">
                      {propertyImages.map((img, i) => (
                        <span key={i} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md">
                          {img.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPropertyModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 rounded-xl text-sm font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={propertyLoading}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-md"
                >
                  {propertyLoading ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL : ENREGISTRER UNE TRANSACTION */}
      {isTxModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-3xl p-6 md:p-8 shadow-2xl relative animate-fade-in text-slate-800 dark:text-white">
            <button
              onClick={() => setIsTxModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full dark:bg-slate-800 dark:text-slate-300"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-6">
              Enregistrer une Transaction
            </h2>

            <form onSubmit={handleTxSubmit} className="space-y-4">
              {/* Sélecteur de Bien */}
              <div>
                <label htmlFor="tx-bien" className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Bien Immobilier</label>
                <select
                  id="tx-bien"
                  value={txForm.bien_id}
                  required
                  onChange={(e) => setTxForm(prev => ({ ...prev, bien_id: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-855 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white text-sm"
                >
                  <option value="">Sélectionner le bien</option>
                  {properties.map(p => (
                    <option key={p.id} value={p.id}>{p.titre} ({formatPrice(p.prix)})</option>
                  ))}
                </select>
              </div>

              {/* Sélecteur de Client */}
              <div>
                <label htmlFor="tx-client" className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Acheteur / Locataire</label>
                <select
                  id="tx-client"
                  value={txForm.client_id}
                  required
                  onChange={(e) => setTxForm(prev => ({ ...prev, client_id: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-855 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white text-sm"
                >
                  <option value="">Sélectionner le client</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>
                  ))}
                </select>
              </div>

              {/* Sélecteur d'Agent (pour l'admin) */}
              {user.role === 'admin' && agents.length > 0 && (
                <div>
                  <label htmlFor="tx-agent" className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Agent Référent</label>
                  <select
                    id="tx-agent"
                    value={txForm.agent_id}
                    required
                    onChange={(e) => setTxForm(prev => ({ ...prev, agent_id: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-855 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white text-sm"
                  >
                    {agents.map(a => (
                      <option key={a.id} value={a.id}>{a.prenom} {a.nom}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Choix du type de transaction */}
              <div>
                <label htmlFor="tx-type" className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Type de contrat</label>
                <select
                  id="tx-type"
                  value={txForm.type}
                  onChange={(e) => setTxForm(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-855 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white text-sm"
                >
                  <option value="vente">Vente Définitive</option>
                  <option value="location">Location Bail</option>
                </select>
              </div>

              {/* Saisie du prix final */}
              <div>
                <label htmlFor="tx-price" className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Montant Final (FCFA)</label>
                <input
                  type="number"
                  id="tx-price"
                  value={txForm.prix_final}
                  required
                  onChange={(e) => setTxForm(prev => ({ ...prev, prix_final: e.target.value }))}
                  placeholder="Prix de vente ou loyer négocié"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white text-sm"
                />
              </div>

              {/* Saisie de la date de transaction */}
              <div>
                <label htmlFor="tx-date" className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Date</label>
                <input
                  type="date"
                  id="tx-date"
                  value={txForm.date_transaction}
                  required
                  onChange={(e) => setTxForm(prev => ({ ...prev, date_transaction: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white text-sm"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTxModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 rounded-xl text-sm font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={txLoading}
                  className="px-6 py-2.5 bg-indigo-650 hover:bg-indigo-750 text-white font-semibold rounded-xl text-sm shadow-md"
                >
                  {txLoading ? 'Enregistrement...' : 'Valider transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
