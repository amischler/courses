// Utiliser axios standard pour le développement
const isDev = !window.OC

// Construire l'URL de base correctement pour Nextcloud
// Toujours utiliser index.php dans Nextcloud
const baseUrl = window.OC 
  ? '/index.php/apps/courses/api'
  : '/apps/courses/api'

// Fonction helper pour les requêtes
async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  
  const contentType = response.headers.get('content-type')
  if (contentType && contentType.includes('application/json')) {
    return response.json()
  }
  
  return response.text()
}

export default {
  async getLists() {
    return request(`${baseUrl}/lists`)
  },

  async createList(data) {
    return request(`${baseUrl}/lists`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async updateList(id, data) {
    return request(`${baseUrl}/lists/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  async deleteList(id) {
    return request(`${baseUrl}/lists/${id}`, {
      method: 'DELETE',
    })
  },

  async getItems(listId) {
    return request(`${baseUrl}/lists/${listId}/items`)
  },

  async createItem(listId, data) {
    return request(`${baseUrl}/lists/${listId}/items`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async updateItem(id, data) {
    return request(`${baseUrl}/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  async deleteItem(id) {
    return request(`${baseUrl}/items/${id}`, {
      method: 'DELETE',
    })
  },

  async getCategories() {
    return request(`${baseUrl}/categories`)
  },

  async getFrequentItems() {
    return request(`${baseUrl}/frequent-items`)
  },
}