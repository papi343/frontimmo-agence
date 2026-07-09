import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { bienService } from '../services/api';
import PropertyFilters from '../components/PropertyFilters';
import PropertyCard from '../components/PropertyCard';
import { LayoutGrid, AlertCircle, RefreshCw } from 'lucide-react';

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // État de la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  // État du tri
  const [sortBy, setSortBy] = useState('newest'); // tri local ou via l'API

  // Combiner les paramètres de recherche de l'URL dans les filtres initiaux
  const [currentFilters, setCurrentFilters] = useState(() => {
    const filters = {};
    searchParams.forEach((value, key) => {
      filters[key] = value;
    });
    return filters;
  });

  const fetchProperties = async (filters = {}, page = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await bienService.getAll({
        ...filters,
        page,
        per_page: 9,
      });

      // Format de pagination Laravel : { data: [...], current_page: 1, last_page: 5, total: 45 }
      // Gérer les deux formats possibles d'API
      if (response && response.data) {
        setProperties(response.data);
        
        // Gérer les attributs du paginateur Laravel si présents
        if (response.meta) {
          setCurrentPage(response.meta.current_page || page);
          setTotalPages(response.meta.last_page || 1);
          setTotalResults(response.meta.total || response.data.length);
        } else if (response.current_page) {
          setCurrentPage(response.current_page || page);
          setTotalPages(response.last_page || 1);
          setTotalResults(response.total || response.data.length);
        } else {
          // Si pas de métadonnées, par défaut sur une seule page
          setCurrentPage(1);
          setTotalPages(1);
          setTotalResults(response.data.length);
        }
      } else {
        setProperties(Array.isArray(response) ? response : []);
        setTotalPages(1);
        setTotalResults(Array.isArray(response) ? response.length : 0);
      }
    } catch (err) {
      console.error('Error fetching catalog properties:', err);
      setError('Impossible de charger les biens immobiliers. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties(currentFilters, currentPage);
  }, [currentFilters, currentPage]);

  // Gérer le changement d'URL
  useEffect(() => {
    const filters = {};
    searchParams.forEach((value, key) => {
      filters[key] = value;
    });
    setCurrentFilters(filters);
    setCurrentPage(1); // réinitialiser à la page 1 lors d'un nouveau filtre
  }, [searchParams]);

  const handleFilterChange = (newFilters) => {
    setSearchParams(newFilters); // met à jour l'URL, ce qui déclenche le useEffect ci-dessus
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Tri local des biens
  const sortedProperties = [...properties].sort((a, b) => {
    if (sortBy === 'price_asc') return parseFloat(a.prix) - parseFloat(b.prix);
    if (sortBy === 'price_desc') return parseFloat(b.prix) - parseFloat(a.prix);
    if (sortBy === 'surface_desc') return parseFloat(b.surface) - parseFloat(a.surface);
    return b.id - a.id; // plus récent par défaut
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8 min-h-screen">
      {/* En-tête de titre */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-0">
            Explorer Nos Biens Immobiliers
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Trouvez le logement qui répond exactement à vos besoins et critères de recherche.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 font-medium">
          <LayoutGrid size={16} />
          <span>{totalResults} biens trouvés</span>
        </div>
      </div>

      {/* Filtres */}
      <PropertyFilters onFilterChange={handleFilterChange} />

      {/* Barre de tri et contrôles d'affichage */}
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 px-6 py-4 rounded-xl shadow-sm">
        <span className="text-sm text-slate-500 dark:text-slate-400">
          Affichage de la page {currentPage} sur {totalPages}
        </span>

        <div className="flex items-center gap-2">
          <label htmlFor="sort-by" className="text-sm font-semibold text-slate-650 dark:text-slate-400">Trier par :</label>
          <select
            id="sort-by"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white focus:outline-none"
          >
            <option value="newest">Plus Récents</option>
            <option value="price_asc">Prix croissant</option>
            <option value="price_desc">Prix décroissant</option>
            <option value="surface_desc">Grande Surface</option>
          </select>
        </div>
      </div>

      {/* Grille du Catalogue des biens */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 h-[420px] animate-pulse"></div>
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-2xl text-center p-6 space-y-4">
          <AlertCircle className="text-red-500" size={48} />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Erreur de chargement</h3>
          <p className="text-sm text-slate-500 max-w-md">{error}</p>
          <button
            onClick={() => fetchProperties(currentFilters, currentPage)}
            className="flex items-center gap-2 px-6 py-2.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 shadow-md transition-all"
          >
            <RefreshCw size={16} /> Réessayer
          </button>
        </div>
      ) : sortedProperties.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {sortedProperties.map(property => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>

          {/* Contrôles de la Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-8">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Précédent
              </button>

              {[...Array(totalPages)].map((_, idx) => {
                const pageNum = idx + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-bold border transition-colors ${
                      currentPage === pageNum
                        ? 'bg-indigo-600 border-indigo-650 text-white'
                        : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Suivant
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
          <AlertCircle size={40} className="mx-auto text-slate-400" />
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Aucun résultat trouvé</h3>
          <p className="text-slate-500 max-w-sm mx-auto">
            Aucun bien ne correspond à vos filtres de recherche. Veuillez élargir vos critères de sélection.
          </p>
          <button
            onClick={handleReset}
            className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 shadow-md transition-all"
          >
            Réinitialiser les filtres
          </button>
        </div>
      )}
    </div>
  );
}
