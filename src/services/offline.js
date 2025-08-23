import Dexie from 'dexie'

// Base de données IndexedDB pour le mode hors-ligne
const db = new Dexie('CoursesOfflineDB')

db.version(1).stores({
  lists: 'id, name, itemsCount, shared, synced',
  items: 'id, listId, name, quantity, category, completed, synced',
  queue: '++id, action, data, timestamp'
})

// Service Worker pour la PWA
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/apps/courses/service-worker.js')
    .then(reg => console.log('Service Worker registered'))
    .catch(err => console.error('Service Worker registration failed:', err))
}

// Gestion de la queue d'opérations hors-ligne
export const offlineQueue = {
  async add(action, data) {
    await db.queue.add({
      action,
      data,
      timestamp: Date.now()
    })
  },

  async processQueue() {
    if (!navigator.onLine) return

    const queue = await db.queue.toArray()
    
    for (const item of queue) {
      try {
        await this.processQueueItem(item)
        await db.queue.delete(item.id)
      } catch (error) {
        console.error('Failed to process queue item:', error)
      }
    }
  },

  async processQueueItem(item) {
    const { action, data } = item
    
    switch (action) {
      case 'createItem':
        // Appeler l'API pour créer l'item
        break
      case 'updateItem':
        // Appeler l'API pour mettre à jour l'item
        break
      case 'deleteItem':
        // Appeler l'API pour supprimer l'item
        break
      default:
        console.warn('Unknown action:', action)
    }
  }
}

// Synchronisation automatique quand la connexion revient
window.addEventListener('online', () => {
  console.log('Back online, processing queue...')
  offlineQueue.processQueue()
})

// Cache des données pour le mode hors-ligne
export const offlineCache = {
  async saveLists(lists) {
    await db.lists.bulkPut(lists.map(list => ({ ...list, synced: true })))
  },

  async getLists() {
    return await db.lists.toArray()
  },

  async saveItems(listId, items) {
    // Supprimer les anciens items de cette liste
    await db.items.where('listId').equals(listId).delete()
    // Ajouter les nouveaux
    await db.items.bulkAdd(items.map(item => ({ 
      ...item, 
      listId,
      synced: true 
    })))
  },

  async getItems(listId) {
    return await db.items.where('listId').equals(listId).toArray()
  },

  async addItem(listId, item) {
    return await db.items.add({ 
      ...item, 
      listId,
      synced: false 
    })
  },

  async updateItem(id, updates) {
    await db.items.update(id, { ...updates, synced: false })
  },

  async deleteItem(id) {
    await db.items.delete(id)
  }
}

export default {
  offlineQueue,
  offlineCache,
  db
}