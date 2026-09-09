<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { 
  ShoppingBag, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Filter,
  Compass,
  X,
  AlertCircle,
  Tent
} from 'lucide-vue-next';
import API from '../utils/axios';

// Import Komponen Navbar & Footer yang dipisah
import Navbar from '../components/Navbar.vue';
import Footer from '../components/Footer.vue';

const router = useRouter();

const equipments = ref([]);
const categories = ref([]);
const selectedCategory = ref('all');
const searchTerm = ref('');
const loading = ref(true);

// State Modal Transaksi / Rental
const showRentalModal = ref(false);
const selectedEquipment = ref(null);
const isSubmitting = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

const rentalForm = ref({
  start_date: '',
  end_date: '',
  quantity: 1,
  note: ''
});

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

const getImageUrl = (imagePath) => {
  if (!imagePath) return 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80';
  if (imagePath.startsWith('http')) return imagePath;
  return `http://localhost:8000/storage/${imagePath}`;
};

const filteredEquipments = computed(() => {
  return equipments.value.filter((item) => {
    const matchCategory =
      selectedCategory.value === 'all' || item.category_id === Number(selectedCategory.value);
    const itemName = item.name || item.title || '';
    const matchSearch = itemName.toLowerCase().includes(searchTerm.value.toLowerCase());
    return matchCategory && matchSearch;
  });
});

// Hitung Durasi Sewa (Hari)
const totalDays = computed(() => {
  if (!rentalForm.value.start_date || !rentalForm.value.end_date) return 1;
  const start = new Date(rentalForm.value.start_date);
  const end = new Date(rentalForm.value.end_date);
  const diffTime = end - start;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 1;
});

// Hitung Total Biaya Sewa
const totalPrice = computed(() => {
  if (!selectedEquipment.value) return 0;
  const pricePerDay = Number(selectedEquipment.value.price_per_day || selectedEquipment.value.price || selectedEquipment.value.harga || 0);
  const qty = Number(rentalForm.value.quantity || 1);
  return pricePerDay * qty * totalDays.value;
});

// Buka Modal Sewa
const openRentalModal = (item) => {
  selectedEquipment.value = item;
  
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  rentalForm.value = {
    start_date: today.toISOString().split('T')[0],
    end_date: tomorrow.toISOString().split('T')[0],
    quantity: 1,
    note: ''
  };

  errorMessage.value = '';
  successMessage.value = '';
  showRentalModal.value = true;
};

const closeRentalModal = () => {
  showRentalModal.value = false;
  selectedEquipment.value = null;
  errorMessage.value = '';
  successMessage.value = '';
};

// Kirim Transaksi Penyewaan
const handleRentalSubmit = async () => {
  if (!rentalForm.value.start_date || !rentalForm.value.end_date) {
    errorMessage.value = 'Silakan pilih tanggal mulai dan selesai sewa.';
    return;
  }

  if (new Date(rentalForm.value.end_date) <= new Date(rentalForm.value.start_date)) {
    errorMessage.value = 'Tanggal selesai harus setelah tanggal mulai.';
    return;
  }

  isSubmitting.value = true;
  errorMessage.value = '';
  successMessage.value = '';

  const payload = {
    start_date: rentalForm.value.start_date,
    end_date: rentalForm.value.end_date,
    items: [
      {
        equipment_id: Number(selectedEquipment.value.id),
        qty: Number(rentalForm.value.quantity)
      }
    ]
  };

  try {
    await API.post('/rentals', payload);
    successMessage.value = 'Pengajuan sewa berhasil dibuat!';
    
    fetchData();

    setTimeout(() => {
      closeRentalModal();
      router.push('/history');
    }, 1500);
  } catch (err) {
    console.error('Gagal mengajukan sewa:', err.response || err);
    
    if (err.response && err.response.data) {
      if (err.response.data.error) {
        errorMessage.value = err.response.data.error;
      } else if (err.response.data.message) {
        errorMessage.value = err.response.data.message;
      } else {
        errorMessage.value = 'Gagal memproses transaksi.';
      }
    } else {
      errorMessage.value = 'Terjadi kesalahan koneksi ke server.';
    }
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(() => {
  fetchData();
});
</script>

<template>
  <div class="min-h-screen flex flex-col justify-between bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/20 font-['Plus_Jakarta_Sans',sans-serif] text-slate-800 selection:bg-emerald-500 selection:text-white">
    
    <div>
      <!-- Komponen Navbar -->
      <Navbar />

      <!-- Main Content -->
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        <!-- Hero Banner -->
        <div class="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-700 via-teal-600 to-emerald-600 p-6 sm:p-10 text-white shadow-xl shadow-emerald-900/10 border border-emerald-500/20">
          <div class="relative z-10 max-w-xl space-y-3">
            <span class="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full text-xs font-bold text-white shadow-xs">
              <Sparkles :size="14" class="text-amber-300" /> Katalog Resmi Peralatan
            </span>
            <h1 class="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              Sewa Alat Camping Premium untuk Petualanganmu.
            </h1>
            <p class="text-emerald-50 text-xs sm:text-sm font-medium leading-relaxed opacity-90">
              Jaminan peralatan bersih, steril, dan siap pakai untuk kenyamanan eksplorasi alam terbuka kamu.
            </p>
          </div>

          <Tent class="absolute -right-8 -bottom-10 text-white/10 w-80 h-80 pointer-events-none select-none rotate-6" />
        </div>

        <!-- Search & Filter Section -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          
          <!-- Input Search -->
          <div class="relative w-full md:w-80">
            <Search class="absolute left-3.5 top-3 text-slate-400" :size="18" />
            <input
              v-model="searchTerm"
              type="text"
              placeholder="Cari tenda, carrier, matras..."
              class="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none transition shadow-2xs"
            />
          </div>

          <!-- Filter Kategori -->
          <div class="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
            <div class="text-slate-400 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider pr-1 shrink-0">
              <Filter :size="14" class="text-emerald-600" />
            </div>
            <button
              @click="selectedCategory = 'all'"
              :class="[
                'px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border',
                selectedCategory === 'all'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20 font-extrabold'
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
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20 font-extrabold'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50',
              ]"
            >
              {{ cat.name }}
            </button>
          </div>

        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-24 bg-white/60 backdrop-blur-sm rounded-3xl border border-white shadow-2xs">
          <div class="inline-block w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p class="text-slate-500 text-xs font-semibold">Memuat katalog peralatan outdoor...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredEquipments.length === 0" class="text-center py-20 bg-white rounded-3xl shadow-2xs border border-slate-100">
          <Compass :size="48" class="mx-auto text-slate-300 mb-3 animate-pulse" />
          <h3 class="text-slate-700 font-bold text-base">Peralatan Tidak Ditemukan</h3>
          <p class="text-slate-400 text-xs mt-1">Coba kata kunci lain atau ubah filter kategori kamu.</p>
        </div>

        <!-- Catalog Grid -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <div
            v-for="item in filteredEquipments"
            :key="item.id"
            class="bg-white rounded-2xl border border-slate-100 shadow-2xs hover:shadow-xl hover:shadow-emerald-900/5 transition-all duration-300 flex flex-col justify-between overflow-hidden group hover:-translate-y-1.5"
          >
            <div>
              <!-- Gambar Produk -->
              <div class="relative overflow-hidden bg-slate-100 h-48">
                <img
                  :src="getImageUrl(item.image || item.gambar)"
                  :alt="item.name || item.title"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  @error="$event.target.src = 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80'"
                />
                <span class="absolute top-3 right-3 bg-slate-900/70 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-2xs">
                  {{ item.category?.name || 'Outdoor' }}
                </span>
              </div>

              <!-- Detail Produk -->
              <div class="p-5 space-y-2">
                <h3 class="font-bold text-slate-800 text-base line-clamp-1 group-hover:text-emerald-600 transition-colors">
                  {{ item.name || item.title }}
                </h3>
                
                <p class="text-xs text-slate-500 line-clamp-2 leading-relaxed font-normal min-h-[2.5rem]">
                  {{ item.description || 'Peralatan outdoor kualitas standar tinggi untuk pendakian dan aktivitas camping.' }}
                </p>

                <!-- Harga -->
                <div class="flex items-baseline gap-1 pt-1">
                  <span class="text-xs text-slate-400 font-medium">Rp</span>
                  <span class="text-emerald-700 font-black text-xl tracking-tight">
                    {{ Number(item.price_per_day || item.price || item.harga || 0).toLocaleString('id-ID') }}
                  </span>
                  <span class="text-xs text-slate-400 font-medium">/ hari</span>
                </div>

                <!-- Stok -->
                <div class="flex items-center text-xs font-semibold pt-1">
                  <span 
                    v-if="(item.stock || item.stok || 0) > 0" 
                    class="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg flex items-center gap-1.5 border border-emerald-100 text-[11px]"
                  >
                    <CheckCircle2 :size="14" class="text-emerald-600" /> Stok: {{ item.stock || item.stok }} unit
                  </span>
                  <span 
                    v-else 
                    class="text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg flex items-center gap-1.5 border border-rose-100 text-[11px]"
                  >
                    <XCircle :size="14" class="text-rose-500" /> Stok Habis
                  </span>
                </div>
              </div>
            </div>

            <!-- Tombol Sewa -->
            <div class="p-5 pt-0">
              <button
                :disabled="(item.stock || item.stok || 0) <= 0"
                @click="openRentalModal(item)"
                class="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all shadow-md shadow-emerald-600/20 hover:shadow-emerald-600/30 active:scale-98 cursor-pointer"
              >
                <ShoppingBag :size="15" />
                <span>{{ (item.stock || item.stok || 0) > 0 ? 'Sewa Sekarang' : 'Tidak Tersedia' }}</span>
              </button>
            </div>
          </div>
        </div>

      </main>
    </div>

    <!-- Modal Form Pemesanan -->
    <div v-if="showRentalModal" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-slate-100 space-y-5 max-h-[90vh] overflow-y-auto">
        
        <!-- Header Modal -->
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 class="font-black text-slate-800 text-base flex items-center gap-2">
            <ShoppingBag :size="18" class="text-emerald-600" /> Form Penyewaan
          </h3>
          <button @click="closeRentalModal" class="text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-lg hover:bg-slate-100 transition">
            <X :size="20" />
          </button>
        </div>

        <!-- Alert Error & Success -->
        <div v-if="errorMessage" class="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-600 text-xs font-bold">
          <AlertCircle :size="16" class="shrink-0" />
          <span>{{ errorMessage }}</span>
        </div>

        <div v-if="successMessage" class="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-700 text-xs font-bold">
          <CheckCircle2 :size="16" class="shrink-0" />
          <span>{{ successMessage }}</span>
        </div>

        <!-- Produk Terpilih -->
        <div v-if="selectedEquipment" class="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
          <img 
            :src="getImageUrl(selectedEquipment.image || selectedEquipment.gambar)" 
            :alt="selectedEquipment.name || selectedEquipment.title"
            class="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
          />
          <div class="min-w-0 flex-1 space-y-1">
            <span class="text-[10px] font-bold uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
              {{ selectedEquipment.category?.name || 'Outdoor' }}
            </span>
            <h4 class="font-bold text-slate-800 text-sm truncate">{{ selectedEquipment.name || selectedEquipment.title }}</h4>
            <div class="text-xs font-black text-emerald-700">
              Rp {{ Number(selectedEquipment.price_per_day || selectedEquipment.price || selectedEquipment.harga || 0).toLocaleString('id-ID') }} <span class="text-[10px] font-normal text-slate-400">/ hari</span>
            </div>
          </div>
        </div>

        <!-- Form Input -->
        <form @submit.prevent="handleRentalSubmit" class="space-y-4">
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="text-[11px] font-extrabold uppercase text-slate-500 block mb-1">Tanggal Mulai</label>
              <input 
                v-model="rentalForm.start_date" 
                type="date" 
                required 
                class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label class="text-[11px] font-extrabold uppercase text-slate-500 block mb-1">Tanggal Selesai</label>
              <input 
                v-model="rentalForm.end_date" 
                type="date" 
                required 
                class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label class="text-[11px] font-extrabold uppercase text-slate-500 block mb-1">Jumlah Unit</label>
            <input 
              v-model.number="rentalForm.quantity" 
              type="number" 
              min="1" 
              :max="selectedEquipment?.stock || selectedEquipment?.stok || 1" 
              required 
              class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none"
            />
          </div>

          <!-- Total Biaya -->
          <div class="bg-emerald-50/80 p-4 rounded-2xl border border-emerald-100 space-y-1.5">
            <div class="flex justify-between items-center text-xs text-slate-600">
              <span>Durasi Penyewaan</span>
              <span class="font-bold text-slate-800">{{ totalDays }} Hari</span>
            </div>
            <div class="flex justify-between items-center text-xs text-slate-600">
              <span>Jumlah Alat</span>
              <span class="font-bold text-slate-800">{{ rentalForm.quantity }} Unit</span>
            </div>
            <div class="border-t border-emerald-200/60 pt-2 flex justify-between items-center">
              <span class="text-xs font-bold text-emerald-900 uppercase">Total Estimasi Biaya</span>
              <span class="text-base font-black text-emerald-700">Rp {{ totalPrice.toLocaleString('id-ID') }}</span>
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-2">
            <button 
              type="button" 
              @click="closeRentalModal" 
              class="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 transition cursor-pointer"
            >
              Batal
            </button>
            <button 
              type="submit" 
              :disabled="isSubmitting"
              class="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              <span v-if="isSubmitting" class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>Konfirmasi Sewa</span>
            </button>
          </div>

        </form>

      </div>
    </div>

    <!-- Komponen Footer -->
    <Footer />

  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>