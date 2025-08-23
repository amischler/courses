import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = 3000

// Middleware pour servir les fichiers statiques
app.use('/apps/courses/js', express.static(path.join(__dirname, 'dist/js')))
app.use('/apps/courses/css', express.static(path.join(__dirname, 'dist/css')))
app.use(express.json())

// Routes API mockées
app.get('/apps/courses/api/lists', (req, res) => {
  res.json([
    {
      id: 1,
      name: 'Courses de la semaine',
      itemsCount: 12,
      shared: false
    },
    {
      id: 2,
      name: 'BBQ Samedi', 
      itemsCount: 8,
      shared: true
    }
  ])
})

app.get('/apps/courses/api/lists/*/items', (req, res) => {
  const mockItems = [
    {
      id: 1,
      name: 'Tomates',
      quantity: '1kg',
      category: 'fruits_vegetables',
      completed: false
    },
    {
      id: 2,
      name: 'Pain',
      quantity: '2',
      category: 'grocery',
      completed: true
    },
    {
      id: 3,
      name: 'Lait',
      quantity: '1L',
      category: 'dairy',
      completed: false
    }
  ]
  res.json(mockItems)
})

app.get('/apps/courses/api/categories', (req, res) => {
  res.json([
    { id: 'fruits_vegetables', label: 'Fruits & Légumes' },
    { id: 'meat_fish', label: 'Viandes & Poissons' },
    { id: 'dairy', label: 'Produits laitiers' },
    { id: 'grocery', label: 'Épicerie' },
    { id: 'beverages', label: 'Boissons' },
    { id: 'hygiene', label: 'Hygiène & Beauté' },
    { id: 'household', label: 'Entretien' },
    { id: 'other', label: 'Autres' }
  ])
})

app.get('/apps/courses/api/frequent-items', (req, res) => {
  res.json([
    { name: 'Lait', category: 'dairy', frequency: 0.8 },
    { name: 'Pain', category: 'grocery', frequency: 0.75 },
    { name: 'Tomates', category: 'fruits_vegetables', frequency: 0.6 }
  ])
})

// Route principale pour servir l'application
app.get('/apps/courses*', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Courses - Nextcloud</title>
        <link href="/apps/courses/css/courses-main.css" rel="stylesheet">
        <style>
            body { 
                margin: 0; 
                padding: 0; 
                background: #f8f9fa; 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            #content { width: 100%; min-height: 100vh; }
        </style>
    </head>
    <body>
        <div id="content"></div>
        <script src="/apps/courses/js/courses-main.js"></script>
    </body>
    </html>
  `)
})

app.listen(PORT, () => {
  console.log(`🚀 Serveur de développement démarré !`)
  console.log(`📱 Application accessible sur : http://localhost:${PORT}/apps/courses/`)
  console.log(`🔧 API mockée disponible sur : http://localhost:${PORT}/apps/courses/api/`)
})