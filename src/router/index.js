import { createRouter, createWebHashHistory } from 'vue-router'
import { generateUrl } from '@nextcloud/router'
import ShoppingList from '@/views/ShoppingList.vue'
import EmptyState from '@/views/EmptyState.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: EmptyState,
  },
  {
    path: '/list/:id',
    name: 'list',
    component: ShoppingList,
    props: true,
  },
]

const router = createRouter({
  history: createWebHashHistory(generateUrl('/apps/courses')),
  routes,
})

export default router