import './assets/main.css'

// https://ui.vuestic.dev/getting-started/installation#usage-with-tailwind
import 'vuestic-ui/styles/essential.css'
import 'vuestic-ui/styles/typography.css'

import { createPinia } from 'pinia'
import { createApp } from 'vue'
import { createVuestic } from 'vuestic-ui'

import 'tippy.js/dist/tippy.css'
import 'tippy.js/themes/material.css'
import { TippyPlugin } from 'tippy.vue'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(createVuestic())
app.use(TippyPlugin, {
  tippyDefaults: {
    arrow: false,
    theme: 'material'
  }
})
app.use(router)

app.mount('#app')
