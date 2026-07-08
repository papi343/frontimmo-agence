import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, User, LogOut, Menu, X, Sun, Moon, Briefcase } from 'lucide-react';
import { authService } from '../services/api';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Synchroniser l'état d'authentification
  useEffect(() => {
    const checkUser = () => {
      const storedUser = localStorage.getItem('immo_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        setUser(null);
      }
    };
    
    checkUser();
    
    // Écouter les modifications (ex: depuis la page de connexion)
    window.addEventListener('storage', checkUser);
    const interval = setInterval(checkUser, 1000); // repli par scrutation/polling pour les mises à jour sur le même onglet
    
    return () => {
      window.removeEventListener('storage', checkUser);
      clearInterval(interval);
    };
  }, []);

  // Support du thème
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setIsDropdownOpen(false);
      navigate('/');
    } catch (err) {
      console.error(err);
    }
  };

  const isActive = (path) => location.pathname === path;

  const roleLabels = {
    admin: 'Administrateur',
    agent: 'Agent Immobilier',
    client: 'Client',
  };

  const roleColors = {
    admin: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    agent: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
    client: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  };

  return (
    <nav className="sticky top-0 z-50 w-full glass border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl text-slate-900 dark:text-white tracking-tight">
              <div className="p-2 bg-indigo-600 rounded-lg text-white shadow-md shadow-indigo-200 dark:shadow-none animate-pulse">
                <Home size={20} />
              </div>
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                ImmoAgence
              </span>
            </Link>
          </div>

          {/* Liens de navigation bureau (Desktop) */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              to="/"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive('/') 
                  ? 'text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-slate-900' 
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900/50'
              }`}
            >
              Accueil
            </Link>
            <Link
              to="/catalog"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive('/catalog') 
                  ? 'text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-slate-900' 
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900/50'
              }`}
            >
              Catalogue
            </Link>
          </div>

          {/* Menu utilisateur bureau et sélecteur de thème */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900/50 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} />}
            </button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900/50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-inner">
                    {user.prenom ? user.prenom[0].toUpperCase() : <User size={16} />}
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {user.prenom} {user.nom}
                  </span>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-xl ring-1 ring-black ring-opacity-5 animate-fade-in">
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-850 mb-1">
                      <p className="text-xs text-slate-450 dark:text-slate-500">Rôle</p>
                      <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-semibold ${roleColors[user.role]}`}>
                        {roleLabels[user.role] || user.role}
                      </span>
                    </div>

                    <Link
                      to="/dashboard"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-150 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Briefcase size={16} />
                      Tableau de bord
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-red-650 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20 transition-colors"
                    >
                      <LogOut size={16} />
                      Se déconnecter
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Connexion
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md hover:shadow-lg hover:shadow-indigo-100 dark:hover:shadow-none transition-all"
                >
                  S'inscrire
                </Link>
              </div>
            )}
          </div>

          {/* Menu burger mobile */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              {theme === 'dark' ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Menu mobile */}
      {isOpen && (
        <div className="md:hidden glass border-t border-slate-200 dark:border-slate-800 px-4 pt-2 pb-4 space-y-1">
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className={`block px-3 py-2 rounded-lg text-base font-medium ${
              isActive('/') ? 'text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-slate-900' : 'text-slate-750 dark:text-slate-305'
            }`}
          >
            Accueil
          </Link>
          <Link
            to="/catalog"
            onClick={() => setIsOpen(false)}
            className={`block px-3 py-2 rounded-lg text-base font-medium ${
              isActive('/catalog') ? 'text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-slate-900' : 'text-slate-750 dark:text-slate-305'
            }`}
          >
            Catalogue
          </Link>

          {user ? (
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="px-3 py-2">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {user.prenom} {user.nom}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">{roleLabels[user.role]}</p>
              </div>
              <Link
                to="/dashboard"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-750 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Tableau de bord
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
                className="block w-full text-left px-3 py-2 rounded-lg text-base font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20"
              >
                Se déconnecter
              </button>
            </div>
          ) : (
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="text-center px-4 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800"
              >
                Connexion
              </Link>
              <Link
                to="/register"
                onClick={() => setIsOpen(false)}
                className="text-center px-4 py-2 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                S'inscrire
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
