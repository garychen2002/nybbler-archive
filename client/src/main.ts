import './assets/main.css'

// https://ui.vuestic.dev/getting-started/installation#usage-with-tailwind
import 'vuestic-ui/styles/essential.css'
import 'vuestic-ui/styles/typography.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createVuestic } from 'vuestic-ui'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(createVuestic())
app.use(router)

app.mount('#app')
