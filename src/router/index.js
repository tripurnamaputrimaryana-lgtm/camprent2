import { createRouter, createWebHistory } from 'vue-router';

// Pages Component
import Home from '../pages/home.vue';           // <--- Halaman Utama 
import Register from '../pages/register.vue';
import Login from '../pages/login.vue';
import Catalog from '../pages/catalog.vue';     // <--- Halaman Katalog (Sidebar Kategori di Kiri)
import Rental from '../pages/rental.vue';
import History from '../pages/history.vue';
import DashboardAdmin from '../pages/dashboardadmin.vue';
import EquipmentsAdmin from '../pages/equipmentsadmin.vue';
import CategoriesAdmin from '../pages/categoriesadmin.vue';
import RentalAdmin from '../pages/rentaladmin.vue';
import UserAdmin from '../pages/useradmin.vue';
import ReportsAdmin from '../pages/reportsadmin.vue';

import Navbar from '../components/navbar.vue';
import Footer from '../components/footer.vue';

const routes = [
  // Halaman Utama (http://localhost:5173/) menggunakan Home
  { path: '/', component: Home },
  
  // Halaman Katalog (http://localhost:5173/catalog) menggunakan Catalog
  { path: '/catalog', component: Catalog },
  
  { path: '/register', component: Register },
  { path: '/login', component: Login },
  
  // Rute User yang butuh login
  { path: '/rental', component: Rental, meta: { requiresAuth: true } },
  { path: '/history', component: History, meta: { requiresAuth: true } },
  
  // Rute Khusus Admin
  { path: '/dashboardadmin', component: DashboardAdmin, meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/equipmentsadmin', component: EquipmentsAdmin, meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/categoriesadmin', component: CategoriesAdmin, meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/rentaladmin', component: RentalAdmin, meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/useradmin', component: UserAdmin, meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/reportsadmin', component: ReportsAdmin, meta: { requiresAuth: true, requiresAdmin: true } },
  
  { path: '/navbar', component: Navbar },
  { path: '/footer', component: Footer },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  let user = null;

  try {
    user = userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    user = null;
  }

  if (to.meta.requiresAuth && !token) {
    return next('/login');
  }

  if (user) {
    if (to.meta.requiresAdmin && user.role !== 'admin') {
      alert('Akses ditolak! Halaman ini khusus untuk Admin.');
      return next('/catalog');
    }

    // REDIRECT ADMIN OTOMATIS SUDAH DIHAPUS DI SINI
    // Jadi admin bebas mau buka halaman utama, katalog, atau menu lainnya tanpa terpental.
  }

  next();
});

export default router;