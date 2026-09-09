import { createRouter, createWebHistory } from 'vue-router';

// Pages Component (Huruf Kecil)
import Register from '../pages/register.vue';
import Login from '../pages/login.vue';
import Catalog from '../pages/catalog.vue';
import Rental from '../pages/rental.vue';
import History from '../pages/history.vue';
import DashboardAdmin from '../pages/dashboardadmin.vue';
import EquipmentsAdmin from '../pages/equipmentsadmin.vue';
import CategoriesAdmin from '../pages/categoriesadmin.vue';
import RentalAdmin from '../pages/rentaladmin.vue';

// Components
import Navbar from '../components/navbar.vue';
import Footer from '../components/footer.vue';

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/register', component: Register },
  { path: '/login', component: Login },
  { path: '/catalog', component: Catalog },
  { path: '/rental', component: Rental },
  { path: '/history', component: History },
  { path: '/dashboardadmin', component: DashboardAdmin },
  { path: '/equipmentsadmin', component: EquipmentsAdmin },
  { path: '/categoriesadmin', component: CategoriesAdmin },
  { path: '/rentaladmin', component:RentalAdmin },
  
  // Route Komponen Tambahan
  { path: '/navbar', component: Navbar },
  { path: '/footer', component: Footer },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;