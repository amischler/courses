import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useShoppingStore } from './stores/shopping'

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(router)

// Passer le router au store
const shoppingStore = useShoppingStore()
shoppingStore.router = router

app.mount('#content')