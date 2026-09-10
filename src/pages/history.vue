<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { 
  History, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Upload, 
  FileText, 
  Calendar,
  CreditCard,
  X,
  AlertCircle,
  ShoppingBag,
  Building2,
  Copy,
  QrCode
} from 'lucide-vue-next';
import API from '../utils/axios';

// Import Navbar & Footer
import Navbar from '../components/navbar.vue';
import Footer from '../components/footer.vue';

const router = useRouter();
const rentals = ref([]);
const loading = ref(true);

// State Modal Pembayaran & Upload
const showPaymentModal = ref(false);
const selectedRental = ref(null);
const fileProof = ref(null);
const isSubmitting = ref(false);
const errorMessage = ref('');
const successMessage = ref('');
const copiedText = ref(false);

// Info Rekening Pembayaran
const paymentInfo = ref([
  { bank: 'BCA', number: '1234567890', name: 'Outdoor Gear Rent' },
  { bank: 'Mandiri', number: '0987654321', name: 'Outdoor Gear Rent' },
  { bank: 'Gopay / OVO', number: '081234567890', name: 'Outdoor Gear' }
]);

// Fetch Data Riwayat Transaksi
const fetchHistory = async () => {
  loading.value = true;
  try {
    const res = await API.get('/rentals');
    rentals.value = res.data.data || res.data;
  } catch (err) {
    console.error('Gagal mengambil riwayat transaksi:', err);
  } finally {
    loading.value = false;
  }
};

const getImageUrl = (imagePath) => {
  if (!imagePath) return 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80';
  if (imagePath.startsWith('http')) return imagePath;
  return `http://localhost:8000/storage/${imagePath}`;
};

// Buka Modal Pembayaran & Upload
const openPaymentModal = (rental) => {
  selectedRental.value = rental;
  fileProof.value = null;
  errorMessage.value = '';
  successMessage.value = '';
  showPaymentModal.value = true;
};

const closePaymentModal = () => {
  showPaymentModal.value = false;
  selectedRental.value = null;
  fileProof.value = null;
};

// Copy No Rekening ke Clipboard
const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text);
  copiedText.value = true;
  setTimeout(() => {
    copiedText.value = false;
  }, 2000);
};

const handleFileChange = (e) => {
  fileProof.value = e.target.files[0];
};

// Submit Bukti Pembayaran (Diarahkan ke /payments sesuai PaymentController)
const handleUploadSubmit = async () => {
  if (!fileProof.value) {
    errorMessage.value = 'Silakan pilih file bukti pembayaran terlebih dahulu.';
    return;
  }

  isSubmitting.value = true;
  errorMessage.value = '';
  successMessage.value = '';

  const formData = new FormData();
  formData.append('rental_id', selectedRental.value.id);
  formData.append('payment_method', 'Transfer Bank');
  formData.append('amount', selectedRental.value.total_price);
  formData.append('payment_proof', fileProof.value);

  try {
    // Menggunakan endpoint /payments yang ditangani oleh PaymentController
    await API.post('/payments', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    successMessage.value = 'Bukti pembayaran berhasil dikirim! Menunggu konfirmasi admin.';
    fetchHistory();

    setTimeout(() => {
      closePaymentModal();
    }, 1800);
  } catch (err) {
    console.error('Gagal unggah bukti pembayaran:', err);
    errorMessage.value = err.response?.data?.message || 'Gagal mengunggah bukti pembayaran.';
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(() => {
  fetchHistory();
});
</script>

<template>
  <div class="min-h-screen flex flex-col justify-between bg-[#f4faf6] font-['Plus_Jakarta_Sans',sans-serif] text-slate-800">
    
    <div>
      <Navbar />

      <main class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        <!-- Header Page -->
        <div class="relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-5 bg-gradient-to-br from-emerald-100 via-white to-teal-50 p-6 sm:p-8 rounded-[2rem] border border-emerald-100 shadow-lg shadow-emerald-900/5">
          <div class="absolute -right-12 -top-16 w-56 h-56 rounded-full bg-emerald-200/40 blur-3xl"></div>
          <div class="flex items-center gap-3">
            <div class="relative bg-emerald-600 p-3 rounded-2xl text-white shadow-md shadow-emerald-600/20">
              <History :size="24" />
            </div>
            <div class="relative">
              <span class="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">Aktivitas Akun</span>
              <h1 class="text-xl sm:text-2xl font-black text-slate-900">Riwayat Penyewaan</h1>
              <p class="text-xs text-slate-500">Lakukan pembayaran dan unggah bukti transfer di sini.</p>
            </div>
          </div>
          <router-link to="/catalog" class="relative self-start sm:self-auto px-4 py-2.5 rounded-xl bg-white text-emerald-700 text-xs font-bold border border-emerald-100 hover:bg-emerald-50 transition shadow-sm">
            + Sewa Alat Lagi
          </router-link>
        </div>

        <div v-if="!loading && rentals.length" class="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div class="bg-white rounded-2xl border border-emerald-100 px-4 py-3 shadow-sm">
            <span class="block text-[10px] uppercase tracking-wider font-bold text-slate-400">Total Pesanan</span>
            <strong class="block text-xl font-black text-emerald-700 mt-1">{{ rentals.length }}</strong>
          </div>
          <div class="bg-white rounded-2xl border border-emerald-100 px-4 py-3 shadow-sm">
            <span class="block text-[10px] uppercase tracking-wider font-bold text-slate-400">Status</span>
            <strong class="block text-sm font-black text-slate-800 mt-2">Pantau di sini</strong>
          </div>
          <div class="hidden sm:block bg-white rounded-2xl border border-emerald-100 px-4 py-3 shadow-sm">
            <span class="block text-[10px] uppercase tracking-wider font-bold text-slate-400">Bantuan</span>
            <strong class="block text-sm font-black text-slate-800 mt-2">Siap berpetualang</strong>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-20 bg-white rounded-3xl border border-emerald-100 shadow-sm">
          <div class="inline-block w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p class="text-slate-500 text-xs font-semibold">Memuat riwayat transaksi...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="rentals.length === 0" class="text-center py-20 bg-white rounded-3xl shadow-sm border border-emerald-100 space-y-3">
          <div class="mx-auto w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShoppingBag :size="28" />
          </div>
          <h3 class="text-slate-700 font-bold text-base">Belum Ada Transaksi</h3>
          <p class="text-slate-400 text-xs">Kamu belum memiliki riwayat pesanan.</p>
          <router-link to="/catalog" class="inline-block px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-md shadow-emerald-600/20">
            Jelajahi Katalog
          </router-link>
        </div>

        <!-- Daftar Transaksi -->
        <div v-else class="space-y-4">
          <div 
            v-for="item in rentals" 
            :key="item.id" 
            class="relative bg-white rounded-3xl border border-emerald-100 p-5 sm:p-6 shadow-sm space-y-4 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-900/5 transition-all overflow-hidden"
          >
            <div class="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-400 to-teal-300"></div>
            <!-- Header Transaksi -->
            <div class="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-100 pb-4">
              <div class="flex items-center gap-2">
                <span class="text-xs font-black text-emerald-800 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">
                  {{ item.rental_code }}
                </span>
                <span class="text-xs text-slate-500 flex items-center gap-1">
                  <Calendar :size="13" /> {{ item.start_date }} s/d {{ item.end_date }}
                </span>
              </div>

              <!-- Status Transaksi -->
              <div class="flex items-center gap-2">
                <span :class="[
                  'text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider',
                  item.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                ]">
                  {{ item.payment_status === 'paid' ? 'Lunas' : 'Belum Bayar' }}
                </span>
                <span class="text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider bg-teal-50 text-teal-700 border border-teal-100">
                  {{ item.rental_status }}
                </span>
              </div>
            </div>

            <!-- Item Alat yang Disewa -->
            <div class="space-y-3">
              <div 
                v-for="subItem in (item.rental_items || item.items || [])" 
                :key="subItem.id" 
                class="flex items-center gap-4 bg-emerald-50/40 rounded-2xl p-3 border border-emerald-50"
              >
                <img 
                  :src="getImageUrl(subItem.equipment?.image || subItem.equipment?.gambar)" 
                  class="w-16 h-16 rounded-2xl object-cover border border-emerald-100 shrink-0"
                />
                <div class="flex-1 min-w-0">
                  <h4 class="font-bold text-slate-800 text-xs truncate">{{ subItem.equipment?.name || 'Peralatan Outdoor' }}</h4>
                  <p class="text-[11px] text-slate-400">{{ subItem.qty }} Unit x Rp {{ Number(subItem.subtotal / subItem.qty || 0).toLocaleString('id-ID') }}</p>
                </div>
                <div class="text-xs font-bold text-slate-700">
                  Rp {{ Number(subItem.subtotal || 0).toLocaleString('id-ID') }}
                </div>
              </div>
            </div>

            <!-- Footer Transaksi -->
            <div class="border-t border-emerald-100 pt-4 flex items-center justify-between">
              <div>
                <span class="text-[10px] text-slate-400 uppercase font-bold block">Total Tagihan</span>
                <span class="text-base font-black text-emerald-700">Rp {{ Number(item.total_price || 0).toLocaleString('id-ID') }}</span>
              </div>

              <!-- Tombol Bayar / Unggah Bukti -->
              <button 
                v-if="item.payment_status !== 'paid'"
                @click="openPaymentModal(item)"
                class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-md shadow-emerald-600/20 cursor-pointer"
              >
                <CreditCard :size="14" />
                <span>Bayar & Upload Bukti</span>
              </button>
            </div>

          </div>
        </div>

      </main>
    </div>

    <!-- MODAL INTRUKSI PEMBAYARAN & UPLOAD -->
    <div v-if="showPaymentModal" class="fixed inset-0 z-50 bg-emerald-950/25 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div class="bg-white rounded-[2rem] w-full max-w-lg p-6 shadow-2xl shadow-emerald-950/15 border border-emerald-100 space-y-5 my-8">
        
        <!-- Modal Header -->
        <div class="flex items-center justify-between border-b border-emerald-100 pb-3">
          <h3 class="font-black text-slate-800 text-sm flex items-center gap-2">
            <CreditCard :size="18" class="text-emerald-600" /> Instruksi Pembayaran
          </h3>
          <button @click="closePaymentModal" class="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X :size="18" />
          </button>
        </div>

        <!-- Alert Notification -->
        <div v-if="errorMessage" class="p-3 bg-rose-50 text-rose-600 text-xs font-bold rounded-xl flex items-center gap-2">
          <AlertCircle :size="15" /> {{ errorMessage }}
        </div>
        <div v-if="successMessage" class="p-3 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl flex items-center gap-2">
          <CheckCircle2 :size="15" /> {{ successMessage }}
        </div>

        <!-- Detail Tagihan & Rekening -->
        <div class="space-y-4">
          <div class="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-100 flex justify-between items-center">
            <div>
              <span class="text-[10px] font-bold text-slate-400 uppercase block">Total yang Harus Dibayar</span>
              <span class="text-lg font-black text-emerald-700">Rp {{ Number(selectedRental?.total_price || 0).toLocaleString('id-ID') }}</span>
            </div>
              <span class="text-xs font-bold text-emerald-700 bg-white px-3 py-1 rounded-xl border border-emerald-100">
              {{ selectedRental?.rental_code }}
            </span>
          </div>

          <!-- Pilihan Rekening Pembayaran -->
          <div>
            <label class="text-[11px] font-bold text-slate-500 uppercase block mb-2">Transfer ke Rekening Resmi Kami:</label>
            <div class="space-y-2">
              <div 
                v-for="(acc, idx) in paymentInfo" 
                :key="idx" 
                class="flex items-center justify-between bg-white p-3 rounded-xl border border-emerald-100 text-xs hover:border-emerald-300 transition"
              >
                <div class="flex items-center gap-3">
                  <div class="bg-emerald-50 text-emerald-700 font-black px-2.5 py-1 rounded-lg text-[10px]">
                    {{ acc.bank }}
                  </div>
                  <div>
                    <p class="font-bold text-slate-800">{{ acc.number }}</p>
                    <p class="text-[10px] text-slate-400">a.n {{ acc.name }}</p>
                  </div>
                </div>
                <button 
                  @click="copyToClipboard(acc.number)" 
                  class="text-slate-400 hover:text-emerald-600 p-1 rounded-lg transition"
                  title="Salin Nomor"
                >
                  <Copy :size="15" />
                </button>
              </div>
            </div>
            <p v-if="copiedText" class="text-[10px] font-bold text-emerald-600 mt-1 text-right">Nomor rekening berhasil disalin!</p>
          </div>

          <!-- Form Upload Bukti Transfer -->
          <form @submit.prevent="handleUploadSubmit" class="space-y-3 pt-2 border-t border-slate-100">
            <div>
              <label class="text-[11px] font-bold text-slate-500 uppercase block mb-1">Unggah Bukti Transfer</label>
              <input 
                type="file" 
                accept="image/*,.pdf" 
                @change="handleFileChange" 
                required
                class="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 border border-emerald-100 rounded-xl cursor-pointer"
              />
              <p class="text-[10px] text-slate-400 mt-1">Format file: JPG, PNG, atau PDF (Max. 2MB)</p>
            </div>

            <div class="flex justify-end gap-2 pt-3">
              <button type="button" @click="closePaymentModal" class="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold hover:bg-emerald-100 transition">Batal</button>
              <button type="submit" :disabled="isSubmitting" class="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition flex items-center gap-2">
                <Upload :size="14" />
                <span v-if="isSubmitting">Mengunggah...</span>
                <span v-else>Konfirmasi Pembayaran</span>
              </button>
            </div>
          </form>

        </div>

      </div>
    </div>

    <Footer />

  </div>
</template>