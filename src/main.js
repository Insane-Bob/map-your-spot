import { createPinia } from 'pinia'
import { createApp } from 'vue'

import './styles/base.css'
import './styles/leaflet.css'
import './styles/variables.css'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
