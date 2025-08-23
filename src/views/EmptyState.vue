<template>
  <NcEmptyContent
    name="Sélectionnez une liste"
    description="Choisissez une liste dans le menu de gauche ou créez-en une nouvelle">
    <template #icon>
      <Cart :size="64" />
    </template>
    <template #action>
      <NcButton type="primary" @click="createNewList">
        <template #icon>
          <Plus :size="20" />
        </template>
        Créer une liste
      </NcButton>
    </template>
  </NcEmptyContent>
</template>

<script>
import { NcEmptyContent, NcButton } from '@nextcloud/vue'
import Cart from 'vue-material-design-icons/Cart.vue'
import Plus from 'vue-material-design-icons/Plus.vue'
import { useShoppingStore } from '@/stores/shopping'
import { mapActions } from 'pinia'

export default {
  name: 'EmptyState',
  components: {
    NcEmptyContent,
    NcButton,
    Cart,
    Plus,
  },
  methods: {
    ...mapActions(useShoppingStore, ['createNewList']),
  },
}
</script>