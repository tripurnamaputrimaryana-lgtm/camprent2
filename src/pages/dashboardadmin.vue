<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { 
  Users, 
  Package, 
  ShoppingCart, 
  Wallet, 
  RefreshCw, 
  Menu, 
  Bell, 
  Tent, 
  Sparkles, 
  Plus, 
  Search, 
  Pencil, 
  Trash2, 
  Image as ImageIcon,
  ArrowRight,
  ShieldAlert,
  Compass,
  Zap,
  Activity
} from 'lucide-vue-next';
import API from '../utils/axios';
import SidebarAdmin from '../components/SidebarAdmin.vue';
import NavbarAdmin from '../components/navbaradmin.vue';

const router = useRouter();

// State Utama
const loading = ref(true);
const isSidebarOpen = ref(false);
const adminUser = ref(JSON.parse(localStorage.getItem('user') || '{}'));
const searchTerm = ref('');
const permissionError = ref(false);

const stats = ref({
  total_users: 0,
  total_equipments: 0,
  total_rentals: 0,
  revenue: 0,
});

const equipments = ref([]);

// Function untuk Mengambil Semua Data Dashboard
const fetchDashboardData = async () => {
  loading.value = true;
  permissionError.value = false;

  // 1. Fetch Data Peralatan
  try {
    const resEquip = await API.get('/equipments');
    const eData = Array.isArray(resEquip.data) ? resEquip.data : (resEquip.data?.data || []);
    equipments.value = eData;
    stats.value.total_equipments = eData.length;
  } catch (err) {
    console.warn('Gagal mengambil data peralatan:', err);
  }

  // 2. Fetch Data Pengguna
  try {
    const resUsers = await API.get('/users');
    const uData = Array.isArray(resUsers.data) ? resUsers.data : (resUsers.data?.data || []);
    stats.value.total_users = uData.length;
  } catch (err) {
    console.warn('Gagal mengambil data pengguna (Akses dibatasi oleh Backend Laravel):', err);
    permissionError.value = true;
    
    if (adminUser.value && adminUser.value.id) {
      stats.value.total_users = 1;
    }
  }

  // 3. Fetch Data Transaksi & Penyewaan
  try {
    const resRentals = await API.get('/rentals');
    const rData = Array.isArray(resRentals.data) ? resRentals.data : (resRentals.data?.data || []);
    stats.value.total_rentals = rData.length;

    stats.value.revenue = rData.reduce((acc, curr) => {
      const status = (curr.status || '').toLowerCase();
      const paymentStatus = (curr.payment_status || '').toLowerCase();
      
      const isPaid = ['approved', 'completed', 'paid', 'success', 'selesai', 'disetujui'].includes(status) ||
                     ['approved', 'completed', 'paid', 'success', 'selesai', 'disetujui'].includes(paymentStatus);
                     
      const amount = Number(curr.total_price || curr.total_harga || curr.price || 0);
      return isPaid ? acc + amount : acc;
    }, 0);
  } catch (err) {
    console.warn('Gagal mengambil data transaksi sewa:', err);
  } finally {
    loading.value = false;
  }
};

// Filter Pencarian Peralatan di Tabel
const filteredEquipments = computed(() => {
  if (!searchTerm.value.trim()) return equipments.value;
  return equipments.value.filter(item => {
    const name = item.name || item.title || '';
    const category = item.category?.name || '';
    return name.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
           category.toLowerCase().includes(searchTerm.value.toLowerCase());
  });
});

const navigateToEquipments = () => {
  router.push('/equipments-admin');
};

const handleDelete = async (id, name) => {
  if (confirm(`Apakah kamu yakin ingin menghapus "${name}"?`)) {
    try {
      await API.delete(`/equipments/${id}`);
      equipments.value = equipments.value.filter(e => e.id !== id);
      stats.value.total_equipments = equipments.value.length;
    } catch (err) {
      console.error('Gagal menghapus peralatan:', err);
      alert('Gagal menghapus alat.');
    }
  }
};

const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  router.push('/login');
};

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  return `http://localhost:8000/storage/${imagePath}`;
};

onMounted(() => {
  fetchDashboardData();
});
</script>

<template>
  <div class="min-h-screen bg-slate-50/70 font-['Plus_Jakarta_Sans',sans-serif] text-slate-800 flex selection:bg-emerald-500 selection:text-white">
    
    <!-- Sidebar Admin Component -->
    <SidebarAdmin 
      :is-open="isSidebarOpen" 
      :admin-user="adminUser"
      @close="isSidebarOpen = false"
      @logout="handleLogout"
    />

    <div class="flex-1 flex flex-col min-w-0">
      
      <NavbarAdmin title="Dashboard Ringkasan" :admin-user="adminUser" @menu="isSidebarOpen = true" @logout="handleLogout">
        <template #actions>
          <button
            type="button"
            @click="fetchDashboardData"
            class="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl transition cursor-pointer border border-emerald-100"
            title="Refresh Data"
          >
            <RefreshCw :size="17" :class="{ 'animate-spin': loading }" />
          </button>
        </template>
      </NavbarAdmin>

      <!-- Main Content -->
      <main class="p-4 sm:p-8 space-y-8 max-w-7xl mx-auto w-full">
        
        <!-- BANNER WELCOME: Transparan dengan Simbol Tenda Besar di Belakang -->
        <div class="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-emerald-600/15 backdrop-blur-xl p-6 sm:p-10 text-slate-900 shadow-lg shadow-emerald-900/5 border border-emerald-500/20">
          
          <!-- Simbol Tenda Besar Estetik di Bagian Belakang Kanan -->
          <div class="absolute right-[-20px] bottom-[-30px] pointer-events-none select-none text-emerald-600/[0.12] z-0">
            <Tent :size="260" />
          </div>

          <!-- Ornamen Cahaya Abstrak Pendukung -->
          <div class="absolute -top-24 -left-24 w-80 h-80 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none"></div>

          <!-- Main Content Flex -->
          <div class="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            
            <div class="space-y-4 max-w-2xl">
              <!-- Pill Badge Kecil -->
              <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 backdrop-blur-md border border-emerald-500/30 text-emerald-800 text-xs font-semibold tracking-wide shadow-xs">
                <span class="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <Sparkles :size="14" class="text-emerald-600" /> System Control Center
              </div>

              <!-- Greeting & Nama Admin (Tanpa Emoji) -->
              <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-slate-900">
                Selamat Datang, <span class="text-emerald-700">{{ adminUser.name || 'Admin' }}</span>
              </h1>

              <!-- Deskripsi Ringkas -->
              <p class="text-slate-600 text-xs sm:text-sm font-normal leading-relaxed max-w-xl">
                Pantau ketersediaan stok perlengkapan outdoor, pantau riwayat penyewaan, dan kelola statistik pendapatan secara real-time dari satu portal kontrol terpadu.
              </p>

              <!-- Quick Status Cards Di Dalam Banner -->
              <div class="pt-2 flex flex-wrap items-center gap-3 text-xs font-medium text-slate-700">
                <div class="flex items-center gap-2 bg-white/60 backdrop-blur-md px-3.5 py-2 rounded-xl border border-emerald-500/20 shadow-2xs">
                  <Activity :size="15" class="text-emerald-600" />
                  <span>Sistem Normal</span>
                </div>
                <div class="flex items-center gap-2 bg-white/60 backdrop-blur-md px-3.5 py-2 rounded-xl border border-emerald-500/20 shadow-2xs">
                  <Zap :size="15" class="text-amber-500" />
                  <span>Update Realtime</span>
                </div>
              </div>
            </div>

            <!-- Tombol Aksi Kanan Banner -->
            <div class="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-3 shrink-0">
              <button 
                @click="navigateToEquipments"
                class="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                <Plus :size="18" class="text-emerald-100" /> 
                <span>Tambah Alat Camping</span>
              </button>

              <button 
                @click="fetchDashboardData"
                class="bg-white/70 hover:bg-white text-slate-700 backdrop-blur-md px-6 py-3 rounded-2xl font-semibold text-xs flex items-center justify-center gap-2 transition border border-emerald-500/20 cursor-pointer shadow-2xs"
              >
                <Compass :size="16" class="text-emerald-600" />
                <span>Sinkronkan Data</span>
              </button>
            </div>

          </div>
        </div>

        <!-- Warning Permission Info -->
        <div v-if="permissionError" class="p-4 bg-amber-50/90 backdrop-blur-md border border-amber-200 rounded-2xl flex items-start gap-3 text-amber-800 text-xs font-medium shadow-xs">
          <ShieldAlert :size="20" class="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p class="font-bold text-sm mb-0.5">Akses Pengguna Terbatas</p>
            <p>
              Gagal memuat total daftar pengguna dari API Laravel (`/api/users`). Hal ini biasanya disebabkan karena role akun tidak memiliki izin akses (Admin).
            </p>
          </div>
        </div>

        <!-- Cards Statistik -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          <!-- Total Pendapatan -->
          <div class="bg-white p-5 rounded-3xl border border-slate-200/70 shadow-xs hover:shadow-md transition">
            <div class="flex items-center justify-between text-slate-400 mb-3">
              <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Pendapatan</span>
              <div class="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl">
                <Wallet :size="20" />
              </div>
            </div>
            <p class="text-2xl font-extrabold text-slate-900">
              Rp {{ Number(stats.revenue).toLocaleString('id-ID') }}
            </p>
            <span class="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-2">
              Transaksi Terkonfirmasi
            </span>
          </div>

          <!-- Total Alat -->
          <div class="bg-white p-5 rounded-3xl border border-slate-200/70 shadow-xs hover:shadow-md transition">
            <div class="flex items-center justify-between text-slate-400 mb-3">
              <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Alat</span>
              <div class="p-2.5 bg-blue-50 text-blue-600 rounded-2xl">
                <Package :size="20" />
              </div>
            </div>
            <p class="text-2xl font-extrabold text-slate-900">{{ stats.total_equipments }} Unit</p>
            <span class="text-[11px] text-slate-400 font-semibold mt-2 block">Terdaftar di katalog</span>
          </div>

          <!-- Total Transaksi -->
          <div class="bg-white p-5 rounded-3xl border border-slate-200/70 shadow-xs hover:shadow-md transition">
            <div class="flex items-center justify-between text-slate-400 mb-3">
              <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Penyewaan</span>
              <div class="p-2.5 bg-amber-50 text-amber-600 rounded-2xl">
                <ShoppingCart :size="20" />
              </div>
            </div>
            <p class="text-2xl font-extrabold text-slate-900">{{ stats.total_rentals }} Penyewaan</p>
            <span class="text-[11px] text-amber-600 font-semibold mt-2 block">Riwayat transaksi masuk</span>
          </div>

          <!-- Total Pengguna -->
          <div class="bg-white p-5 rounded-3xl border border-slate-200/70 shadow-xs hover:shadow-md transition">
            <div class="flex items-center justify-between text-slate-400 mb-3">
              <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Pengguna</span>
              <div class="p-2.5 bg-purple-50 text-purple-600 rounded-2xl">
                <Users :size="20" />
              </div>
            </div>
            <p class="text-2xl font-extrabold text-slate-900">{{ stats.total_users }} Akun</p>
            <span class="text-[11px] text-slate-400 font-semibold mt-2 block">User aktif terdaftar</span>
          </div>

        </div>

        <!-- Tabel Ringkasan Inventaris -->
        <div class="bg-white rounded-3xl shadow-xs border border-slate-200/70 overflow-hidden">
          <div class="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 class="font-bold text-slate-900 text-base">Kelola Inventaris Alat</h3>
              <p class="text-xs text-slate-500 font-medium">Ringkasan daftar peralatan camping dan status stok</p>
            </div>

            <div class="flex items-center gap-3">
              <div class="relative w-full sm:w-64">
                <Search class="absolute left-3.5 top-3 text-slate-400" :size="16" />
                <input 
                  v-model="searchTerm" 
                  type="text" 
                  placeholder="Cari alat atau kategori..." 
                  class="w-full pl-9 pr-4 py-2 bg-slate-50/80 border border-slate-200 text-slate-800 placeholder-slate-400 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition"
                />
              </div>
              <button 
                @click="navigateToEquipments"
                class="hidden sm:flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 whitespace-nowrap cursor-pointer"
              >
                Selengkapnya <ArrowRight :size="14" />
              </button>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-50 text-slate-500 uppercase font-bold tracking-wider border-b border-slate-100">
                <tr>
                  <th class="p-4 pl-6">Perlengkapan</th>
                  <th class="p-4">Kategori</th>
                  <th class="p-4">Harga / Hari</th>
                  <th class="p-4">Stok Unit</th>
                  <th class="p-4 text-center pr-6">Tindakan</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 text-slate-700 font-medium">
                <tr v-if="loading">
                  <td colspan="5" class="p-12 text-center text-slate-400">
                    <div class="inline-block w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                    <p class="text-xs font-semibold">Mengambil data dari server...</p>
                  </td>
                </tr>

                <tr v-else-if="filteredEquipments.length === 0">
                  <td colspan="5" class="p-12 text-center text-slate-400">
                    Tidak ada peralatan yang sesuai.
                  </td>
                </tr>

                <tr v-else v-for="item in filteredEquipments" :key="item.id" class="hover:bg-slate-50/60 transition-colors">
                  <td class="p-4 pl-6 font-bold text-slate-900">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                        <img 
                          v-if="item.image || item.gambar" 
                          :src="getImageUrl(item.image || item.gambar)" 
                          class="w-full h-full object-cover" 
                          @error="$event.target.style.display='none'"
                        />
                        <ImageIcon v-else :size="18" class="text-slate-400" />
                      </div>
                      <span class="font-semibold text-sm text-slate-900">{{ item.name || item.title }}</span>
                    </div>
                  </td>

                  <td class="p-4">
                    <span class="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg text-[11px] font-semibold border border-slate-200/60">
                      {{ item.category?.name || 'Umum' }}
                    </span>
                  </td>

                  <td class="p-4 font-bold text-emerald-600 text-sm">
                    Rp {{ Number(item.price_per_day || item.price || item.harga || 0).toLocaleString('id-ID') }}
                  </td>

                  <td class="p-4 font-semibold">
                    <span 
                      :class="(item.stock || item.stok || 0) > 0 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : 'bg-rose-50 text-rose-600 border-rose-200'"
                      class="px-2.5 py-1 rounded-lg border text-[11px] font-semibold inline-block"
                    >
                      {{ (item.stock || item.stok || 0) > 0 ? `${item.stock || item.stok} unit` : 'Habis' }}
                    </span>
                  </td>

                  <td class="p-4 text-center pr-6">
                    <div class="flex items-center justify-center gap-2">
                      <button 
                        @click="navigateToEquipments" 
                        class="bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded-xl text-xs font-semibold transition cursor-pointer"
                        title="Edit Alat"
                      >
                        <Pencil :size="14" />
                      </button>
                      <button 
                        @click="handleDelete(item.id, item.name || item.title)" 
                        class="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 p-2 rounded-xl text-xs font-semibold transition cursor-pointer"
                        title="Hapus Alat"
                      >
                        <Trash2 :size="14" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  </div>
</template>