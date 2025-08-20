import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import Vue3Toastify from "vue3-toastify";
import "vue3-toastify/dist/index.css";

const app = createApp(App)
app.use(Vue3Toastify);
app.mount('#app');
