import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './styles.css'
import { useAccountsStore } from './stores/accounts'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)

// Загружаем сохранённые аккаунты из localStorage при старте
const accountsStore = useAccountsStore()
accountsStore.loadFromStorage()

app.mount('#app')
