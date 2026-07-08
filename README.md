# 🏢 immo-agencefront

> Interface utilisateur moderne, fluide et performante pour la gestion et la recherche de biens immobiliers d'une agence. Conçu avec **React**, **Vite** et **Tailwind CSS**.

---

## 🚀 Technologies & Outils

Le projet est propulsé par une pile technologique moderne assurant rapidité de développement et performances optimales :

*   **[React](https://react.dev/)** : Bibliothèque UI pour des interfaces utilisateur réactives.
*   **[Vite](https://vite.dev/)** : Outil de build ultra-rapide avec Hot Module Replacement (HMR).
*   **[Tailwind CSS](https://tailwindcss.com/)** : Framework CSS utilitaire pour un design sur mesure et responsive.
*   **PostCSS** & **Autoprefixer** : Pré-traitement et compatibilité CSS multi-navigateurs.
*   **ESLint** : Pour garantir la qualité, la cohérence et le respect des bonnes pratiques du code JavaScript/React.

---

## 🛠️ Installation et Démarrage rapide

Suivez ces instructions simples pour installer et lancer le projet en local :

### Prérequis

Assurez-vous que [Node.js](https://nodejs.org/) (version >= 18) et npm (ou votre gestionnaire de paquets préféré) sont installés sur votre machine.

### 1. Cloner le projet

```bash
git clone <url-du-depot>
cd immo-agencefront
```

### 2. Installer les dépendances

Installez les packages nécessaires listés dans le `package.json` :

```bash
npm install
```

### 3. Lancer le serveur de développement

Démarrez le projet localement avec rechargement à chaud (HMR) :

```bash
npm run dev
```

*Le serveur sera accessible par défaut sur [http://localhost:5173](http://localhost:5173) (ou le port indiqué dans votre terminal).*

### 4. Compiler pour la production

Pour générer les fichiers optimisés pour le déploiement en production :

```bash
npm run build
```

Les fichiers compilés et minifiés seront générés dans le dossier `/dist`.

### 5. Analyser et formater le code

Pour exécuter le linter (ESLint) et vérifier d'éventuelles erreurs de code :

```bash
npm run lint
```

---

## 📂 Structure du Projet

Voici l'organisation principale des fichiers :

```text
immo-agencefront/
├── public/              # Fichiers statiques (icônes, images publiques...)
├── src/
│   ├── assets/          # Images et logos importés dans les composants
│   ├── App.css          # Styles spécifiques à l'application principale
│   ├── App.jsx          # Composant racine principal
│   ├── index.css        # Styles CSS globaux
│   └── main.jsx         # Point d'entrée de l'application React
├── eslint.config.js     # Configuration de ESLint
├── postcss.config.js    # Configuration des plugins PostCSS (Tailwind & Autoprefixer)
├── tailwind.config.js   # Configuration et personnalisation de Tailwind CSS
├── vite.config.js       # Configuration du bundler Vite
└── package.json         # Dépendances et scripts npm
```

---

## 🌟 Fonctionnalités clés & Roadmap

Dans le cadre du développement du frontend de l'agence immobilière, voici les modules principaux prévus :

1.  **🔍 Moteur de recherche & Filtres avancés** : Recherche intelligente par type de bien (Appartement, Maison, Terrain, etc.), budget, localisation, et nombre de pièces.
2.  **📋 Liste & Détails des Annonces** : Fiches détaillées avec galeries de photos, caractéristiques clés (DPE, surface habitable, jardin, terrasse, garage) et géolocalisation (carte interactive).
3.  **📞 Prise de contact & Prise de RDV** : Formulaire de contact direct avec l'agent responsable du bien et intégration éventuelle d'un calendrier de visites.
4.  **❤️ Espace Favoris & Alertes** : Possibilité pour les utilisateurs enregistrés de sauvegarder des annonces et de paramétrer des notifications pour les nouveaux biens correspondants.
5.  **💼 Dashboard Agent / Administrateur** : Interface d'administration sécurisée permettant d'ajouter, modifier ou archiver des biens, de suivre les contacts prospects et de gérer le statut des ventes/locations.

---

## 📄 Licence

Ce projet est sous licence propriétaire. Tous droits réservés à l'agence immobilière.

