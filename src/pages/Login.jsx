import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { Home, Mail, Lock, AlertCircle } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authService.login(credentials);
      
      // Déclencher l'événement storage pour notifier la Navbar et les autres onglets
      window.dispatchEvent(new Event('storage'));
      
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError(
        err.response?.data?.message || 
        'Connexion échouée. Vérifiez vos identifiants.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-8 rounded-3xl shadow-xl">
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
            Bon retour parmi nous
          </h2>
          <p className="text-slate-500 text-sm">
            Accédez à votre espace immobilier ImmoAgence
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-2 text-sm text-red-650 dark:text-red-400 font-medium">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md">
            {/* Adresse Email */}
            <div>
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
                  value={credentials.email}
                  onChange={handleChange}
                  placeholder="votre@email.com"
                  className="pl-10 w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white placeholder-slate-450 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Mot de passe
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-3.5 text-slate-400" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={credentials.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="pl-10 w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white placeholder-slate-450 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors shadow-lg disabled:opacity-50"
            >
              {loading ? 'Connexion en cours...' : 'Se connecter'}
            </button>
          </div>
        </form>

        <div className="text-center pt-4 border-t border-slate-100 dark:border-slate-800 text-sm text-slate-500">
          Nouveau sur ImmoAgence ?{' '}
          <Link to="/register" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
            Créer un compte
          </Link>
        </div>
      </div>
    </div>
  );
}
