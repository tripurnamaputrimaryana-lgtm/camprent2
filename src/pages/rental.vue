<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Sparkles,
  ArrowLeft,
  ShieldCheck,
  Check,
  PackageCheck
} from 'lucide-vue-next';
import API from '../utils/axios';
import Navbar from '../components/navbar.vue';
import Footer from '../components/footer.vue';
import { useCart } from '../utils/cart';
import { addAdminNotification } from '../utils/notifications';

const router = useRouter();
const route = useRoute();

// State Form Rental
const equipments = ref([]);
const selectedEquipmentId = ref(route.query.equipment_id || '');
const isEquipmentLocked = computed(() => Boolean(route.query.equipment_id));
const startDate = ref('');
const endDate = ref('');
const quantity = ref(1);
const note = ref('');
const { cartItems, clearCart } = useCart();
const isCartRental = computed(() => !route.query.equipment_id && cartItems.value.length > 0);
const rentalItemCount = computed(() => isCartRental.value
  ? cartItems.value.reduce((total, item) => total + item.quantity, 0)
  : quantity.value);

// State Loading & Alert
const loading = ref(true);
const submitting = ref(false);
const errorMessage = ref('');
const successMessage = ref('');
const midtransTokenEndpoint = import.meta.env.VITE_MIDTRANS_TOKEN_ENDPOINT || '/payments/midtrans/token';

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
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays > 0 ? diffDays : 0;
});

// Hitung total harga
const totalPrice = computed(() => {
  if (rentalDays.value <= 0) return 0;
  if (isCartRental.value) {
    return cartItems.value.reduce((total, item) => total + item.price * item.quantity, 0) * rentalDays.value;
  }
  if (!selectedEquipment.value) return 0;
  const pricePerDay = Number(selectedEquipment.value.price_per_day || selectedEquipment.value.price || selectedEquipment.value.harga || 0);
  return pricePerDay * rentalDays.value * quantity.value;
});

const getImageUrl = (imagePath) => {
  if (!imagePath) return 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80&fm=webp';
  if (imagePath.startsWith('http')) return imagePath;
  return `http://localhost:8000/storage/${imagePath}`;
};

const handleBackToCatalog = () => {
  const shouldLeave = window.confirm('Apakah kamu yakin ingin meninggalkan halaman checkout? Data checkout yang sedang diisi akan hilang.');
  if (shouldLeave) {
    router.push('/catalog');
  }
};

const payWithMidtrans = async (rental) => {
  if (!window.snap || typeof window.snap.pay !== 'function') {
    throw new Error('Midtrans Snap belum siap. Muat ulang halaman lalu coba lagi.');
  }

  const response = await API.post(midtransTokenEndpoint, {
    rental_id: rental.id,
    amount: Number(rental.total_price || totalPrice.value || 0)
  });
  const responseData = response.data?.data || response.data;
  const snapToken = responseData?.snap_token || responseData?.token;

  if (!snapToken) {
    throw new Error('Token pembayaran Midtrans tidak diterima dari server.');
  }

  window.snap.pay(snapToken, {
    onSuccess: async () => {
      try {
        await API.put(`/rentals/${rental.id}/status`, {
          payment_status: 'paid',
          rental_status: 'ready_for_pickup'
        });
        successMessage.value = 'Pembayaran berhasil. Status transaksi: Lunas.';
      } catch (err) {
        successMessage.value = 'Pembayaran berhasil diproses oleh Midtrans.';
      }
      submitting.value = false;
      router.push('/history');
    },
    onPending: () => {
      successMessage.value = 'Pembayaran sedang diproses oleh Midtrans.';
      submitting.value = false;
    },
    onError: () => {
      errorMessage.value = 'Pembayaran gagal. Silakan coba lagi dari riwayat sewa.';
      submitting.value = false;
    },
    onClose: () => {
      submitting.value = false;
    }
  });
};

// Submit Formulir Rental
const handleSubmitRental = async () => {
  errorMessage.value = '';
  successMessage.value = '';

  if (!selectedEquipmentId.value && cartItems.value.length === 0) {
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
    const items = isCartRental.value
      ? cartItems.value.map((item) => ({ equipment_id: Number(item.id), qty: Number(item.quantity) }))
      : [{ equipment_id: Number(selectedEquipmentId.value), qty: Number(quantity.value) }];
    const payload = {
      items,
      equipment_id: selectedEquipmentId.value,
      start_date: startDate.value,
      end_date: endDate.value,
      quantity: quantity.value,
      total_price: totalPrice.value,
      note: note.value,
    };

    const rentalResponse = await API.post('/rentals', payload);
    const rental = rentalResponse.data?.rental
      || rentalResponse.data?.data?.rental
      || rentalResponse.data?.data
      || rentalResponse.data;

    if (!rental?.id) {
      throw new Error('ID transaksi rental tidak diterima dari server.');
    }

    addAdminNotification({
      title: 'Transaksi baru',
      message: `Ada pesanan baru untuk ${selectedEquipment.value?.name || 'alat'} dengan total Rp ${Number(totalPrice.value).toLocaleString('id-ID')}.`,
      type: 'info'
    });
    clearCart();
    await payWithMidtrans({ ...rental, total_price: rental.total_price || totalPrice.value });
  } catch (err) {
    console.error('Gagal membuat transaksi:', err);
    errorMessage.value = err.response?.data?.message || 'Terjadi kesalahan saat membuat transaksi.';
  } finally {
    submitting.value = false;
  }
};

onMounted(() => {
  fetchData();
});
</script>

<template>
  <div class="min-h-screen flex flex-col bg-[#f4faf6] font-['Plus_Jakarta_Sans',sans-serif] text-slate-800">
    <Navbar />

    <main class="flex-1 flex flex-col min-w-0">
      
      <header class="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-teal-50 border-b border-emerald-100 text-slate-800">
        <div class="absolute -right-16 -top-20 w-72 h-72 rounded-full bg-emerald-200/50 blur-3xl"></div>
        <div class="absolute left-1/3 -bottom-24 w-64 h-64 rounded-full bg-teal-100/70 blur-3xl"></div>
        <div class="relative max-w-6xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
          <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-7">
            <div class="max-w-2xl space-y-3">
              <div class="inline-flex items-center gap-2 text-emerald-700 text-[10px] font-black uppercase tracking-[0.2em]">
                <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                Checkout Rental
              </div>
              <h1 class="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">Siapkan petualanganmu.</h1>
              <p class="text-sm text-slate-600 leading-relaxed max-w-xl">Atur jadwal sewa dan periksa kembali perlengkapanmu sebelum pesanan dikirim.</p>
            </div>

            <button 
              @click="handleBackToCatalog" 
              class="self-start sm:self-auto bg-white hover:bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-sm"
            >
              <ArrowLeft :size="15" /> Kembali ke katalog
            </button>
          </div>

          <div class="flex items-center gap-2 mt-8 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <span class="flex items-center gap-1.5 text-emerald-700"><span class="flex w-5 h-5 items-center justify-center rounded-full bg-emerald-600 text-white"><Check :size="12" /></span> Pilih alat</span>
            <span class="w-8 h-px bg-emerald-200"></span>
            <span class="flex items-center gap-1.5 text-emerald-800"><span class="flex w-5 h-5 items-center justify-center rounded-full border-2 border-emerald-500 text-emerald-700">2</span> Atur sewa</span>
            <span class="w-8 h-px bg-emerald-200"></span>
            <span>Konfirmasi</span>
          </div>
        </div>
      </header>

      <!-- Content Container -->
      <div class="p-4 sm:p-8 max-w-6xl mx-auto w-full space-y-6">
        
        <!-- Header Title -->
        <div class="flex items-end justify-between gap-4">
          <div class="space-y-1">
          <span class="inline-flex items-center gap-1.5 text-emerald-700 text-[10px] font-black uppercase tracking-[0.18em]">
            <Sparkles :size="14" class="text-emerald-600" /> Detail Pesanan
          </span>
          <h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Atur detail sewa</h2>
          <p class="text-sm text-slate-500">Tanggal yang sama akan diterapkan ke semua perlengkapan di keranjang.</p>
          </div>
          <div class="hidden sm:flex items-center gap-2 bg-white border border-emerald-100 rounded-xl px-3 py-2 text-xs font-bold text-emerald-700 shadow-sm">
            <PackageCheck :size="16" /> {{ rentalItemCount }} unit
          </div>
        </div>

        <!-- Alert Notification -->
        <div v-if="errorMessage" class="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-bold flex items-center gap-2">
          <AlertCircle :size="18" /> {{ errorMessage }}
        </div>

        <div v-if="successMessage" class="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 :size="18" /> {{ successMessage }}
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-20 bg-white rounded-3xl border border-emerald-100 shadow-[0_15px_40px_-28px_rgba(16,185,129,0.6)]">
          <div class="inline-block w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p class="text-slate-500 text-xs font-semibold">Menyiapkan data alat camping...</p>
        </div>

        <!-- Form & Summary -->
        <div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          <!-- Form Left -->
          <div class="lg:col-span-7 bg-white p-6 sm:p-8 rounded-[1.75rem] border border-emerald-100 shadow-[0_18px_50px_-30px_rgba(16,185,129,0.35)] space-y-6">
            
            <!-- Daftar Equipment -->
            <div v-if="isCartRental">
              <label class="block text-xs font-bold text-emerald-900 uppercase tracking-wider mb-2">Perlengkapan yang Disewa</label>
              <div class="space-y-2">
                <div v-for="item in cartItems" :key="item.id" class="flex justify-between items-center bg-emerald-50/60 border border-emerald-100 rounded-xl px-3 py-2.5 text-xs">
                  <span class="font-bold text-slate-700">{{ item.name }} <span class="text-emerald-700">x{{ item.quantity }}</span></span>
                  <span class="font-black text-emerald-700">Rp {{ (item.price * item.quantity).toLocaleString('id-ID') }}</span>
                </div>
              </div>
            </div>
            <div v-else>
              <label class="block text-xs font-bold text-emerald-900 uppercase tracking-wider mb-2">
                Peralatan Camping
              </label>
              <select
                v-model="selectedEquipmentId"
                :disabled="isEquipmentLocked"
                :class="[
                  'w-full px-4 py-3 border border-emerald-100 rounded-xl text-xs font-semibold text-slate-700 outline-none transition',
                  isEquipmentLocked
                    ? 'bg-emerald-50/80 cursor-not-allowed opacity-90'
                    : 'bg-emerald-50/50 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:bg-white'
                ]"
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
                <label class="block text-xs font-bold text-emerald-900 uppercase tracking-wider mb-2">
                  Tanggal Mulai
                </label>
                <input
                  v-model="startDate"
                  type="date"
                  class="w-full px-4 py-2.5 bg-emerald-50/50 border border-emerald-100 rounded-xl text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:bg-white outline-none transition"
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-emerald-900 uppercase tracking-wider mb-2">
                  Tanggal Selesai
                </label>
                <input
                  v-model="endDate"
                  type="date"
                  class="w-full px-4 py-2.5 bg-emerald-50/50 border border-emerald-100 rounded-xl text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:bg-white outline-none transition"
                />
              </div>
            </div>

            <!-- Unit Quantity -->
            <div v-if="!isCartRental">
              <label class="block text-xs font-bold text-emerald-900 uppercase tracking-wider mb-2">
                Jumlah Unit
              </label>
              <div class="flex items-center gap-3">
                <button
                  type="button"
                  @click="quantity > 1 ? quantity-- : null"
                  class="w-10 h-10 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 font-black text-emerald-700 transition cursor-pointer"
                >
                  -
                </button>
                <input
                  v-model.number="quantity"
                  type="number"
                  min="1"
                  :max="selectedEquipment?.stock || 10"
                  class="w-20 text-center py-2 bg-emerald-50/50 border border-emerald-100 rounded-xl text-sm font-bold text-emerald-800 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/30"
                />
                <button
                  type="button"
                  @click="quantity < (selectedEquipment?.stock || 99) ? quantity++ : null"
                  class="w-10 h-10 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 font-black text-emerald-700 transition cursor-pointer"
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
              <label class="block text-xs font-bold text-emerald-900 uppercase tracking-wider mb-2">
                Catatan Tambahan
              </label>
              <textarea
                v-model="note"
                rows="3"
                placeholder="Catatan pengerjaan atau instruksi khusus..."
                class="w-full p-3.5 bg-emerald-50/50 border border-emerald-100 rounded-xl text-xs font-medium text-slate-700 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:bg-white outline-none transition"
              ></textarea>
            </div>

          </div>

          <!-- Summary Right -->
          <div class="lg:col-span-5 bg-white p-6 sm:p-8 rounded-[1.75rem] border border-emerald-100 shadow-[0_18px_50px_-30px_rgba(16,185,129,0.45)] space-y-5 lg:sticky lg:top-6">
            <h3 class="font-extrabold text-emerald-950 text-base border-b border-emerald-100 pb-3 flex items-center gap-2">
              <FileText :size="18" class="text-emerald-600" /> Ringkasan Transaksi
            </h3>

            <!-- Item Card Preview -->
            <div v-if="isCartRental" class="space-y-2">
              <div v-for="item in cartItems" :key="item.id" class="flex gap-3.5 items-center bg-emerald-50/70 p-3 rounded-2xl border border-emerald-100">
                <img :src="getImageUrl(item.image)" :alt="item.name" class="w-14 h-14 rounded-xl object-cover bg-emerald-100 shrink-0" />
                <div class="space-y-0.5 min-w-0">
                  <h4 class="font-bold text-slate-800 text-xs truncate">{{ item.name }} x{{ item.quantity }}</h4>
                  <p class="text-xs text-emerald-700 font-black">Rp {{ (item.price * item.quantity).toLocaleString('id-ID') }}</p>
                </div>
              </div>
            </div>
            <div v-else-if="selectedEquipment" class="flex gap-3.5 items-center bg-emerald-50/70 p-3 rounded-2xl border border-emerald-100">
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
            <div class="space-y-2.5 text-xs font-medium border-b border-emerald-100 pb-4">
              <div class="flex justify-between text-slate-500">
                <span>Durasi sewa</span>
                <span class="font-bold text-slate-800 flex items-center gap-1">
                  <Clock :size="13" class="text-emerald-600" /> {{ rentalDays }} Hari
                </span>
              </div>

              <div class="flex justify-between text-slate-500">
                <span>Total unit</span>
                <span class="font-bold text-slate-800">{{ isCartRental ? cartItems.reduce((sum, item) => sum + item.quantity, 0) : quantity }} Unit</span>
              </div>
            </div>

            <!-- Total Output -->
            <div class="bg-gradient-to-br from-emerald-100 to-teal-100 p-4 rounded-2xl border border-emerald-200 space-y-1 text-emerald-950">
              <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-800/70">Estimasi total biaya</span>
              <div class="text-2xl font-black text-emerald-900 tracking-tight">
                Rp {{ totalPrice.toLocaleString('id-ID') }}
              </div>
            </div>

            <!-- Submit Button -->
            <button
              @click="handleSubmitRental"
              :disabled="submitting || rentalDays <= 0 || (!selectedEquipment && !isCartRental)"
              class="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white py-3.5 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition shadow-lg shadow-emerald-600/20 active:scale-98 cursor-pointer"
            >
              <ShieldCheck :size="15" />
              <span>{{ submitting ? 'Menyiapkan pembayaran...' : 'Bayar dengan Midtrans' }}</span>
            </button>
          </div>

        </div>

      </div>
    </main>
    <Footer />
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
</style>