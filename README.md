# Courses - Application Nextcloud

Application de gestion collaborative de listes de courses pour Nextcloud.

## Installation

### Prérequis
- Nextcloud 25+
- PHP 8.0+
- Node.js 18+

### Installation pour développement

1. Cloner le repository dans le dossier apps de Nextcloud :
```bash
cd /path/to/nextcloud/apps
git clone https://github.com/yourusername/courses.git courses
```

2. Installer les dépendances PHP :
```bash
cd courses
composer install
```

3. Installer les dépendances JavaScript :
```bash
npm install
```

4. Compiler les assets :
```bash
npm run build
```

5. Activer l'application dans Nextcloud :
```bash
occ app:enable courses
```

## Développement

### Build en mode développement
```bash
npm run dev
```

### Lancer les tests
```bash
composer test
npm run lint
```

## Structure du projet

```
courses/
├── appinfo/          # Métadonnées et configuration Nextcloud
├── lib/              # Code PHP backend
│   ├── Controller/   # Contrôleurs
│   └── Service/      # Services métier
├── src/              # Code Vue.js frontend
│   ├── components/   # Composants Vue
│   ├── views/        # Pages
│   ├── stores/       # State management (Pinia)
│   └── services/     # Services API et offline
├── templates/        # Templates PHP
└── package.json      # Dépendances npm
```

## Fonctionnalités

- ✅ Création et gestion de listes de courses
- ✅ Catégorisation des articles
- ✅ Mode hors-ligne avec synchronisation
- ✅ Partage entre utilisateurs Nextcloud
- ✅ Suggestions d'articles fréquents
- ✅ Vue par catégories ou simple
- ✅ Interface mobile-first responsive

## License

AGPL-3.0-or-later