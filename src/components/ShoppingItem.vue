<template>
  <div class="shopping-item" :class="{ 'shopping-item--completed': item.completed }">
    <NcCheckboxRadioSwitch
      :checked="item.completed"
      @update:checked="$emit('toggle', item.id)">
      <span class="shopping-item__name">{{ item.name }}</span>
      <span v-if="item.quantity" class="shopping-item__quantity">{{ item.quantity }}</span>
    </NcCheckboxRadioSwitch>
    <NcActions>
      <NcActionButton @click="$emit('delete', item.id)">
        <template #icon>
          <Delete :size="20" />
        </template>
        Supprimer
      </NcActionButton>
    </NcActions>
  </div>
</template>

<script>
import { NcCheckboxRadioSwitch, NcActions, NcActionButton } from '@nextcloud/vue'
import Delete from 'vue-material-design-icons/Delete.vue'

export default {
  name: 'ShoppingItem',
  components: {
    NcCheckboxRadioSwitch,
    NcActions,
    NcActionButton,
    Delete,
  },
  props: {
    item: {
      type: Object,
      required: true,
    },
  },
}
</script>

<style lang="scss" scoped>
.shopping-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px;
  border-radius: var(--border-radius);
  background: var(--color-background-hover);
  transition: opacity 0.3s;

  &--completed {
    opacity: 0.6;

    .shopping-item__name {
      text-decoration: line-through;
    }
  }

  &__name {
    flex: 1;
  }

  &__quantity {
    margin-left: 10px;
    color: var(--color-text-lighter);
    font-size: 0.9em;
  }
}
</style>