<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ShoppingBag, Search, LogOut, Tent, CheckCircle2, XCircle, Sparkles, Filter } from 'lucide-vue-next';
import API from '../utils/axios';

const router = useRouter();

const equipments = ref([]);
const categories = ref([]);
const selectedCategory = ref('all');
const searchTerm = ref('');
const loading = ref(true);
const user = ref(JSON.parse(localStorage.getItem('user') || '{}'));

const fetchData = async () => {
  loading.value = true;
  try {
    const [resCategories, resEquipments] = await Promise.all([
      API.get('/categories'),
      API.get('/equipments'),
    ]);

    categories.value = resCategories.data.data || resCategories.data;
    equipments.value = resEquipments.data.data || resEquipments.data;
  } catch (err) {
    console.error('Gagal mengambil data katalog:', err);
  } finally {
    loading.value = false;
  }
};

const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  router.push('/login');
};

const filteredEquipments = computed(() => {
  return equipments.value.filter((item) => {
    const matchCategory =
      selectedCategory.value === 'all' || item.category_id === Number(selectedCategory.value);
    const matchSearch = item.name.toLowerCase().includes(searchTerm.value.toLowerCase());
    return matchCategory && matchSearch;
  });
});

onMounted(() => {
  fetchData();
});
</script>

<template>
  <div class="min-h-screen bg-emerald-50/30 font-['Plus_Jakarta_Sans',sans-serif] text-slate-800">
    <!-- Navbar Modern Glassmorphism -->
    <nav class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-emerald-100 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex justify-between items-center">
        <!-- Logo Header -->
        <div class="flex items-center gap-2.5">
          <div class="bg-emerald-600 p-2 rounded-xl text-white shadow-md shadow-emerald-600/20">
            <Tent :size="24" />
          </div>
          <span class="text-xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-800 to-emerald-600 bg-clip-text text-transparent">
            CampRent
          </span>
        </div>

        <!-- User Profile & Action -->
        <div class="flex items-center gap-4">
          <div class="hidden sm:flex items-center gap-2 text-sm font-semibold text-slate-600 bg-slate-100/80 px-3 py-1.5 rounded-full border border-slate-200/60">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Halo, <strong class="text-emerald-700 font-bold">{{ user.name || 'Petualang' }}</strong>
          </div>
          <button
            @click="handleLogout"
            class="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <LogOut :size="15" /> Keluar
          </button>
        </div>
      </div>
    </nav>

    <!-- Main Content Container -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      <!-- Hero Banner Ringkas -->
      <div class="mb-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-800 to-emerald-600 text-white shadow-xl shadow-emerald-900/10 relative overflow-hidden">
        <div class="relative z-10 max-w-xl">
          <span class="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-emerald-100 mb-3">
            <Sparkles :size="14" class="text-amber-300" /> Katalog Resmi Peralatan
          </span>
          <h2 class="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            Sewa Alat Camping Premium untuk Petualanganmu.
          </h2>
          <p class="text-emerald-100/90 text-xs sm:text-sm mt-2 font-medium">
            Jaminan alat bersih, steril, dan siap pakai kapan saja.
          </p>
        </div>
        <Tent class="absolute -right-6 -bottom-6 text-white/10 w-64 h-64 pointer-events-none" />
      </div>

      <!-- Search & Category Filters -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <!-- Input Cari -->
        <div class="relative w-full md:w-80">
          <Search class="absolute left-3.5 top-3 text-slate-400" :size="18" />
          <input
            v-model="searchTerm"
            type="text"
            placeholder="Cari tenda, carrier, matras..."
            class="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none transition shadow-xs"
          />
        </div>

        <!-- Filter Kategori Pill-Style -->
        <div class="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <div class="text-slate-400 flex items-center gap-1 text-xs font-bold uppercase tracking-wider pr-1">
            <Filter :size="14" />
          </div>
          <button
            @click="selectedCategory = 'all'"
            :class="[
              'px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border',
              selectedCategory === 'all'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50',
            ]"
          >
            Semua Alat
          </button>
          <button
            v-for="cat in categories"
            :key="cat.id"
            @click="selectedCategory = cat.id"
            :class="[
              'px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border',
              selectedCategory === cat.id
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50',
            ]"
          >
            {{ cat.name }}
          </button>
        </div>
      </div>

      <!-- Catalog Loading State -->
      <div v-if="loading" class="text-center py-20 bg-white/50 backdrop-blur-sm rounded-3xl border border-white">
        <div class="inline-block w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p class="text-slate-500 text-sm font-semibold">Memuat katalog peralatan outdoor...</p>
      </div>

      <!-- Catalog Empty State -->
      <div v-else-if="filteredEquipments.length === 0" class="text-center py-16 bg-white rounded-3xl shadow-sm border border-slate-100">
        <Tent :size="48" class="mx-auto text-slate-300 mb-3" />
        <h3 class="text-slate-700 font-bold text-lg">Peralatan Tidak Ditemukan</h3>
        <p class="text-slate-400 text-xs mt-1">Coba kata kunci lain atau ubah filter kategori Anda.</p>
      </div>

      <!-- Catalog Grid -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <div
          v-for="item in filteredEquipments"
          :key="item.id"
          class="bg-white rounded-2xl shadow-md shadow-slate-200/50 hover:shadow-xl hover:shadow-emerald-900/10 border border-slate-100 transition-all duration-300 flex flex-col justify-between overflow-hidden group hover:-translate-y-1"
        >
          <div>
            <!-- Gambar Produk & Badge Kategori -->
            <div class="relative overflow-hidden bg-slate-100 h-48">
              <img
                :src="
                  item.image
                    ? `http://localhost:8000/storage/${item.image}`
                    : 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80'
                "
                :alt="item.name"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span class="absolute top-3 right-3 bg-slate-900/70 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                {{ item.category?.name || 'Outdoor' }}
              </span>
            </div>

            <!-- Detail Info Produk -->
            <div class="p-5">
              <h3 class="font-bold text-slate-800 text-base mb-1 line-clamp-1 group-hover:text-emerald-700 transition-colors">
                {{ item.name }}
              </h3>
              <p class="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed font-medium">
                {{ item.description || 'Peralatan outdoor kualitas terbaik standar pendakian gunung.' }}
              </p>

              <!-- Harga Sewa -->
              <div class="flex items-baseline gap-1 mb-3">
                <span class="text-xs text-slate-400 font-medium">Rp</span>
                <span class="text-emerald-700 font-extrabold text-xl">
                  {{ Number(item.price_per_day).toLocaleString('id-ID') }}
                </span>
                <span class="text-xs text-slate-400 font-medium">/ hari</span>
              </div>

              <!-- Status Stok -->
              <div class="flex items-center text-xs font-semibold">
                <span v-if="item.stock > 0" class="text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg flex items-center gap-1.5 border border-emerald-100">
                  <CheckCircle2 :size="14" /> Stok: {{ item.stock }} unit
                </span>
                <span v-else class="text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg flex items-center gap-1.5 border border-rose-100">
                  <XCircle :size="14" /> Stok Habis
                </span>
              </div>
            </div>
          </div>

          <!-- Action Button -->
          <div class="p-5 pt-0">
            <button
              :disabled="item.stock <= 0"
              @click="alert(`Kamu memilih menyewa: ${item.name}`)"
              class="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all shadow-md shadow-emerald-600/20 hover:shadow-emerald-600/30 active:scale-98 cursor-pointer"
            >
              <ShoppingBag :size="15" />
              {{ item.stock > 0 ? 'Sewa Sekarang' : 'Tidak Tersedia' }}
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

/* Menyembunyikan Scrollbar untuk Filter Kategori */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>