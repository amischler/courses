import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useShoppingStore } from './stores/shopping'

// Définir le nom de l'app pour @nextcloud/vue
window.appName = 'courses'

const pinia = createPinia()
const app = createApp(App)

// Configuration globale pour @nextcloud/vue
app.config.globalProperties.appName = 'courses'

app.use(pinia)
app.use(router)

// Passer le router au store
const shoppingStore = useShoppingStore()
shoppingStore.router = router

app.mount('#content')