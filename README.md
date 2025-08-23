# Courses - Application Nextcloud

Application de gestion collaborative de listes de courses pour Nextcloud.

## Installation

### Prérequis
- Nextcloud 25+
- PHP 8.0+

### Installation rapide (recommandée)

1. **Cloner directement** dans le dossier apps de Nextcloud :
```bash
cd /path/to/nextcloud/apps
git clone https://github.com/amischler/courses.git
```

2. **Ajuster les permissions** :
```bash
cd courses
chown -R www-data:www-data .
```

3. **Activer l'application** :
```bash
# Via CLI
php /path/to/nextcloud/occ app:enable courses

# Ou via l'interface admin Nextcloud :
# Applications → Apps → "Courses" → Activer
```

### Installation pour développement

Si vous voulez modifier le code :

1. Cloner le repository :
```bash
git clone https://github.com/amischler/courses.git
cd courses
```

2. Installer les dépendances :
```bash
npm install --legacy-peer-deps
composer install
```

3. Développer et builder :
```bash
npm run build
cp dist/js/* js/
cp dist/css/* css/
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