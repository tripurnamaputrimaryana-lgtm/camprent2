<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { 
  Menu, 
  ShoppingBag, 
  Calendar, 
  Clock, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Sparkles,
  ArrowLeft
} from 'lucide-vue-next';
import API from '../utils/axios';
import SidebarAdmin from '../components/SidebarAdmin.vue';

const router = useRouter();
const route = useRoute();

// State Sidebar & User
const isSidebarOpen = ref(false);
const adminUser = ref(JSON.parse(localStorage.getItem('user') || '{}'));

// State Form Rental
const equipments = ref([]);
const selectedEquipmentId = ref(route.query.equipment_id || '');
const startDate = ref('');
const endDate = ref('');
const quantity = ref(1);
const note = ref('');

// State Loading & Alert
const loading = ref(true);
const submitting = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

// Ambil daftar alat camping
const fetchData = async () => {
  loading.value = true;
  try {
    const res = await API.get('/equipments');
    equipments.value = res.data.data || res.data;

    if (!selectedEquipmentId.value && equipments.value.length > 0) {
      selectedEquipmentId.value = equipments.value[0].id;
    }
  } catch (err) {
    console.error('Gagal mengambil data peralatan:', err);
    errorMessage.value = 'Gagal memuat daftar peralatan.';
  } finally {
    loading.value = false;
  }
};

// Ambil detail peralatan yang dipilih
const selectedEquipment = computed(() => {
  return equipments.value.find((item) => item.id === Number(selectedEquipmentId.value)) || null;
});

// Hitung durasi sewa (hari)
const rentalDays = computed(() => {
  if (!startDate.value || !endDate.value) return 0;
  const start = new Date(startDate.value);
  const end = new Date(endDate.value);
  const diffTime = end - start;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
});

// Hitung total harga
const totalPrice = computed(() => {
  if (!selectedEquipment.value || rentalDays.value <= 0) return 0;
  const pricePerDay = Number(selectedEquipment.value.price_per_day || selectedEquipment.value.price || selectedEquipment.value.harga || 0);
  return pricePerDay * rentalDays.value * quantity.value;
});

const getImageUrl = (imagePath) => {
  if (!imagePath) return 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80';
  if (imagePath.startsWith('http')) return imagePath;
  return `http://localhost:8000/storage/${imagePath}`;
};

// Submit Formulir Rental
const handleSubmitRental = async () => {
  errorMessage.value = '';
  successMessage.value = '';

  if (!selectedEquipmentId.value) {
    errorMessage.value = 'Pilih peralatan yang ingin disewa.';
    return;
  }
  if (!startDate.value || !endDate.value) {
    errorMessage.value = 'Tentukan tanggal mulai dan selesai sewa.';
    return;
  }
  if (rentalDays.value <= 0) {
    errorMessage.value = 'Tanggal selesai harus lebih besar dari tanggal mulai.';
    return;
  }
  if (quantity.value < 1) {
    errorMessage.value = 'Jumlah unit minimal 1.';
    return;
  }

  submitting.value = true;
  try {
    const payload = {
      equipment_id: selectedEquipmentId.value,
      start_date: startDate.value,
      end_date: endDate.value,
      quantity: quantity.value,
      total_price: totalPrice.value,
      note: note.value,
    };

    await API.post('/rentals', payload);
    successMessage.value = 'Pengajuan sewa berhasil dibuat!';

    setTimeout(() => {
      router.push('/catalog');
    }, 1500);
  } catch (err) {
    console.error('Gagal membuat transaksi:', err);
    errorMessage.value = err.response?.data?.message || 'Terjadi kesalahan saat membuat transaksi.';
  } finally {
    submitting.value = false;
  }
};

const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  router.push('/login');
};

onMounted(() => {
  fetchData();
});
</script>

<template>
  <div class="flex min-h-screen bg-slate-50 font-['Plus_Jakarta_Sans',sans-serif] text-slate-800">
    
    <!-- Sidebar Admin -->
    <SidebarAdmin 
      :is-open="isSidebarOpen" 
      :admin-user="adminUser"
      @close="isSidebarOpen = false" 
      @logout="handleLogout" 
    />

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-w-0">
      
      <!-- Topbar Header Mobile & Quick Action -->
      <header class="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <button 
            @click="isSidebarOpen = true" 
            class="lg:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
          >
            <Menu :size="20" />
          </button>
          <h1 class="text-lg font-bold text-slate-800 tracking-tight">Formulir Penyewaan</h1>
        </div>

        <button 
          @click="router.push('/catalog')" 
          class="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
        >
          <ArrowLeft :size="15" /> Ke Katalog
        </button>
      </header>

      <!-- Content Container -->
      <main class="p-4 sm:p-8 max-w-6xl mx-auto w-full space-y-6">
        
        <!-- Header Title -->
        <div class="space-y-1">
          <span class="inline-flex items-center gap-1.5 bg-emerald-100/80 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold">
            <Sparkles :size="14" class="text-emerald-600" /> Transaksi Sewa
          </span>
          <h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Sewa Peralatan Outdoor
          </h2>
          <p class="text-xs sm:text-sm text-slate-500 font-medium">
            Pilih unit, tanggal rental, dan sistem akan mengkalkulasi harga sewa secara langsung.
          </p>
        </div>

        <!-- Alert Notification -->
        <div v-if="errorMessage" class="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-bold flex items-center gap-2">
          <AlertCircle :size="18" /> {{ errorMessage }}
        </div>

        <div v-if="successMessage" class="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 :size="18" /> {{ successMessage }}
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-2xs">
          <div class="inline-block w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p class="text-slate-500 text-xs font-semibold">Menyiapkan data alat camping...</p>
        </div>

        <!-- Form & Summary -->
        <div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          <!-- Form Left -->
          <div class="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-2xs space-y-5">
            
            <!-- Select Equipment -->
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Peralatan Camping
              </label>
              <select
                v-model="selectedEquipmentId"
                class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none transition"
              >
                <option disabled value="">-- Pilih Alat --</option>
                <option
                  v-for="item in equipments"
                  :key="item.id"
                  :value="item.id"
                  :disabled="(item.stock || item.stok || 0) <= 0"
                >
                  {{ item.name || item.title }} - Rp {{ Number(item.price_per_day || item.price || item.harga || 0).toLocaleString('id-ID') }}/hari (Stok: {{ item.stock || item.stok || 0 }})
                </option>
              </select>
            </div>

            <!-- Date Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Tanggal Mulai
                </label>
                <input
                  v-model="startDate"
                  type="date"
                  class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none transition"
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Tanggal Selesai
                </label>
                <input
                  v-model="endDate"
                  type="date"
                  class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none transition"
                />
              </div>
            </div>

            <!-- Unit Quantity -->
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Jumlah Unit
              </label>
              <div class="flex items-center gap-3">
                <button
                  type="button"
                  @click="quantity > 1 ? quantity-- : null"
                  class="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 font-black text-slate-700 transition cursor-pointer"
                >
                  -
                </button>
                <input
                  v-model.number="quantity"
                  type="number"
                  min="1"
                  :max="selectedEquipment?.stock || 10"
                  class="w-20 text-center py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none"
                />
                <button
                  type="button"
                  @click="quantity < (selectedEquipment?.stock || 99) ? quantity++ : null"
                  class="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 font-black text-slate-700 transition cursor-pointer"
                >
                  +
                </button>
                <span class="text-xs text-slate-400 font-medium">
                  Tersedia {{ selectedEquipment?.stock || 0 }} unit
                </span>
              </div>
            </div>

            <!-- Notes -->
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Catatan Tambahan
              </label>
              <textarea
                v-model="note"
                rows="3"
                placeholder="Catatan pengerjaan atau instruksi khusus..."
                class="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none transition"
              ></textarea>
            </div>

          </div>

          <!-- Summary Right -->
          <div class="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-2xs space-y-5">
            <h3 class="font-extrabold text-slate-900 text-base border-b border-slate-100 pb-3 flex items-center gap-2">
              <FileText :size="18" class="text-emerald-600" /> Ringkasan Transaksi
            </h3>

            <!-- Item Card Preview -->
            <div v-if="selectedEquipment" class="flex gap-3.5 items-center bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <img
                :src="getImageUrl(selectedEquipment.image || selectedEquipment.gambar)"
                :alt="selectedEquipment.name"
                class="w-14 h-14 rounded-xl object-cover bg-slate-200 shrink-0"
              />
              <div class="space-y-0.5">
                <h4 class="font-bold text-slate-800 text-xs line-clamp-1">
                  {{ selectedEquipment.name || selectedEquipment.title }}
                </h4>
                <p class="text-xs text-emerald-700 font-black">
                  Rp {{ Number(selectedEquipment.price_per_day || selectedEquipment.price || 0).toLocaleString('id-ID') }}
                  <span class="text-slate-400 font-normal">/ hari</span>
                </p>
              </div>
            </div>

            <!-- Fee Calculation -->
            <div class="space-y-2.5 text-xs font-medium border-b border-slate-100 pb-4">
              <div class="flex justify-between text-slate-500">
                <span>Durasi Sewa</span>
                <span class="font-bold text-slate-800 flex items-center gap-1">
                  <Clock :size="13" class="text-emerald-600" /> {{ rentalDays }} Hari
                </span>
              </div>

              <div class="flex justify-between text-slate-500">
                <span>Jumlah Unit</span>
                <span class="font-bold text-slate-800">{{ quantity }} Unit</span>
              </div>
            </div>

            <!-- Total Output -->
            <div class="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-100 space-y-1">
              <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Total Biaya</span>
              <div class="text-2xl font-black text-emerald-700 tracking-tight">
                Rp {{ totalPrice.toLocaleString('id-ID') }}
              </div>
            </div>

            <!-- Submit Button -->
            <button
              @click="handleSubmitRental"
              :disabled="submitting || rentalDays <= 0 || !selectedEquipment"
              class="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition shadow-md shadow-emerald-600/20 active:scale-98 cursor-pointer"
            >
              <CreditCard :size="15" />
              <span>{{ submitting ? 'Memproses...' : 'Proses & Simpan Transaksi' }}</span>
            </button>
          </div>

        </div>

      </main>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
</style>