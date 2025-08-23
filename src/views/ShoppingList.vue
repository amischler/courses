<template>
  <div class="shopping-list">
    <div class="shopping-list__header">
      <h2>{{ currentList?.name || 'Liste de courses' }}</h2>
      <div class="shopping-list__actions">
        <NcButton @click="toggleViewMode">
          <template #icon>
            <ViewList v-if="viewMode === 'simple'" :size="20" />
            <ViewGrid v-else :size="20" />
          </template>
          {{ viewMode === 'simple' ? 'Vue catégories' : 'Vue simple' }}
        </NcButton>
        <NcButton @click="showFrequentItems">
          <template #icon>
            <Star :size="20" />
          </template>
          Articles fréquents
        </NcButton>
      </div>
    </div>

    <div class="shopping-list__add">
      <NcTextField
        v-model="newItemName"
        placeholder="Ajouter un article..."
        @keyup.enter="addNewItem">
        <template #trailing-button-icon>
          <Plus :size="20" />
        </template>
      </NcTextField>
      <NcSelect
        v-model="newItemCategory"
        :options="categories"
        placeholder="Catégorie" />
      <NcTextField
        v-model="newItemQuantity"
        placeholder="Quantité"
        class="quantity-field" />
    </div>

    <div v-if="isLoading" class="shopping-list__loading">
      <NcLoadingIcon :size="64" />
    </div>

    <div v-else-if="viewMode === 'simple'" class="shopping-list__items">
      <ShoppingItem
        v-for="item in currentItems"
        :key="item.id"
        :item="item"
        @toggle="toggleItem"
        @delete="deleteItem" />
    </div>

    <div v-else class="shopping-list__categories">
      <div v-for="(items, category) in itemsByCategory" :key="category" class="category-group">
        <h3>{{ getCategoryLabel(category) }}</h3>
        <ShoppingItem
          v-for="item in items"
          :key="item.id"
          :item="item"
          @toggle="toggleItem"
          @delete="deleteItem" />
      </div>
    </div>

    <FrequentItemsModal
      v-if="showFrequent"
      :items="frequentItems"
      @close="showFrequent = false"
      @add="addFrequentItem" />
  </div>
</template>

<script>
import { NcButton, NcTextField, NcSelect, NcLoadingIcon } from '@nextcloud/vue'
import ViewList from 'vue-material-design-icons/ViewList.vue'
import ViewGrid from 'vue-material-design-icons/ViewGrid.vue'
import Star from 'vue-material-design-icons/Star.vue'
import Plus from 'vue-material-design-icons/Plus.vue'
import ShoppingItem from '@/components/ShoppingItem.vue'
import FrequentItemsModal from '@/components/FrequentItemsModal.vue'
import { useShoppingStore } from '@/stores/shopping'
import { mapState, mapActions } from 'pinia'

export default {
  name: 'ShoppingList',
  components: {
    NcButton,
    NcTextField,
    NcSelect,
    NcLoadingIcon,
    ViewList,
    ViewGrid,
    Star,
    Plus,
    ShoppingItem,
    FrequentItemsModal,
  },
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      newItemName: '',
      newItemCategory: null,
      newItemQuantity: '',
      showFrequent: false,
    }
  },
  computed: {
    ...mapState(useShoppingStore, [
      'currentList',
      'currentItems',
      'itemsByCategory',
      'categories',
      'frequentItems',
      'isLoading',
      'viewMode',
    ]),
  },
  watch: {
    id: {
      immediate: true,
      handler(newId) {
        if (newId) {
          this.selectList(parseInt(newId))
        }
      },
    },
  },
  mounted() {
    this.loadCategories()
    this.loadFrequentItems()
  },
  methods: {
    ...mapActions(useShoppingStore, [
      'selectList',
      'addItem',
      'toggleItem',
      'deleteItem',
      'toggleViewMode',
      'loadCategories',
      'loadFrequentItems',
    ]),
    
    async addNewItem() {
      if (!this.newItemName.trim()) return
      
      await this.addItem(
        this.newItemName,
        this.newItemQuantity || null,
        this.newItemCategory
      )
      
      this.newItemName = ''
      this.newItemQuantity = ''
      this.newItemCategory = null
    },
    
    showFrequentItems() {
      this.showFrequent = true
    },
    
    addFrequentItem(item) {
      this.addItem(item.name, null, item.category)
    },
    
    getCategoryLabel(categoryId) {
      const category = this.categories.find(c => c.id === categoryId)
      return category ? category.label : categoryId
    },
  },
}
</script>

<style lang="scss" scoped>
.shopping-list {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h2 {
      margin: 0;
    }
  }

  &__actions {
    display: flex;
    gap: 10px;
  }

  &__add {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;

    .quantity-field {
      max-width: 150px;
    }
  }

  &__loading {
    display: flex;
    justify-content: center;
    padding: 40px;
  }

  &__items {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__categories {
    .category-group {
      margin-bottom: 30px;

      h3 {
        margin: 0 0 10px 0;
        color: var(--color-primary);
        font-size: 1.1em;
      }
    }
  }
}

@media (max-width: 768px) {
  .shopping-list {
    padding: 10px;

    &__header {
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;
    }

    &__add {
      flex-direction: column;
    }
  }
}
</style>