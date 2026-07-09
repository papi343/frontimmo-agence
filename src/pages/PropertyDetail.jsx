import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { bienService, favoriService, visiteService } from '../services/api';
import { 
  Heart, MapPin, Maximize, BedDouble, Bath, 
  Calendar, Clock, User, Phone, Mail, ChevronLeft, Check, AlertCircle 
} from 'lucide-react';

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  // État pour la planification de visites
  const [visitDate, setVisitDate] = useState('');
  const [visitTime, setVisitTime] = useState('');
  const [visitStatus, setVisitStatus] = useState({ type: '', text: '' });
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await bienService.getById(id);
        setProperty(data);
        
        // Définir l'image active par défaut (principale ou première)
        const primary = data.primary_image || (data.images && data.images[0]);
        if (primary && primary.image_path) {
          setActiveImage(primary.image_path);
        } else {
          setActiveImage(null);
        }

        // Vérifier si le bien est enregistré en favori
        const storedFavorites = JSON.parse(localStorage.getItem('immo_favorites') || '[]');
        setIsFavorite(storedFavorites.includes(parseInt(id)));
      } catch (err) {
        console.error('Error fetching property detail:', err);
        setError('Impossible de trouver la propriété demandée. Elle a pu être supprimée.');
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  const handleFavoriteClick = async () => {
    const token = localStorage.getItem('immo_token');
    if (!token) {
      alert('Veuillez vous connecter pour ajouter ce bien aux favoris.');
      return;
    }

    setFavoriteLoading(true);
    try {
      await favoriService.toggle(property.id);
      
      let storedFavorites = JSON.parse(localStorage.getItem('immo_favorites') || '[]');
      if (storedFavorites.includes(property.id)) {
        storedFavorites = storedFavorites.filter(favId => favId !== property.id);
        setIsFavorite(false);
      } else {
        storedFavorites.push(property.id);
        setIsFavorite(true);
      }
      localStorage.setItem('immo_favorites', JSON.stringify(storedFavorites));
    } catch (err) {
      console.error('Error toggling favorite:', err);
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleVisitSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('immo_token');
    if (!token) {
      setVisitStatus({ type: 'error', text: 'Veuillez vous connecter pour planifier une visite.' });
      return;
    }

    if (!visitDate || !visitTime) {
      setVisitStatus({ type: 'error', text: 'Veuillez renseigner la date et l\'heure de visite.' });
      return;
    }

    setIsSubmitLoading(true);
    setVisitStatus({ type: 'info', text: 'Envoi de la demande...' });
    
    try {
      // L'API attend une date_visite au format "YYYY-MM-DD HH:II:SS"
      const dateTime = `${visitDate} ${visitTime}:00`;
      await visiteService.create({
        bien_id: property.id,
        date_visite: dateTime,
      });

      setVisitStatus({ 
        type: 'success', 
        text: 'Votre demande de visite a été envoyée ! Retrouvez le statut sur votre Tableau de Bord.' 
      });
      setVisitDate('');
      setVisitTime('');
    } catch (err) {
      console.error('Error submitting visit request:', err);
      setVisitStatus({ 
        type: 'error', 
        text: err.response?.data?.message || 'Une erreur est survenue. Veuillez réessayer.' 
      });
    } finally {
      setIsSubmitLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(price);
  };

  const getImageUrl = (path) => {
    if (!path) return 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80';
    if (path.startsWith('http')) return path;
    return `http://127.0.0.1:8000/storage/${path}`;
  };

  const statusLabels = {
    a_vendre: 'À Vendre',
    a_louer: 'À Louer',
    vendu: 'Vendu',
    loue: 'Loué',
  };

  const statusColors = {
    a_vendre: 'bg-emerald-500 text-white',
    a_louer: 'bg-blue-500 text-white',
    vendu: 'bg-red-500 text-white',
    loue: 'bg-slate-500 text-white',
  };

  const typeLabels = {
    maison: 'Maison',
    appartement: 'Appartement',
    terrain: 'Terrain',
    local_commercial: 'Local Commercial',
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-pulse min-h-screen">
        <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="aspect-[16/9] bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
            <div className="h-8 w-1/2 bg-slate-200 dark:bg-slate-800 rounded"></div>
            <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded"></div>
            <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded"></div>
          </div>
          <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center space-y-6 min-h-screen flex flex-col justify-center items-center">
        <AlertCircle className="text-red-500" size={64} />
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Erreur de chargement</h2>
        <p className="text-slate-550 dark:text-slate-400">{error || 'Propriété introuvable.'}</p>
        <Link 
          to="/catalog"
          className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 shadow-md transition-all flex items-center gap-1"
        >
          <ChevronLeft size={18} /> Retour au catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8 min-h-screen">
      {/* Back Link & Title */}
      <div className="flex flex-col gap-4">
        <Link 
          to="/catalog" 
          className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors w-fit"
        >
          <ChevronLeft size={16} /> Retour au catalogue
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColors[property.statut]}`}>
                {statusLabels[property.statut] || property.statut}
              </span>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                {typeLabels[property.type] || property.type}
              </span>
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
              {property.titre}
            </h1>
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-sm">
              <MapPin size={16} />
              <span>{property.adresse}, {property.ville} ({property.code_postal})</span>
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end gap-3 shrink-0">
            <span className="text-3xl font-extrabold text-indigo-650 dark:text-indigo-400">
              {formatPrice(property.prix)}
              {property.statut === 'a_louer' && <span className="text-base font-normal text-slate-505"> / mois</span>}
            </span>
            <button
              onClick={handleFavoriteClick}
              disabled={favoriteLoading}
              className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-sm font-semibold transition-all hover:bg-slate-100 dark:hover:bg-slate-900 ${
                isFavorite 
                  ? 'border-red-200 bg-red-50/50 text-red-600 dark:border-red-950/20 dark:bg-red-950/10 dark:text-red-400' 
                  : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <Heart size={16} className={isFavorite ? 'fill-red-500 text-red-500' : ''} />
              {isFavorite ? 'Enregistré' : 'Ajouter aux favoris'}
            </button>
          </div>
        </div>
      </div>

      {/* Disposition principale des détails du bien */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Côté gauche : Galerie d'images et descriptions */}
        <div className="lg:col-span-2 space-y-8">
          {/* Conteneur principal de l'image de présentation */}
          <div className="space-y-4">
            <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden border border-slate-250/50 dark:border-slate-800 shadow-lg bg-slate-100 dark:bg-slate-900">
              <img 
                src={getImageUrl(activeImage)} 
                alt={property.titre}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Vignettes des sous-images additionnelles */}
            {property.images && property.images.length > 0 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                {property.images.map(img => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImage(img.image_path)}
                    className={`relative w-24 aspect-[4/3] rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                      activeImage === img.image_path 
                        ? 'border-indigo-600 shadow-md scale-95' 
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img 
                      src={getImageUrl(img.image_path)} 
                      alt="Thumbnail" 
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Grille des caractéristiques clés */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-sm">
            <div className="text-center space-y-1">
              <Maximize size={22} className="mx-auto text-indigo-500" />
              <p className="text-xs text-slate-450 dark:text-slate-500 font-semibold uppercase tracking-wider">Surface</p>
              <p className="text-base font-bold text-slate-900 dark:text-white">{property.surface} m²</p>
            </div>
            <div className="text-center space-y-1 border-l border-slate-100 dark:border-slate-800/80">
              <BedDouble size={22} className="mx-auto text-indigo-500" />
              <p className="text-xs text-slate-450 dark:text-slate-500 font-semibold uppercase tracking-wider">Chambres</p>
              <p className="text-base font-bold text-slate-900 dark:text-white">{property.chambres || property.pieces || 0}</p>
            </div>
            <div className="text-center space-y-1 border-l border-slate-100 dark:border-slate-800/80">
              <Bath size={22} className="mx-auto text-indigo-500" />
              <p className="text-xs text-slate-450 dark:text-slate-500 font-semibold uppercase tracking-wider">Salles de bain</p>
              <p className="text-base font-bold text-slate-900 dark:text-white">{property.salles_de_bain || 0}</p>
            </div>
            <div className="text-center space-y-1 border-l border-slate-100 dark:border-slate-800/80">
              <User size={22} className="mx-auto text-indigo-500" />
              <p className="text-xs text-slate-450 dark:text-slate-500 font-semibold uppercase tracking-wider">Pièces totales</p>
              <p className="text-base font-bold text-slate-900 dark:text-white">{property.pieces || 0}</p>
            </div>
          </div>

          {/* Description textuelle */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
              Description du Bien
            </h2>
            <p className="text-slate-600 dark:text-slate-350 leading-relaxed whitespace-pre-line">
              {property.description}
            </p>
          </div>

          {/* Équipements / Caractéristiques */}
          {property.features && property.features.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                Équipements & Caractéristiques
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {property.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-slate-650 dark:text-slate-300">
                    <div className="p-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-md">
                      <Check size={14} />
                    </div>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Côté droit : Informations de l'agent & Planification de visites */}
        <div className="space-y-8">
          {/* Carte de contact de l'agent référent */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-6 shadow-md space-y-6">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-850 pb-3">
              Agent Responsable
            </h3>
            
            {property.agent ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-sm">
                    {property.agent.prenom[0]}{property.agent.nom[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">
                      {property.agent.prenom} {property.agent.nom}
                    </h4>
                    <p className="text-xs text-slate-500">Agent Immobilier Agréé</p>
                  </div>
                </div>

                <div className="space-y-3 pt-2 text-sm text-slate-650 dark:text-slate-350">
                  <div className="flex items-center gap-2.5">
                    <Phone size={16} className="text-slate-400 shrink-0" />
                    <a href={`tel:${property.agent.tel}`} className="hover:text-indigo-650 dark:hover:text-indigo-400 transition-colors">
                      {property.agent.tel}
                    </a>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Mail size={16} className="text-slate-400 shrink-0" />
                    <a href={`mailto:${property.agent.email}`} className="hover:text-indigo-650 dark:hover:text-indigo-400 transition-colors truncate">
                      {property.agent.email}
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-slate-500 text-sm">Aucun agent assigné pour le moment.</p>
            )}
          </div>

          {/* Module de planification de visite */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-6 shadow-md space-y-6">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-850 pb-3">
              Planifier une Visite
            </h3>

            {localStorage.getItem('immo_token') ? (
              <form onSubmit={handleVisitSubmit} className="space-y-4">
                {/* Choix de la Date */}
                <div>
                  <label htmlFor="visit-date" className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Date de visite</label>
                  <div className="relative">
                    <Calendar size={16} className="absolute left-3 top-3.5 text-slate-400" />
                    <input 
                      type="date"
                      id="visit-date"
                      value={visitDate}
                      required
                      min={new Date().toISOString().split('T')[0]} // Empêcher la sélection de dates passées
                      onChange={(e) => setVisitDate(e.target.value)}
                      className="pl-10 w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Choix de l'Heure */}
                <div>
                  <label htmlFor="visit-time" className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Heure de visite</label>
                  <div className="relative">
                    <Clock size={16} className="absolute left-3 top-3.5 text-slate-400" />
                    <input 
                      type="time"
                      id="visit-time"
                      value={visitTime}
                      required
                      onChange={(e) => setVisitTime(e.target.value)}
                      className="pl-10 w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitLoading}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-755 text-white font-bold rounded-xl shadow-md transition-all text-sm"
                >
                  Envoyer ma demande de visite
                </button>

                {visitStatus.text && (
                  <div className={`p-3.5 rounded-xl text-center text-xs font-medium ${
                    visitStatus.type === 'success' ? 'bg-emerald-500/20 text-emerald-600 dark:bg-emerald-950/20' :
                    visitStatus.type === 'error' ? 'bg-red-500/20 text-red-655 dark:bg-red-950/20' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {visitStatus.text}
                  </div>
                )}
              </form>
            ) : (
              <div className="text-center py-4 space-y-4">
                <p className="text-sm text-slate-500">
                  Vous devez être connecté pour planifier des visites sur ce bien immobilier.
                </p>
                <div className="flex flex-col gap-2">
                  <Link 
                    to="/login"
                    className="w-full py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 block transition-all"
                  >
                    Se connecter
                  </Link>
                  <Link 
                    to="/register"
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                  >
                    Pas encore de compte ? S'inscrire
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
