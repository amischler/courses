<template>
  <NcContent app-name="courses">
    <NcAppNavigation :aria-label="t('courses', 'Courses lists')">
      <template #list>
        <NcAppNavigationItem
          v-for="list in shoppingLists"
          :key="list.id"
          :name="list.name"
          :active="currentListId === list.id"
          @click="selectList(list.id)">
          <template #counter>
            <NcCounterBubble :count="list.itemsCount">
              {{ list.itemsCount }}
            </NcCounterBubble>
          </template>
        </NcAppNavigationItem>
      </template>
      <template #footer>
        <NcAppNavigationItem
          name="Nouvelle liste"
          @click="createNewList">
          <template #icon>
            <Plus :size="20" />
          </template>
        </NcAppNavigationItem>
      </template>
    </NcAppNavigation>

    <NcAppContent>
      <router-view />
    </NcAppContent>
  </NcContent>
</template>

<script>
import { NcContent, NcAppNavigation, NcAppNavigationItem, NcAppContent, NcCounterBubble } from '@nextcloud/vue'
import Plus from 'vue-material-design-icons/Plus.vue'
import { useShoppingStore } from '@/stores/shopping'
import { mapState, mapActions } from 'pinia'

export default {
  name: 'App',
  components: {
    NcContent,
    NcAppNavigation,
    NcAppNavigationItem,
    NcAppContent,
    NcCounterBubble,
    Plus,
  },
  computed: {
    ...mapState(useShoppingStore, ['shoppingLists', 'currentListId']),
  },
  mounted() {
    this.loadLists()
  },
  methods: {
    ...mapActions(useShoppingStore, ['loadLists', 'selectList', 'createNewList']),
    t(app, text) {
      // Fonction de traduction simplifiée pour le dev
      return text
    }
  },
}
</script>

<style lang="scss" scoped>
</style>