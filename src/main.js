import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

// UBAH DARI INI:
// import './style.css';

// MENJADI INI (sesuai nama file CSS di folder src kamu):
import './index.css'; 

const app = createApp(App);
app.use(router);
app.mount('#app');