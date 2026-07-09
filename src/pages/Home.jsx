import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Shield, Star, Award, Heart, Mail, Phone, Calendar, ArrowRight } from 'lucide-react';
import { bienService, authService, messageService } from '../services/api';
import PropertyCard from '../components/PropertyCard';

export default function Home() {
  const navigate = useNavigate();
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contactForm, setContactForm] = useState({ nom: '', email: '', tel: '', message: '' });
  const [formStatus, setFormStatus] = useState({ type: '', text: '' });
  const [quickSearch, setQuickSearch] = useState({ search: '', type: '', statut: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Charger les 3 derniers biens immobiliers
        const bienRes = await bienService.getAll({ per_page: 3 });
        setFeaturedProperties(bienRes.data || []);
        
        // Charger les agents immobiliers
        const agentsRes = await authService.getAgents();
        // Conserver uniquement les 3 premiers agents
        setAgents((agentsRes || []).slice(0, 3));
      } catch (err) {
        console.error('Error fetching landing page data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleQuickSearchChange = (e) => {
    const { name, value } = e.target;
    setQuickSearch(prev => ({ ...prev, [name]: value }));
  };

  const handleQuickSearchSubmit = (e) => {
    e.preventDefault();
    const queryParams = new URLSearchParams();
    if (quickSearch.search) queryParams.set('search', quickSearch.search);
    if (quickSearch.type) queryParams.set('type', quickSearch.type);
    if (quickSearch.statut) queryParams.set('statut', quickSearch.statut);
    navigate(`/catalog?${queryParams.toString()}`);
  };

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContactForm(prev => ({ ...prev, [name]: value }));
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setFormStatus({ type: 'info', text: 'Envoi en cours...' });
    try {
      await messageService.create(contactForm);
      setFormStatus({ type: 'success', text: 'Votre message a bien été envoyé. Notre équipe vous recontactera sous peu.' });
      setContactForm({ nom: '', email: '', tel: '', message: '' });
    } catch (err) {
      console.error('Error sending message:', err);
      setFormStatus({ type: 'error', text: 'Une erreur est survenue lors de l\'envoi. Veuillez réessayer.' });
    }
  };

  return (
    <div className="flex flex-col gap-20 pb-20">
      {/* Section Hero d'accueil */}
      <section className="relative min-h-[85vh] flex items-center justify-center bg-slate-900 text-white overflow-hidden py-20 px-4">
        {/* Image d'arrière-plan avec opacité */}
        <div className="absolute inset-0 opacity-40">
          <img 
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=80" 
            alt="Premium villa background"
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Effets de dégradés et lumières en arrière-plan */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/70 to-transparent"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Contenu principal du Hero */}
        <div className="relative max-w-5xl mx-auto text-center z-10 space-y-8">
          <span className="inline-block px-4 py-1.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-xs font-semibold uppercase tracking-wider animate-bounce">
            L'excellence immobilière à votre service
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight text-white">
            Trouvez Votre Bien Immobilier <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-indigo-300 bg-clip-text text-transparent">
              D'Exception
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-slate-350 font-normal">
            ImmoAgence vous accompagne dans la recherche, l'achat, la location ou la vente de propriétés de prestige. Explorez nos offres exclusives.
          </p>

          {/* Widget de Recherche Rapide */}
          <form 
            onSubmit={handleQuickSearchSubmit}
            className="bg-white/95 dark:bg-slate-900/95 p-4 md:p-6 rounded-2xl md:rounded-full shadow-2xl flex flex-col md:flex-row gap-4 max-w-4xl mx-auto text-slate-800 dark:text-white border border-white/20 dark:border-slate-800/80 backdrop-blur-md"
          >
            {/* Saisie par mot-clé */}
            <div className="flex-1 flex items-center gap-2 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 pb-2 md:pb-0">
              <Search className="text-indigo-600 dark:text-indigo-400 shrink-0" size={20} />
              <div className="flex-1 text-left">
                <label htmlFor="quick-search" className="block text-xs font-semibold text-slate-450 dark:text-slate-500">Où recherchez-vous ?</label>
                <input 
                  type="text"
                  id="quick-search"
                  name="search"
                  value={quickSearch.search}
                  onChange={handleQuickSearchChange}
                  placeholder="Ville, mot-clé..."
                  className="w-full bg-transparent border-0 p-0 text-sm font-semibold focus:ring-0 focus:outline-none placeholder-slate-400 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Sélecteur de type */}
            <div className="flex-1 flex items-center gap-2 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 pb-2 md:pb-0">
              <Star className="text-indigo-600 dark:text-indigo-400 shrink-0" size={20} />
              <div className="flex-1 text-left">
                <label htmlFor="quick-type" className="block text-xs font-semibold text-slate-450 dark:text-slate-500">Type de Propriété</label>
                <select 
                  id="quick-type"
                  name="type"
                  value={quickSearch.type}
                  onChange={handleQuickSearchChange}
                  className="w-full bg-transparent border-0 p-0 text-sm font-semibold focus:ring-0 focus:outline-none text-slate-900 dark:text-white"
                >
                  <option value="" className="text-slate-800">Tous types</option>
                  <option value="maison" className="text-slate-800">Maison</option>
                  <option value="appartement" className="text-slate-800">Appartement</option>
                  <option value="terrain" className="text-slate-800">Terrain</option>
                  <option value="local_commercial" className="text-slate-800">Commercial</option>
                </select>
              </div>
            </div>

            {/* Sélecteur de statut */}
            <div className="flex-1 flex items-center gap-2 pb-2 md:pb-0">
              <Shield className="text-indigo-600 dark:text-indigo-400 shrink-0" size={20} />
              <div className="flex-1 text-left">
                <label htmlFor="quick-statut" className="block text-xs font-semibold text-slate-450 dark:text-slate-500">Mode</label>
                <select 
                  id="quick-statut"
                  name="statut"
                  value={quickSearch.statut}
                  onChange={handleQuickSearchChange}
                  className="w-full bg-transparent border-0 p-0 text-sm font-semibold focus:ring-0 focus:outline-none text-slate-900 dark:text-white"
                >
                  <option value="" className="text-slate-800">Acheter ou Louer</option>
                  <option value="a_vendre" className="text-slate-800">Achat (À vendre)</option>
                  <option value="a_louer" className="text-slate-800">Location (À louer)</option>
                </select>
              </div>
            </div>

            <button 
              type="submit"
              className="px-8 py-3.5 bg-indigo-650 hover:bg-indigo-750 text-white font-bold rounded-xl md:rounded-full shadow-lg transition-all flex items-center justify-center gap-2"
            >
              Rechercher
            </button>
          </form>
        </div>
      </section>

      {/* Section des Services de l'agence */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white">
            Nos Services Immobiliers
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
            Nous offrons une gamme complète de services pour concrétiser vos projets de vie.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {/* Service 1 : Achat / Vente */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200/50 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all text-center space-y-4">
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <Award size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Acheter & Vendre</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Profitez de notre portefeuille de biens de prestige et de nos estimations gratuites pour vendre ou acheter au meilleur prix.
            </p>
          </div>

          {/* Service 2 : Gestion locative */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200/50 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all text-center space-y-4">
            <div className="w-12 h-12 bg-purple-50 dark:bg-purple-950/40 text-purple-650 dark:text-purple-400 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <Shield size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Location Gérée</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Propriétaires, déléguez la gestion de vos locations (contrats, visites, encaissement) en toute sécurité et tranquillité.
            </p>
          </div>

          {/* Service 3 : Financement */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200/50 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all text-center space-y-4">
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-650 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <Star size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Conseil Financement</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Nos partenaires courtiers vous aident à structurer vos financements pour obtenir les meilleurs taux d'intérêt bancaires.
            </p>
          </div>
        </div>
      </section>

      {/* Section des Biens immobiliers vedettes */}
      <section className="bg-slate-100/55 dark:bg-slate-900/30 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                Nos Dernières Propriétés
              </h2>
              <p className="text-slate-500 dark:text-slate-400 max-w-xl">
                Parcourez une sélection méticuleuse de nos toutes dernières acquisitions disponibles sur le marché.
              </p>
            </div>
            <Link 
              to="/catalog"
              className="inline-flex items-center gap-2 text-indigo-650 dark:text-indigo-400 font-bold hover:underline"
            >
              Voir tout le catalogue
              <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map(n => (
                <div key={n} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 h-96 animate-pulse"></div>
              ))}
            </div>
          ) : featuredProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredProperties.map(property => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <p className="text-slate-500">Aucun bien disponible actuellement. Revenez plus tard.</p>
            </div>
          )}
        </div>
      </section>

      {/* Section de présentation des Agents de l'agence */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white">
            Nos Agents Immobiliers
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
            Une équipe d'experts passionnés pour vous conseiller et vous accompagner à chaque étape.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-pulse">
            {[1, 2, 3].map(n => (
              <div key={n} className="bg-slate-200 dark:bg-slate-800 rounded-2xl h-64"></div>
            ))}
          </div>
        ) : agents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {agents.map(agent => (
              <div 
                key={agent.id} 
                className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl p-6 text-center space-y-4 shadow-sm hover:shadow-lg transition-all"
              >
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold mx-auto shadow-md">
                  {agent.prenom[0]}{agent.nom[0]}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {agent.prenom} {agent.nom}
                  </h3>
                  <span className="text-xs font-medium text-indigo-650 dark:text-indigo-400">
                    Agent Immobilier Agréé
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-850 flex justify-center gap-6 text-sm text-slate-505">
                  <span className="flex items-center gap-1">
                    <Phone size={14} className="text-slate-400" /> {agent.tel}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Agents fictifs de repli si la base de données est vide */}
            {[
              { id: 1, name: 'Jean Dupont', email: 'jean@dupont.com', phone: '+33 6 12 34 56 78', initial: 'JD' },
              { id: 2, name: 'Sophie Martin', email: 'sophie@martin.com', phone: '+33 6 87 65 43 21', initial: 'SM' },
              { id: 3, name: 'Marc Bernard', email: 'marc@bernard.com', phone: '+33 6 23 45 67 89', initial: 'MB' }
            ].map(agent => (
              <div 
                key={agent.id} 
                className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl p-6 text-center space-y-4 shadow-sm"
              >
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold mx-auto">
                  {agent.initial}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{agent.name}</h3>
                  <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">Conseiller Immobilier Senior</span>
                </div>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-sm text-slate-500 flex flex-col items-center gap-1">
                  <span className="flex items-center gap-1"><Phone size={14} /> {agent.phone}</span>
                  <span className="flex items-center gap-1"><Mail size={14} /> {agent.email}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Section Formulaire de Contact */}
      <section className="max-w-4xl mx-auto px-4 w-full">
        <div className="bg-gradient-to-tr from-indigo-650 to-purple-700 rounded-3xl p-8 md:p-12 text-white shadow-2xl space-y-8 relative overflow-hidden">
          {/* Effets lumineux d'arrière-plan */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="text-center max-w-2xl mx-auto space-y-4 relative z-10">
            <h2 className="text-3xl font-extrabold">Une Question ? Un Projet ?</h2>
            <p className="text-indigo-100">
              Remplissez notre formulaire de contact et un de nos agents immobiliers reviendra vers vous sous 24 heures.
            </p>
          </div>

          <form onSubmit={handleContactSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
            <div>
              <label htmlFor="contact-nom" className="block text-xs font-semibold uppercase tracking-wider text-indigo-200 mb-1">Nom complet</label>
              <input 
                type="text"
                id="contact-nom"
                name="nom"
                required
                value={contactForm.nom}
                onChange={handleContactChange}
                placeholder="Votre nom"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl placeholder-indigo-250 focus:outline-none focus:ring-2 focus:ring-white text-white"
              />
            </div>
            <div>
              <label htmlFor="contact-email" className="block text-xs font-semibold uppercase tracking-wider text-indigo-200 mb-1">Email</label>
              <input 
                type="email"
                id="contact-email"
                name="email"
                required
                value={contactForm.email}
                onChange={handleContactChange}
                placeholder="votre@email.com"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl placeholder-indigo-250 focus:outline-none focus:ring-2 focus:ring-white text-white"
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="contact-tel" className="block text-xs font-semibold uppercase tracking-wider text-indigo-200 mb-1">Téléphone (Optionnel)</label>
              <input 
                type="tel"
                id="contact-tel"
                name="tel"
                value={contactForm.tel}
                onChange={handleContactChange}
                placeholder="Ex: 0612345678"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl placeholder-indigo-250 focus:outline-none focus:ring-2 focus:ring-white text-white"
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="contact-message" className="block text-xs font-semibold uppercase tracking-wider text-indigo-200 mb-1">Votre message</label>
              <textarea 
                id="contact-message"
                name="message"
                rows="4"
                required
                value={contactForm.message}
                onChange={handleContactChange}
                placeholder="Décrivez votre projet (achat, vente, location, type de bien...)"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl placeholder-indigo-250 focus:outline-none focus:ring-2 focus:ring-white text-white resize-none"
              ></textarea>
            </div>

            <div className="md:col-span-2 mt-2">
              <button 
                type="submit"
                className="w-full py-4 bg-white hover:bg-slate-50 text-indigo-700 font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                Envoyer le message
              </button>
            </div>

            {formStatus.text && (
              <div className={`md:col-span-2 p-4 rounded-xl text-center font-medium ${
                formStatus.type === 'success' ? 'bg-emerald-500/20 text-emerald-255 border border-emerald-550/30' :
                formStatus.type === 'error' ? 'bg-red-500/20 text-red-255 border border-red-550/30' : 'bg-white/10 text-white'
              }`}>
                {formStatus.text}
              </div>
            )}
          </form>
        </div>
      </section>
    </div>
  );
}
