import http from 'http'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const PORT = 3000

// Données en mémoire
let lists = [
  {
    id: 1,
    name: 'Courses de la semaine',
    itemsCount: 3,
    shared: false
  },
  {
    id: 2,
    name: 'BBQ Samedi',
    itemsCount: 0,
    shared: true
  }
]

let nextListId = 3

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`)
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  console.log(`${req.method} ${url.pathname}`)
  
  // Handle OPTIONS for CORS
  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    res.end()
    return
  }
  
  // Servir les fichiers JS
  if (url.pathname.startsWith('/apps/courses/js/')) {
    const filename = path.basename(url.pathname)
    const filepath = path.join(__dirname, 'dist/js', filename)
    
    if (fs.existsSync(filepath)) {
      res.setHeader('Content-Type', 'application/javascript')
      fs.createReadStream(filepath).pipe(res)
      return
    }
  }
  
  // Servir les fichiers CSS
  if (url.pathname.startsWith('/apps/courses/css/')) {
    const filename = path.basename(url.pathname)
    const filepath = path.join(__dirname, 'dist/css', filename)
    
    if (fs.existsSync(filepath)) {
      res.setHeader('Content-Type', 'text/css')
      fs.createReadStream(filepath).pipe(res)
      return
    }
  }
  
  // API Routes
  if (url.pathname === '/apps/courses/api/lists') {
    res.setHeader('Content-Type', 'application/json')
    
    if (req.method === 'GET') {
      res.end(JSON.stringify(lists))
      return
    }
    
    if (req.method === 'POST') {
      let body = ''
      req.on('data', chunk => {
        body += chunk.toString()
      })
      req.on('end', () => {
        try {
          const data = JSON.parse(body)
          const newList = {
            id: nextListId++,
            name: data.name || 'Nouvelle liste',
            itemsCount: 0,
            shared: false
          }
          lists.push(newList)
          res.end(JSON.stringify(newList))
        } catch (e) {
          res.statusCode = 400
          res.end(JSON.stringify({ error: 'Invalid JSON' }))
        }
      })
      return
    }
  }
  
  if (url.pathname.match(/^\/apps\/courses\/api\/lists\/\d+\/items$/)) {
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify([
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
    ]))
    return
  }
  
  // Gestion des PUT pour update d'item
  if (url.pathname.match(/^\/apps\/courses\/api\/items\/\d+$/) && req.method === 'PUT') {
    let body = ''
    req.on('data', chunk => {
      body += chunk.toString()
    })
    req.on('end', () => {
      try {
        const data = JSON.parse(body)
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ id: parseInt(url.pathname.split('/').pop()), ...data }))
      } catch (e) {
        res.statusCode = 400
        res.end(JSON.stringify({ error: 'Invalid JSON' }))
      }
    })
    return
  }
  
  if (url.pathname === '/apps/courses/api/categories') {
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify([
      { id: 'fruits_vegetables', label: 'Fruits & Légumes' },
      { id: 'meat_fish', label: 'Viandes & Poissons' },
      { id: 'dairy', label: 'Produits laitiers' },
      { id: 'grocery', label: 'Épicerie' },
      { id: 'beverages', label: 'Boissons' },
      { id: 'hygiene', label: 'Hygiène & Beauté' },
      { id: 'household', label: 'Entretien' },
      { id: 'other', label: 'Autres' }
    ]))
    return
  }
  
  if (url.pathname === '/apps/courses/api/frequent-items') {
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify([
      { name: 'Lait', category: 'dairy', frequency: 0.8 },
      { name: 'Pain', category: 'grocery', frequency: 0.75 },
      { name: 'Tomates', category: 'fruits_vegetables', frequency: 0.6 }
    ]))
    return
  }
  
  // Page principale de l'application
  if (url.pathname.startsWith('/apps/courses')) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.end(`
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
        .loading { 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            height: 50vh; 
            font-size: 18px; 
            color: #666; 
        }
    </style>
</head>
<body>
    <div id="content">
        <div class="loading">Chargement de l'application...</div>
    </div>
    <script>
        // Setup minimal pour simuler l'environnement Nextcloud
        window.OC = {
            webroot: '',
            appswebroots: { courses: '/apps/courses' },
            getCurrentUser: () => ({ uid: 'demo', displayName: 'Demo User' }),
            config: { version: '25.0.0' }
        };
        window._oc_capabilities = {};
        window._oc_config = { version: '25.0.0' };
        window.addEventListener('error', function(e) {
            if (e.message && e.message.includes('Service Worker')) {
                e.preventDefault();
            }
        });
    </script>
    <script src="/apps/courses/js/courses-main.js"></script>
</body>
</html>
    `)
    return
  }
  
  // 404
  res.statusCode = 404
  res.end('Page non trouvée')
})

server.listen(PORT, () => {
  console.log(`🚀 Serveur de développement démarré !`)
  console.log(`📱 Application accessible sur : http://localhost:${PORT}/apps/courses/`)
  console.log(`🔧 API mockée disponible`)
  console.log(`\n💡 Ouvrez votre navigateur et allez sur http://localhost:${PORT}/apps/courses/`)
})