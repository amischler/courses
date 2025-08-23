<template>
  <NcModal
    size="normal"
    name="Articles fréquents"
    @close="$emit('close')">
    <div class="frequent-items">
      <h2>Articles fréquents</h2>
      <p>Basé sur votre historique d'achats</p>
      
      <div class="frequent-items__list">
        <div
          v-for="item in items"
          :key="item.name"
          class="frequent-item"
          @click="addItem(item)">
          <span class="frequent-item__name">{{ item.name }}</span>
          <span class="frequent-item__frequency">
            {{ Math.round(item.frequency * 100) }}%
          </span>
          <NcButton type="tertiary">
            <template #icon>
              <Plus :size="20" />
            </template>
          </NcButton>
        </div>
      </div>
    </div>
  </NcModal>
</template>

<script>
import { NcModal, NcButton } from '@nextcloud/vue'
import Plus from 'vue-material-design-icons/Plus.vue'

export default {
  name: 'FrequentItemsModal',
  components: {
    NcModal,
    NcButton,
    Plus,
  },
  props: {
    items: {
      type: Array,
      required: true,
    },
  },
  methods: {
    addItem(item) {
      this.$emit('add', item)
    },
  },
}
</script>

<style lang="scss" scoped>
.frequent-items {
  padding: 20px;

  h2 {
    margin: 0 0 5px 0;
  }

  p {
    color: var(--color-text-lighter);
    margin: 0 0 20px 0;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
}

.frequent-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-radius: var(--border-radius);
  background: var(--color-background-hover);
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: var(--color-background-dark);
  }

  &__name {
    flex: 1;
  }

  &__frequency {
    margin-right: 10px;
    color: var(--color-text-lighter);
    font-size: 0.9em;
  }
}
</style>