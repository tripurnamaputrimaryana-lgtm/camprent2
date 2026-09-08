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
      const isPaid = ['approved', 'completed', 'paid', 'success', 'selesai', 'disetujui'].includes(status);
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
  <div class="min-h-screen bg-slate-900/5 font-['Plus_Jakarta_Sans',sans-serif] text-slate-800 flex">
    
    <!-- Sidebar Admin Component -->
    <SidebarAdmin 
      :is-open="isSidebarOpen" 
      :admin-user="adminUser"
      @close="isSidebarOpen = false"
      @logout="handleLogout"
    />

    <div class="flex-1 flex flex-col min-w-0">
      
      <!-- Topbar Header -->
      <header class="sticky top-0 z-30 bg-white/70 backdrop-blur-2xl border-b border-slate-200/60 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
        <div class="flex items-center gap-3">
          <button @click="isSidebarOpen = true" class="lg:hidden p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 transition">
            <Menu :size="20" />
          </button>
          <h2 class="text-base sm:text-lg font-black text-slate-800 tracking-tight">Dashboard Ringkasan</h2>
        </div>

        <div class="flex items-center gap-3">
          <button 
            @click="fetchDashboardData" 
            class="p-2.5 bg-slate-100/80 hover:bg-emerald-50 hover:text-emerald-600 text-slate-600 rounded-2xl transition cursor-pointer border border-slate-200/50"
            title="Refresh Data"
          >
            <RefreshCw :size="18" :class="{ 'animate-spin': loading }" />
          </button>
          <button class="p-2.5 bg-slate-100/80 hover:bg-slate-200/80 text-slate-600 rounded-2xl transition relative cursor-pointer border border-slate-200/50">
            <Bell :size="18" />
            <span class="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
            <span class="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full"></span>
          </button>
        </div>
      </header>

      <!-- Main Content -->
      <main class="p-4 sm:p-8 space-y-8 max-w-7xl mx-auto w-full">
        
        <!-- BANNER WELCOME TRANSPARAN & MODERN (GLASSMORPHISM PREMIUM) -->
        <div class="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-emerald-950/90 via-emerald-900/85 to-teal-900/90 backdrop-blur-2xl p-6 sm:p-10 text-white shadow-2xl shadow-emerald-950/20 border border-white/15">
          
          <!-- Glowing Aura & Background Ornaments -->
          <div class="absolute -top-24 -left-24 w-80 h-80 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none"></div>
          <div class="absolute -bottom-24 -right-12 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl pointer-events-none"></div>
          <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none"></div>

          <!-- Main Content Flex -->
          <div class="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            
            <div class="space-y-4 max-w-2xl">
              <!-- Pill Badge Transparan -->
              <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-emerald-300 text-xs font-extrabold tracking-wide">
                <span class="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <Sparkles :size="14" class="text-amber-300" /> System Control Center
              </div>

              <!-- Greeting & Nama Admin -->
              <h1 class="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                Selamat Datang, <span class="bg-gradient-to-r from-emerald-200 via-teal-200 to-white bg-clip-text text-transparent">{{ adminUser.name || 'Admin' }}</span>! 👋
              </h1>

              <!-- Deskripsi Ringkas -->
              <p class="text-emerald-100/80 text-xs sm:text-sm font-medium leading-relaxed max-w-xl">
                Pantau ketersediaan stok perlengkapan outdoor, pantau riwayat penyewaan, dan kelola statistik pendapatan secara real-time dari satu portal kontrol terpadu.
              </p>

              <!-- Quick Status Cards Di Dalam Banner -->
              <div class="pt-2 flex flex-wrap items-center gap-3 text-xs font-bold text-emerald-200/90">
                <div class="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10">
                  <Activity :size="15" class="text-emerald-400" />
                  <span>Sistem Normal</span>
                </div>
                <div class="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10">
                  <Zap :size="15" class="text-amber-400" />
                  <span>Update Realtime</span>
                </div>
              </div>
            </div>

            <!-- Tombol Aksi Kanan Banner Transparan -->
            <div class="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-3 shrink-0">
              <button 
                @click="navigateToEquipments"
                class="bg-white/95 hover:bg-white text-emerald-950 px-6 py-3.5 rounded-2xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0 cursor-pointer border border-white"
              >
                <Plus :size="18" class="text-emerald-600" /> 
                <span>Tambah Alat Camping</span>
              </button>

              <button 
                @click="fetchDashboardData"
                class="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md px-6 py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition border border-white/15 cursor-pointer"
              >
                <Compass :size="16" class="text-emerald-300" />
                <span>Sinkronkan Data</span>
              </button>
            </div>

          </div>

          <!-- Subtle Tent Vector Decor -->
          <Tent class="absolute -right-10 -bottom-12 text-white/[0.04] w-96 h-96 pointer-events-none select-none rotate-12" />
        </div>

        <!-- Warning Permission Info -->
        <div v-if="permissionError" class="p-4 bg-amber-50/80 backdrop-blur-md border border-amber-200/80 rounded-2xl flex items-start gap-3 text-amber-800 text-xs font-medium shadow-xs">
          <ShieldAlert :size="20" class="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p class="font-extrabold text-sm mb-0.5">Akses Pengguna Terbatas</p>
            <p>
              Gagal memuat total daftar pengguna dari API Laravel (`/api/users`). Hal ini biasanya disebabkan karena role akun tidak memiliki izin akses (Admin).
            </p>
          </div>
        </div>

        <!-- Cards Statistik -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          <!-- Total Pendapatan -->
          <div class="bg-white/80 backdrop-blur-xl p-5 rounded-3xl border border-slate-200/60 shadow-sm hover:shadow-md transition">
            <div class="flex items-center justify-between text-slate-400 mb-3">
              <span class="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Total Pendapatan</span>
              <div class="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl">
                <Wallet :size="20" />
              </div>
            </div>
            <p class="text-2xl font-black text-slate-800">
              Rp {{ Number(stats.revenue).toLocaleString('id-ID') }}
            </p>
            <span class="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-2">
              Transaksi Terkonfirmasi
            </span>
          </div>

          <!-- Total Alat -->
          <div class="bg-white/80 backdrop-blur-xl p-5 rounded-3xl border border-slate-200/60 shadow-sm hover:shadow-md transition">
            <div class="flex items-center justify-between text-slate-400 mb-3">
              <span class="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Total Alat</span>
              <div class="p-2.5 bg-blue-50 text-blue-600 rounded-2xl">
                <Package :size="20" />
              </div>
            </div>
            <p class="text-2xl font-black text-slate-800">{{ stats.total_equipments }} Unit</p>
            <span class="text-[11px] text-slate-400 font-bold mt-2 block">Terdaftar di katalog</span>
          </div>

          <!-- Total Transaksi -->
          <div class="bg-white/80 backdrop-blur-xl p-5 rounded-3xl border border-slate-200/60 shadow-sm hover:shadow-md transition">
            <div class="flex items-center justify-between text-slate-400 mb-3">
              <span class="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Total Penyewaan</span>
              <div class="p-2.5 bg-amber-50 text-amber-600 rounded-2xl">
                <ShoppingCart :size="20" />
              </div>
            </div>
            <p class="text-2xl font-black text-slate-800">{{ stats.total_rentals }} Penyewaan</p>
            <span class="text-[11px] text-amber-600 font-bold mt-2 block">Riwayat transaksi masuk</span>
          </div>

          <!-- Total Pengguna -->
          <div class="bg-white/80 backdrop-blur-xl p-5 rounded-3xl border border-slate-200/60 shadow-sm hover:shadow-md transition">
            <div class="flex items-center justify-between text-slate-400 mb-3">
              <span class="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Total Pengguna</span>
              <div class="p-2.5 bg-purple-50 text-purple-600 rounded-2xl">
                <Users :size="20" />
              </div>
            </div>
            <p class="text-2xl font-black text-slate-800">{{ stats.total_users }} Akun</p>
            <span class="text-[11px] text-slate-400 font-bold mt-2 block">User aktif terdaftar</span>
          </div>

        </div>

        <!-- Tabel Ringkasan Inventaris -->
        <div class="bg-white/80 backdrop-blur-xl rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
          <div class="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 class="font-extrabold text-slate-800 text-base">Kelola Inventaris Alat</h3>
              <p class="text-xs text-slate-400 font-medium">Ringkasan daftar peralatan camping dan status stok</p>
            </div>

            <div class="flex items-center gap-3">
              <div class="relative w-full sm:w-64">
                <Search class="absolute left-3.5 top-2.5 text-slate-400" :size="16" />
                <input 
                  v-model="searchTerm" 
                  type="text" 
                  placeholder="Cari alat atau kategori..." 
                  class="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none transition"
                />
              </div>
              <button 
                @click="navigateToEquipments"
                class="hidden sm:flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 whitespace-nowrap cursor-pointer"
              >
                Selengkapnya <ArrowRight :size="14" />
              </button>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-50/80 text-slate-400 uppercase font-extrabold tracking-wider border-b border-slate-100">
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

                <tr v-else v-for="item in filteredEquipments" :key="item.id" class="hover:bg-slate-50/80 transition-colors">
                  <td class="p-4 pl-6 font-bold text-slate-800">
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
                      <span class="font-extrabold text-sm text-slate-800">{{ item.name || item.title }}</span>
                    </div>
                  </td>

                  <td class="p-4">
                    <span class="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg text-[11px] font-bold border border-slate-200/60">
                      {{ item.category?.name || 'Umum' }}
                    </span>
                  </td>

                  <td class="p-4 font-extrabold text-emerald-600 text-sm">
                    Rp {{ Number(item.price_per_day || item.price || item.harga || 0).toLocaleString('id-ID') }}
                  </td>

                  <td class="p-4 font-bold">
                    <span 
                      :class="(item.stock || item.stok || 0) > 0 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : 'bg-rose-50 text-rose-600 border-rose-200'"
                      class="px-2.5 py-1 rounded-lg border text-[11px] font-bold inline-block"
                    >
                      {{ (item.stock || item.stok || 0) > 0 ? `${item.stock || item.stok} unit` : 'Habis' }}
                    </span>
                  </td>

                  <td class="p-4 text-center pr-6">
                    <div class="flex items-center justify-center gap-2">
                      <button 
                        @click="navigateToEquipments" 
                        class="bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded-xl text-xs font-bold transition cursor-pointer"
                        title="Edit Alat"
                      >
                        <Pencil :size="14" />
                      </button>
                      <button 
                        @click="handleDelete(item.id, item.name || item.title)" 
                        class="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 p-2 rounded-xl text-xs font-bold transition cursor-pointer"
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