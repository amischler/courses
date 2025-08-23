import { defineStore } from 'pinia'
import api from '@/services/api'
import { offlineQueue } from '@/services/offline'

export const useShoppingStore = defineStore('shopping', {
  state: () => ({
    shoppingLists: [],
    currentListId: null,
    currentItems: [],
    categories: [],
    frequentItems: [],
    isLoading: false,
    viewMode: 'simple', // 'simple' or 'categories'
  }),

  getters: {
    currentList: (state) => {
      return state.shoppingLists.find(list => list.id === state.currentListId)
    },
    
    itemsByCategory: (state) => {
      if (state.viewMode !== 'categories') return {}
      
      return state.currentItems.reduce((acc, item) => {
        const category = item.category || 'Autres'
        if (!acc[category]) acc[category] = []
        acc[category].push(item)
        return acc
      }, {})
    },
    
    completedItemsCount: (state) => {
      return state.currentItems.filter(item => item.completed).length
    },
  },

  actions: {
    async loadLists() {
      this.isLoading = true
      try {
        const lists = await api.getLists()
        this.shoppingLists = lists
        
        if (lists.length > 0 && !this.currentListId) {
          this.selectList(lists[0].id)
        }
      } catch (error) {
        console.error('Erreur lors du chargement des listes', error)
      } finally {
        this.isLoading = false
      }
    },

    async selectList(listId) {
      this.currentListId = listId
      await this.loadItems(listId)
      // Naviguer vers la vue de la liste
      if (this.router) {
        this.router.push(`/list/${listId}`)
      }
    },

    async loadItems(listId) {
      this.isLoading = true
      try {
        this.currentItems = await api.getItems(listId)
      } catch (error) {
        console.error('Erreur lors du chargement des articles', error)
      } finally {
        this.isLoading = false
      }
    },

    async createNewList() {
      // Pour le développement, utiliser prompt natif
      // En production, utiliser @nextcloud/dialogs
      const name = prompt('Nom de la nouvelle liste :')
      if (!name) return

      try {
        const newList = await api.createList({ name })
        this.shoppingLists.push(newList)
        this.selectList(newList.id)
        // showSuccess ne fonctionne qu'en environnement Nextcloud complet
        console.log('Liste créée:', name)
      } catch (error) {
        console.error('Erreur lors de la création de la liste', error)
      }
    },

    async addItem(name, quantity = null, category = null) {
      try {
        const item = await api.createItem(this.currentListId, {
          name,
          quantity,
          category,
          completed: false,
        })
        this.currentItems.push(item)
      } catch (error) {
        // En mode hors-ligne, ajouter à la queue
        if (!navigator.onLine) {
          const tempItem = {
            id: `temp_${Date.now()}`,
            name,
            quantity,
            category,
            completed: false,
          }
          this.currentItems.push(tempItem)
          offlineQueue.add('createItem', { listId: this.currentListId, item: tempItem })
        } else {
          console.error('Erreur lors de l\'ajout de l\'article')
        }
      }
    },

    async toggleItem(itemId) {
      console.log('toggleItem appelé avec itemId:', itemId)
      const item = this.currentItems.find(i => i.id === itemId)
      if (!item) {
        console.log('Item non trouvé:', itemId)
        return
      }

      console.log('Item trouvé:', item, 'completed avant:', item.completed)
      item.completed = !item.completed
      console.log('completed après:', item.completed)

      try {
        console.log('Appel API updateItem...')
        await api.updateItem(itemId, { completed: item.completed })
        console.log('API updateItem réussie')
      } catch (error) {
        console.log('Erreur API:', error)
        if (!navigator.onLine) {
          offlineQueue.add('updateItem', { itemId, data: { completed: item.completed } })
          console.log('Ajouté à la queue hors-ligne')
        } else {
          item.completed = !item.completed
          console.error('Erreur lors de la mise à jour', error)
        }
      }
    },

    async deleteItem(itemId) {
      const index = this.currentItems.findIndex(i => i.id === itemId)
      if (index === -1) return

      const item = this.currentItems[index]
      this.currentItems.splice(index, 1)

      try {
        await api.deleteItem(itemId)
      } catch (error) {
        if (!navigator.onLine) {
          offlineQueue.add('deleteItem', { itemId })
        } else {
          this.currentItems.splice(index, 0, item)
          console.error('Erreur lors de la suppression')
        }
      }
    },

    toggleViewMode() {
      this.viewMode = this.viewMode === 'simple' ? 'categories' : 'simple'
    },

    async loadCategories() {
      try {
        this.categories = await api.getCategories()
      } catch (error) {
        console.error('Erreur lors du chargement des catégories', error)
      }
    },

    async loadFrequentItems() {
      try {
        this.frequentItems = await api.getFrequentItems()
      } catch (error) {
        console.error('Erreur lors du chargement des articles fréquents', error)
      }
    },
  },
})