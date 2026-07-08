import { useState } from 'react';
import { Search, MapPin, SlidersHorizontal, RotateCcw } from 'lucide-react';

export default function PropertyFilters({ onFilterChange }) {
  const [filters, setFilters] = useState({
    search: '',
    ville: '',
    type: '',
    statut: '',
    prix_min: '',
    prix_max: '',
    surface_min: '',
    surface_max: '',
    pieces: '',
    chambres: '',
    salles_de_bain: '',
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Supprimer les chaînes vides avant d'envoyer la requête
    const activeFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, val]) => val !== '')
    );
    onFilterChange(activeFilters);
  };

  const handleReset = () => {
    const clearedFilters = {
      search: '',
      ville: '',
      type: '',
      statut: '',
      prix_min: '',
      prix_max: '',
      surface_min: '',
      surface_max: '',
      pieces: '',
      chambres: '',
      salles_de_bain: '',
    };
    setFilters(clearedFilters);
    onFilterChange({});
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-md transition-all duration-300"
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Recherche par mot-clé */}
        <div className="relative">
          <label htmlFor="search" className="sr-only">Recherche par mot clé</label>
          <Search size={18} className="absolute left-3 top-3.5 text-slate-400" />
          <input
            type="text"
            id="search"
            name="search"
            value={filters.search}
            onChange={handleChange}
            placeholder="Rechercher par mot-clé..."
            className="pl-10 w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Ville / Localisation */}
        <div className="relative">
          <label htmlFor="ville" className="sr-only">Ville</label>
          <MapPin size={18} className="absolute left-3 top-3.5 text-slate-400" />
          <input
            type="text"
            id="ville"
            name="ville"
            value={filters.ville}
            onChange={handleChange}
            placeholder="Ville (ex: Paris)..."
            className="pl-10 w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Sélecteur de type de bien */}
        <div>
          <label htmlFor="type" className="sr-only">Type de bien</label>
          <select
            id="type"
            name="type"
            value={filters.type}
            onChange={handleChange}
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Tous les types</option>
            <option value="maison">Maison</option>
            <option value="appartement">Appartement</option>
            <option value="terrain">Terrain</option>
            <option value="local_commercial">Local Commercial</option>
          </select>
        </div>

        {/* Sélecteur de statut */}
        <div>
          <label htmlFor="statut" className="sr-only">Statut</label>
          <select
            id="statut"
            name="statut"
            value={filters.statut}
            onChange={handleChange}
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Tous les statuts</option>
            <option value="a_vendre">À Vendre</option>
            <option value="a_louer">À Louer</option>
            <option value="vendu">Vendu</option>
            <option value="loue">Loué</option>
          </select>
        </div>
      </div>

      {/* Tiroir des filtres avancés */}
      {showAdvanced && (
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in">
          {/* Prix Minimum */}
          <div>
            <label htmlFor="prix_min" className="block text-xs font-semibold text-slate-500 mb-1">Prix Minimum (€)</label>
            <input
              type="number"
              id="prix_min"
              name="prix_min"
              value={filters.prix_min}
              onChange={handleChange}
              placeholder="Min"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Prix Maximum */}
          <div>
            <label htmlFor="prix_max" className="block text-xs font-semibold text-slate-500 mb-1">Prix Maximum (€)</label>
            <input
              type="number"
              id="prix_max"
              name="prix_max"
              value={filters.prix_max}
              onChange={handleChange}
              placeholder="Max"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Surface Minimum */}
          <div>
            <label htmlFor="surface_min" className="block text-xs font-semibold text-slate-500 mb-1">Surface Min (m²)</label>
            <input
              type="number"
              id="surface_min"
              name="surface_min"
              value={filters.surface_min}
              onChange={handleChange}
              placeholder="Min"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Surface Maximum */}
          <div>
            <label htmlFor="surface_max" className="block text-xs font-semibold text-slate-500 mb-1">Surface Max (m²)</label>
            <input
              type="number"
              id="surface_max"
              name="surface_max"
              value={filters.surface_max}
              onChange={handleChange}
              placeholder="Max"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Pièces */}
          <div>
            <label htmlFor="pieces" className="block text-xs font-semibold text-slate-500 mb-1">Pièces Minimum</label>
            <input
              type="number"
              id="pieces"
              name="pieces"
              value={filters.pieces}
              onChange={handleChange}
              placeholder="Ex: 3"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Chambres */}
          <div>
            <label htmlFor="chambres" className="block text-xs font-semibold text-slate-500 mb-1">Chambres Minimum</label>
            <input
              type="number"
              id="chambres"
              name="chambres"
              value={filters.chambres}
              onChange={handleChange}
              placeholder="Ex: 2"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Salles de bain */}
          <div>
            <label htmlFor="salles_de_bain" className="block text-xs font-semibold text-slate-500 mb-1">Salles de bain Min</label>
            <input
              type="number"
              id="salles_de_bain"
              name="salles_de_bain"
              value={filters.salles_de_bain}
              onChange={handleChange}
              placeholder="Ex: 1"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      )}

      {/* Boutons d'action */}
      <div className="flex items-center justify-between mt-4">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-1.5 text-sm font-semibold text-slate-650 hover:text-indigo-650 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
        >
          <SlidersHorizontal size={16} />
          {showAdvanced ? "Masquer les filtres avancés" : "Plus de filtres"}
        </button>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 dark:text-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-all"
          >
            <RotateCcw size={15} />
            Réinitialiser
          </button>
          <button
            type="submit"
            className="px-6 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all"
          >
            Appliquer les filtres
          </button>
        </div>
      </div>
    </form>
  );
}
