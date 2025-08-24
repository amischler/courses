// Construire l'URL de base correctement pour Nextcloud
const getBaseUrl = () => {
  // Si on est dans Nextcloud, utiliser generateUrl si disponible
  if (window.OC && window.OC.generateUrl) {
    return window.OC.generateUrl('/apps/courses/api')
  }
  // Sinon fallback sur URL directe avec index.php
  return window.OC ? '/index.php/apps/courses/api' : '/apps/courses/api'
}

const baseUrl = getBaseUrl()

// Fonction helper pour les requêtes
async function request(url, options = {}) {
  // Ajouter les headers requis par Nextcloud
  const headers = {
    'Content-Type': 'application/json',
    'OCS-APIRequest': 'true',
    ...options.headers,
  }
  
  // Ajouter le token CSRF si disponible
  if (window.OC && window.OC.requestToken) {
    headers['requesttoken'] = window.OC.requestToken
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'same-origin',
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