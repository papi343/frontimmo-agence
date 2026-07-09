import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { Home, Mail, Lock, User, Phone, CheckSquare, AlertCircle } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    tel: '',
    email: '',
    password: '',
    role: 'client', // client, agent, admin
  });
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleSelect = (role) => {
    setFormData(prev => ({ ...prev, role }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setGlobalError('');

    try {
      await authService.register(formData);
      
      // Déclencher l'événement storage pour notifier la Navbar et les autres composants
      window.dispatchEvent(new Event('storage'));
      
      navigate('/dashboard');
    } catch (err) {
      console.error('Registration error:', err);
      if (err.response && err.response.data && err.response.data.errors) {
        setErrors(err.response.data.errors);
      } else {
        setGlobalError(
          err.response?.data?.message || 
          'Une erreur est survenue lors de la création de votre compte.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-lg w-full space-y-8 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-8 rounded-3xl shadow-xl">
        <div className="text-center space-y-4">
          <Link to="/" className="inline-flex items-center gap-2 font-bold text-2xl text-slate-900 dark:text-white">
            <div className="p-2 bg-indigo-600 rounded-lg text-white">
              <Home size={22} />
            </div>
            <span className="bg-gradient-to-r from-indigo-600 to-purple-650 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
              ImmoAgence
            </span>
          </Link>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Créer un compte
          </h2>
          <p className="text-slate-500 text-sm">
            Rejoignez notre réseau pour trouver, louer ou proposer vos biens immobiliers.
          </p>
        </div>

        {globalError && (
          <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-2 text-sm text-red-650 dark:text-red-400 font-medium">
            <AlertCircle size={18} className="shrink-0" />
            <span>{globalError}</span>
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Sélecteur de rôle */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 text-center">
              Je suis un :
            </label>
            <div className="grid grid-cols-3 gap-3">
              {['client', 'agent', 'admin'].map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => handleRoleSelect(role)}
                  className={`py-3 px-4 rounded-xl text-xs font-bold capitalize border text-center transition-all ${
                    formData.role === role
                      ? 'bg-indigo-600 border-indigo-650 text-white shadow-md'
                      : 'bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-slate-700 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-900'
                  }`}
                >
                  {role === 'client' ? 'Client' : role === 'agent' ? 'Agent' : 'Admin'}
                </button>
              ))}
            </div>
            {errors.role && <p className="text-xs text-red-500 mt-1">{errors.role[0]}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Prénom */}
            <div>
              <label htmlFor="prenom" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Prénom
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-3.5 text-slate-400" />
                <input
                  id="prenom"
                  name="prenom"
                  type="text"
                  required
                  value={formData.prenom}
                  onChange={handleChange}
                  placeholder="Jean"
                  className={`pl-10 w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-850 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white ${
                    errors.prenom ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                  }`}
                />
              </div>
              {errors.prenom && <p className="text-xs text-red-500 mt-1">{errors.prenom[0]}</p>}
            </div>

            {/* Nom */}
            <div>
              <label htmlFor="nom" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Nom
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-3.5 text-slate-400" />
                <input
                  id="nom"
                  name="nom"
                  type="text"
                  required
                  value={formData.nom}
                  onChange={handleChange}
                  placeholder="Dupont"
                  className={`pl-10 w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-850 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white ${
                    errors.nom ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                  }`}
                />
              </div>
              {errors.nom && <p className="text-xs text-red-500 mt-1">{errors.nom[0]}</p>}
            </div>

            {/* Téléphone */}
            <div className="md:col-span-2">
              <label htmlFor="tel" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Numéro de téléphone
              </label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-3.5 text-slate-400" />
                <input
                  id="tel"
                  name="tel"
                  type="tel"
                  required
                  value={formData.tel}
                  onChange={handleChange}
                  placeholder="Ex: +33 6 12 34 56 78"
                  className={`pl-10 w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-850 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white ${
                    errors.tel ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                  }`}
                />
              </div>
              {errors.tel && <p className="text-xs text-red-500 mt-1">{errors.tel[0]}</p>}
            </div>

            {/* Adresse Email */}
            <div className="md:col-span-2">
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Adresse Email
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-3.5 text-slate-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="votre@email.com"
                  className={`pl-10 w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-850 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white ${
                    errors.email ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                  }`}
                />
              </div>
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email[0]}</p>}
            </div>

            {/* Mot de passe */}
            <div className="md:col-span-2">
              <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Mot de passe (Min 8 caractères)
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-3.5 text-slate-400" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`pl-10 w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-850 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white ${
                    errors.password ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                  }`}
                />
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password[0]}</p>}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors shadow-lg disabled:opacity-50"
            >
              {loading ? 'Création de compte...' : "S'inscrire"}
            </button>
          </div>
        </form>

        <div className="text-center pt-4 border-t border-slate-100 dark:border-slate-800 text-sm text-slate-500">
          Vous avez déjà un compte ?{' '}
          <Link to="/login" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
            Se connecter
          </Link>
        </div>
      </div>
    </div>
  );
}
