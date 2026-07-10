import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin, Maximize, BedDouble, Bath } from 'lucide-react';
import { favoriService } from '../services/api';

export default function PropertyCard({ property, onFavoriteToggle }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Vérifier si ce bien est enregistré dans les favoris
  useEffect(() => {
    // Dans la structure backend, le bien peut avoir une relation de favoris.
    // Pour des raisons de performance et de réactivité immédiate, nous chargeons
    // également l'état depuis le stockage local (localStorage).
    const storedFavorites = JSON.parse(localStorage.getItem('immo_favorites') || '[]');
    setIsFavorite(storedFavorites.includes(property.id));
  }, [property.id]);

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const token = localStorage.getItem('immo_token');
    if (!token) {
      alert('Veuillez vous connecter pour ajouter des favoris.');
      return;
    }

    setIsLoading(true);
    try {
      await favoriService.toggle(property.id);
      
      // Mettre à jour le suivi du stockage local (localStorage)
      let storedFavorites = JSON.parse(localStorage.getItem('immo_favorites') || '[]');
      if (storedFavorites.includes(property.id)) {
        storedFavorites = storedFavorites.filter(id => id !== property.id);
        setIsFavorite(false);
      } else {
        storedFavorites.push(property.id);
        setIsFavorite(true);
      }
      localStorage.setItem('immo_favorites', JSON.stringify(storedFavorites));

      if (onFavoriteToggle) {
        onFavoriteToggle(property.id);
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getImageUrl = () => {
    // Si le bien a des images, renvoyer la principale ou la première
    const primary = property.primary_image || (property.images && property.images[0]);
    if (primary && primary.image_path) {
      if (primary.image_path.startsWith('http')) return primary.image_path;
      return `http://127.0.0.1:8000/storage/${primary.image_path}`;
    }
    // Catégories par défaut en cas d'absence d'image
    const placeholders = {
      maison: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=600&q=80',
      appartement: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=600&q=80',
      local_commercial: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80',
      terrain: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80'
    };
    return placeholders[property.type] || placeholders.maison;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(price);
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
    local_commercial: 'Commerce',
  };

  return (
    <Link 
      to={`/biens/${property.id}`}
      className="group flex flex-col h-full bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 shadow-sm"
    >
      {/* Conteneur d'image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img 
          src={getImageUrl()} 
          alt={property.titre}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        
        {/* Badge de Statut */}
        <span className={`absolute top-4 left-4 text-xs font-semibold px-3 py-1.5 rounded-full shadow-md ${statusColors[property.statut]}`}>
          {statusLabels[property.statut] || property.statut}
        </span>

        {/* Badge de type de bien */}
        <span className="absolute top-4 right-16 text-xs font-medium px-2.5 py-1.5 rounded-full bg-black/60 text-white backdrop-blur-sm">
          {typeLabels[property.type] || property.type}
        </span>

        {/* Bouton Favori */}
        <button
          onClick={handleFavoriteClick}
          disabled={isLoading}
          className="absolute top-4 right-4 p-2 rounded-full glass hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-red-550 transition-colors shadow-md"
          aria-label="Add to favorites"
        >
          <Heart 
            size={18} 
            className={`${isFavorite ? 'fill-red-500 text-red-500' : 'text-slate-650'}`} 
          />
        </button>
      </div>

      {/* Détails du Bien */}
      <div className="flex flex-col flex-grow p-5">
        <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-xs mb-2">
          <MapPin size={14} className="shrink-0 text-slate-400" />
          <span className="truncate">{property.ville} ({property.code_postal})</span>
        </div>

        <h3 className="font-bold text-lg text-slate-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-2">
          {property.titre}
        </h3>

        <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 mb-4 flex-grow">
          {property.description}
        </p>

        {/* Prix & Caractéristiques */}
        <div className="mt-auto border-t border-slate-100 dark:border-slate-800/80 pt-4 flex flex-col gap-3">
          <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
            {formatPrice(property.prix)}
            {property.statut === 'a_louer' && <span className="text-xs font-normal text-slate-500"> / mois</span>}
          </span>
          
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-450">
            <span className="flex items-center gap-1">
              <Maximize size={14} className="text-slate-400" /> {property.surface} m²
            </span>
            {property.type !== 'terrain' && (
              <>
                <span className="flex items-center gap-1">
                  <BedDouble size={14} className="text-slate-400" /> {property.chambres || property.pieces || 0} p.
                </span>
                <span className="flex items-center gap-1">
                  <Bath size={14} className="text-slate-400" /> {property.salles_de_bain || 0} sdb
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
