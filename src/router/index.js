import { createRouter, createWebHistory } from 'vue-router';
import Register from '../pages/register.vue';
import Login from '../pages/login.vue';
import Catalog from '../pages/catalog.vue';
import DashboardAdmin from '../pages/dashboardadmin.vue';
import EquipmentsAdmin from '../pages/equipmentsadmin.vue';
import CategoriesAdmin from '../pages/categoriesadmin.vue';

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/register', component: Register },
  { path: '/login', component: Login },
  { path: '/catalog', component: Catalog },
  { path: '/dashboardadmin', component: DashboardAdmin },
  { path: '/equipmentsadmin', component: EquipmentsAdmin },
  { path: '/categoriesadmin', component: CategoriesAdmin },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;