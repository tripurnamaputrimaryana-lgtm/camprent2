<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import API from '../utils/axios';
import Navbar from '../components/navbar.vue';
import Footer from '../components/footer.vue';
import { ShoppingBag, CheckCircle2, XCircle, Search, Filter, ShoppingCart, Eye, X } from 'lucide-vue-next';
import { useCart } from '../utils/cart';

const router = useRouter();
const route = useRoute();
const equipments = ref([]);
const categories = ref([]);
const selectedCategory = ref(route.query.category_id ? String(route.query.category_id) : '');
const searchQuery = ref('');
const loading = ref(true);
const showDetailModal = ref(false);
const selectedEquipment = ref(null);
const { addToCart, cartCount } = useCart();

// Ambil data kategori dan peralatan dari API
const fetchData = async () => {
  try {
    loading.value = true;
    const [equipRes, catRes] = await Promise.all([
      API.get('/equipments'),
      API.get('/categories').catch(() => ({ data: [] })) // Fallback jika endpoint kategori berbeda
    ]);
    
    equipments.value = equipRes.data.data || equipRes.data;
    categories.value = catRes.data.data || catRes.data || [];
  } catch (err) {
    console.error('Gagal memuat data katalog:', err);
  } finally {
    loading.value = false;
  }
};

const getImageUrl = (imagePath) => {
  if (!imagePath) return 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80&fm=webp';
  if (imagePath.startsWith('http')) return imagePath;
  return `http://localhost:8000/storage/${imagePath}`;
};

// Filter produk berdasarkan kategori yang dipilih dan search query
const filteredEquipments = computed(() => {
  return equipments.value.filter(item => {
    const matchesCategory = selectedCategory.value 
      ? (String(item.category_id) === String(selectedCategory.value) || String(item.category?.id) === String(selectedCategory.value) || String(item.category) === String(selectedCategory.value))
      : true;
    
    const itemName = item.name || item.title || '';
    const matchesSearch = itemName.toLowerCase().includes(searchQuery.value.toLowerCase());

    return matchesCategory && matchesSearch;
  });
});

const selectCategory = (catId) => {
  selectedCategory.value = catId;
};

const handleAddToCart = (item) => {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Silakan login atau daftar terlebih dahulu untuk melakukan penyewaan alat!');
    router.push('/login');
    return;
  }
  addToCart(item);
  alert(`${item.name || item.title} ditambahkan ke keranjang.`);
};

const handleRentNow = (item) => {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Silakan login atau daftar terlebih dahulu untuk melakukan penyewaan alat!');
    router.push('/login');
    return;
  }
  router.push({ path: '/rental', query: { equipment_id: item.id } });
};

const openCart = () => router.push('/cart');

const openDetailModal = (item) => {
  selectedEquipment.value = item;
  showDetailModal.value = true;
};

const closeDetailModal = () => {
  showDetailModal.value = false;
  selectedEquipment.value = null;
};

onMounted(() => {
  fetchData();
});
</script>

<template>
  <div class="min-h-screen flex flex-col justify-between bg-[#f4faf6] font-['Plus_Jakarta_Sans',sans-serif]">
    <div>
      <Navbar />

      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <!-- Header Judul & Search Bar -->
        <div class="relative overflow-hidden bg-gradient-to-br from-emerald-100 via-white to-teal-50 rounded-[2rem] border border-emerald-100 p-6 sm:p-8 mb-8 shadow-lg shadow-emerald-900/5">
          <div class="absolute -right-14 -top-20 w-64 h-64 rounded-full bg-emerald-200/40 blur-3xl"></div>
          <div class="relative flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <span class="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">
                <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                CampRent Collection
              </span>
              <h1 class="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-2">Temukan perlengkapanmu.</h1>
              <p class="text-sm text-slate-600 mt-2 max-w-xl">Pilih perlengkapan camping terbaik untuk membuat perjalananmu lebih nyaman dan siap menghadapi alam.</p>
            </div>
          
            <div class="relative z-10 w-full md:w-80 flex gap-2">
            <span class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
              <Search :size="16" />
            </span>
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Cari alat..." 
              class="w-full bg-white/90 border border-emerald-100 rounded-2xl pl-10 pr-4 py-3 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition shadow-sm"
            />
            <button @click="openCart" class="shrink-0 bg-emerald-600 text-white rounded-2xl px-3 flex items-center gap-1.5 text-xs font-bold cursor-pointer" aria-label="Buka keranjang">
              <ShoppingCart :size="16" /> <span>{{ cartCount }}</span>
            </button>
          </div>
          </div>
        </div>

        <!-- LAYOUT UTAMA: KIRI KATEGORI, KANAN FOTO-FOTO PRODUK -->
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          <!-- SEBELAH KIRI: SIDEBAR KATEGORI -->
          <aside class="lg:col-span-1 space-y-4">
            <div class="bg-white rounded-[1.75rem] border border-emerald-100 p-5 shadow-lg shadow-emerald-900/5 sticky top-20 space-y-4">
              <div class="pb-4 border-b border-emerald-100">
                <div class="flex items-center justify-between font-bold text-slate-800 text-sm">
                <div class="flex items-center gap-2">
                  <span class="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Filter :size="16" />
                  </span>
                  <span>Kategori Alat</span>
                </div>
                <span class="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">Filter</span>
                </div>
                <p class="text-[11px] text-slate-500 leading-relaxed mt-3">Temukan perlengkapan sesuai rencana petualanganmu.</p>
              </div>

              <div class="space-y-1.5">
                <!-- Tombol Semua Kategori -->
                <button
                  @click="selectCategory('')"
                  :class="[
                    'w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition cursor-pointer',
                    selectedCategory === '' 
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' 
                      : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                  ]"
                >
                  <span>Semua Kategori</span>
                  <span :class="selectedCategory === '' ? 'bg-white/30' : 'bg-emerald-100'" class="w-1.5 h-1.5 rounded-full"></span>
                </button>

                <!-- Daftar Kategori dari Database -->
                <button
                  v-for="cat in categories"
                  :key="cat.id"
                  @click="selectCategory(cat.id)"
                  :class="[
                    'w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition cursor-pointer truncate',
                    String(selectedCategory) === String(cat.id) 
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' 
                      : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                  ]"
                >
                  <span class="truncate pr-3">{{ cat.name || cat.nama }}</span>
                  <span :class="String(selectedCategory) === String(cat.id) ? 'bg-white/30' : 'bg-emerald-100'" class="w-1.5 h-1.5 rounded-full shrink-0"></span>
                </button>
              </div>
            </div>
          </aside>

          <!-- SEBELAH KANAN: GRID FOTO-FOTO PRODUK -->
          <div class="lg:col-span-3">
            
            <!-- Loading State -->
            <div v-if="loading" class="text-center py-24 bg-white rounded-3xl border border-emerald-100 shadow-sm">
              <div class="inline-block w-9 h-9 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mb-3"></div>
              <p class="text-xs font-semibold text-slate-500">Menyiapkan koleksi perlengkapan...</p>
            </div>

            <!-- Empty State jika produk tidak ditemukan -->
            <div v-else-if="filteredEquipments.length === 0" class="bg-white rounded-3xl border border-emerald-100 p-12 text-center space-y-3 shadow-sm">
              <div class="mx-auto w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Search :size="24" />
              </div>
              <h3 class="text-sm font-black text-slate-800">Koleksi belum ditemukan</h3>
              <p class="text-xs text-slate-500">Coba gunakan kata kunci atau kategori yang berbeda.</p>
              <button @click="selectCategory(''); searchQuery = ''" class="text-xs text-emerald-600 font-bold hover:underline">
                Reset Filter
              </button>
            </div>

            <!-- Grid Produk -->
            <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <div
                v-for="item in filteredEquipments"
                :key="item.id"
                class="bg-white rounded-3xl border border-emerald-100 shadow-sm hover:shadow-xl hover:shadow-emerald-900/10 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden group"
              >
                <div>
                  <!-- Bagian Foto Produk -->
                  <div
                    @click="openDetailModal(item)"
                    class="relative overflow-hidden bg-emerald-50 h-52 cursor-pointer"
                  >
                    <img
                      :src="getImageUrl(item.image || item.gambar)"
                      :alt="item.name || item.title"
                      class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      @error="$event.target.src = 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80&fm=webp'"
                    />
                    <div class="absolute inset-0 bg-gradient-to-t from-emerald-950/35 via-transparent to-transparent pointer-events-none"></div>
                    <span class="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-emerald-800 text-[10px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded-full shadow-sm">
                      CampRent Gear
                    </span>
                    <span class="absolute inset-0 flex items-center justify-center bg-emerald-950/0 group-hover:bg-emerald-950/20 transition-colors">
                      <span class="opacity-0 group-hover:opacity-100 bg-white text-emerald-700 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg transition-opacity">
                        <Eye :size="14" /> Lihat Detail
                      </span>
                    </span>
                  </div>

                  <!-- Informasi Produk -->
                  <div class="p-5 space-y-2.5">
                    <h3 @click="openDetailModal(item)" class="font-bold text-slate-800 text-sm line-clamp-1 cursor-pointer hover:text-emerald-700 transition-colors">
                      {{ item.name || item.title }}
                    </h3>
                    
                    <p class="text-xs text-slate-500 line-clamp-2 leading-relaxed min-h-[2rem]">
                      {{ item.description || '-' }}
                    </p>

                    <div class="flex items-baseline gap-1 pt-1">
                      <span class="text-emerald-700 font-black text-lg tracking-tight">
                        Rp {{ Number(item.price_per_day || item.price || item.harga || 0).toLocaleString('id-ID') }}
                      </span>
                      <span class="text-[11px] text-slate-400 font-medium">/ hari</span>
                    </div>

                    <div class="flex items-center text-xs font-semibold pt-1">
                      <span v-if="(item.stock || item.stok || 0) > 0" class="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg flex items-center gap-1.5 border border-emerald-100 text-[10px]">
                        <CheckCircle2 :size="12" class="text-emerald-600" /> Stok: {{ item.stock || item.stok }}
                      </span>
                      <span v-else class="text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg flex items-center gap-1.5 border border-rose-100 text-[10px]">
                        <XCircle :size="12" class="text-rose-500" /> Habis
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Tombol Sewa Langsung dan Keranjang -->
                <div class="p-5 pt-0">
                  <div v-if="(item.stock || item.stok || 0) > 0" class="grid grid-cols-2 gap-2">
                    <button
                      @click="handleRentNow(item)"
                      class="bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-2xl flex items-center justify-center gap-1.5 text-[11px] font-bold transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
                    >
                      <ShoppingBag :size="14" />
                      <span>Sewa Sekarang</span>
                    </button>
                    <button
                      @click="handleAddToCart(item)"
                      class="bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 py-3 rounded-2xl flex items-center justify-center gap-1.5 text-[11px] font-bold transition-all cursor-pointer"
                    >
                      <ShoppingCart :size="14" />
                      <span>Keranjang</span>
                    </button>
                  </div>
                  <button
                    v-else
                    disabled
                    class="w-full bg-slate-200 text-slate-400 py-3 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold cursor-not-allowed"
                  >
                    <XCircle :size="14" />
                    <span>Tidak Tersedia</span>
                  </button>
                </div>
              </div>
            </div>

          </div>

        </div>

      </main>
    </div>

    <!-- Detail Produk -->
    <div v-if="showDetailModal && selectedEquipment" class="fixed inset-0 z-50 bg-emerald-950/25 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-[2rem] w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-emerald-100 overflow-hidden">
        <div class="relative h-72 bg-emerald-50 flex items-center justify-center p-3">
          <img :src="getImageUrl(selectedEquipment.image || selectedEquipment.gambar)" :alt="selectedEquipment.name || selectedEquipment.title" class="w-full h-full object-contain" />
          <button type="button" @click="closeDetailModal" aria-label="Tutup detail barang" class="absolute right-4 top-4 p-2 rounded-xl bg-white/90 text-slate-600 hover:text-emerald-700 shadow-sm cursor-pointer">
            <X :size="18" />
          </button>
        </div>
        <div class="p-6 space-y-5">
          <div>
            <span class="text-[10px] font-black uppercase tracking-wider text-emerald-700">Detail Peralatan</span>
            <h2 class="text-xl font-black text-slate-900 mt-1">{{ selectedEquipment.name || selectedEquipment.title }}</h2>
            <p class="text-xs text-slate-500 mt-1">{{ selectedEquipment.category?.name || 'Peralatan Outdoor' }}</p>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="bg-emerald-50/70 rounded-xl p-3">
              <span class="block text-[10px] uppercase font-bold text-slate-400">Harga / Hari</span>
              <strong class="block text-emerald-700 mt-1">Rp {{ Number(selectedEquipment.price_per_day || selectedEquipment.price || selectedEquipment.harga || 0).toLocaleString('id-ID') }}</strong>
            </div>
            <div class="bg-emerald-50/70 rounded-xl p-3">
              <span class="block text-[10px] uppercase font-bold text-slate-400">Stok</span>
              <strong class="block text-slate-800 mt-1">{{ selectedEquipment.stock || selectedEquipment.stok || 0 }} unit</strong>
            </div>
          </div>

          <div>
            <h3 class="text-xs font-black uppercase tracking-wider text-emerald-800">Deskripsi</h3>
            <p class="text-sm text-slate-600 leading-relaxed mt-2">{{ selectedEquipment.description || selectedEquipment.deskripsi || 'Tidak ada deskripsi untuk barang ini.' }}</p>
          </div>

          <div class="flex gap-2">
            <button
              v-if="(selectedEquipment.stock || selectedEquipment.stok || 0) > 0"
              type="button"
              @click="handleRentNow(selectedEquipment); closeDetailModal()"
              class="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ShoppingBag :size="14" /> Sewa Sekarang
            </button>
            <button
              v-if="(selectedEquipment.stock || selectedEquipment.stok || 0) > 0"
              type="button"
              @click="handleAddToCart(selectedEquipment); closeDetailModal()"
              class="flex-1 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ShoppingCart :size="14" /> Keranjang
            </button>
          </div>
        </div>
      </div>
    </div>

    <Footer />
  </div>
</template>