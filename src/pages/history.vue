<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { 
  History, 
  CheckCircle2, 
  Calendar,
  CreditCard,
  AlertCircle,
  ShoppingBag
} from 'lucide-vue-next';
import API from '../utils/axios';

// Import Navbar & Footer
import Navbar from '../components/navbar.vue';
import Footer from '../components/footer.vue';

const router = useRouter();
const rentals = ref([]);
const loading = ref(true);

const isSubmitting = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

// Endpoint dipastikan mengarah ke route backend
const midtransTokenEndpoint = import.meta.env.VITE_MIDTRANS_TOKEN_ENDPOINT || '/payments/midtrans/token';

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
  if (!imagePath) return 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80&fm=webp';
  if (imagePath.startsWith('http')) return imagePath;
  
  // Penyesuaian: Menggunakan host dinamis agar tidak patah saat dites di HP / jaringan lokal
  const baseUrl = import.meta.env.VITE_API_BASE_URL 
    ? import.meta.env.VITE_API_BASE_URL.replace('/api', '') 
    : `${window.location.protocol}//${window.location.hostname}:8000`;
    
  return `${baseUrl}/storage/${imagePath}`;
};

const payWithMidtrans = async (rental) => {
  const token = localStorage.getItem('token');
  console.log('token:', token);

  if (!token) {
    alert('Token login belum ada. Silakan login dulu.');
    router.push('/login');
    return;
  }

  isSubmitting.value = true;
  errorMessage.value = '';
  successMessage.value = '';

  try {
    // 1. Cek ketersediaan SDK Midtrans Snap JS
    if (!window.snap || typeof window.snap.pay !== 'function') {
      throw new Error('Midtrans Snap belum siap. Pastikan script di index.html terpasang dan muat ulang halaman.');
    }

    // 2. Request snap_token ke Backend
    const response = await API.post(
      midtransTokenEndpoint,
      {
        rental_id: rental.id,
        amount: Number(rental.total_price || 0)
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Handle ekstraksi struktur respon data yang fleksibel
    const responseData = response.data?.data || response.data;
    const snapToken = responseData?.snap_token || responseData?.token;

    if (!snapToken) {
      throw new Error('Token pembayaran Midtrans tidak diterima dari server.');
    }

    // 3. Eksekusi Pop-up Midtrans Snap
    window.snap.pay(snapToken, {
      onSuccess: (result) => {
        console.log('Payment success:', result);
        successMessage.value = 'Pembayaran berhasil. Status transaksi sedang diperbarui.';
        fetchHistory();
        isSubmitting.value = false;
      },
      onPending: (result) => {
        console.log('Payment pending:', result);
        successMessage.value = 'Pembayaran sedang diproses oleh Midtrans.';
        fetchHistory();
        isSubmitting.value = false;
      },
      onError: (result) => {
        console.error('Payment error:', result);
        errorMessage.value = 'Pembayaran gagal. Silakan coba lagi.';
        isSubmitting.value = false;
      },
      onClose: () => {
        isSubmitting.value = false;
      }
    });
  } catch (err) {
    console.error('Gagal memulai pembayaran Midtrans:', err);
    errorMessage.value = err.response?.data?.message || err.message || 'Gagal memulai pembayaran Midtrans.';
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
              <p class="text-xs text-slate-500">Bayar pesanan dengan Midtrans tanpa perlu mengunggah bukti transfer.</p>
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
                  item.payment_status === 'paid' || item.payment_status === 'settlement' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                ]">
                  {{ item.payment_status === 'paid' || item.payment_status === 'settlement' ? 'Lunas' : 'Belum Bayar' }}
                </span>
                <span class="text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider bg-teal-50 text-teal-700 border border-teal-100">
                  {{ item.rental_status }}
                </span>
              </div>
            </div>

            <!-- Item Alat yang Disewa (Penyesuaian: Menambahkan item.rentalItems) -->
            <div class="space-y-3">
              <div 
                v-for="subItem in (item.rentalItems || item.rental_items || item.items || [])" 
                :key="subItem.id" 
                class="flex items-center gap-4 bg-emerald-50/40 rounded-2xl p-3 border border-emerald-50"
              >
                <img 
                  :src="getImageUrl(subItem.equipment?.image || subItem.equipment?.gambar)" 
                  class="w-16 h-16 rounded-2xl object-cover border border-emerald-100 shrink-0"
                />
                <div class="flex-1 min-w-0">
                  <h4 class="font-bold text-slate-800 text-xs truncate">{{ subItem.equipment?.name || 'Peralatan Outdoor' }}</h4>
                  <p class="text-[11px] text-slate-400">{{ subItem.qty }} Unit x Rp {{ Number((subItem.subtotal || 0) / (subItem.qty || 1)).toLocaleString('id-ID') }}</p>
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

              <!-- Tombol Bayar Midtrans -->
              <button 
                v-if="item.payment_status !== 'paid' && item.payment_status !== 'settlement'"
                @click="payWithMidtrans(item)"
                :disabled="isSubmitting"
                class="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-md shadow-emerald-600/20 cursor-pointer"
              >
                <CreditCard :size="14" />
                <span>{{ isSubmitting ? 'Menyiapkan...' : 'Bayar dengan Midtrans' }}</span>
              </button>
            </div>

          </div>
        </div>

      </main>
    </div>

    <!-- Alert / Message Container -->
    <div v-if="errorMessage || successMessage" class="fixed bottom-5 right-5 z-50 max-w-sm">
      <div v-if="errorMessage" class="p-3 bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg">
        <AlertCircle :size="15" /> {{ errorMessage }}
      </div>
      <div v-else class="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg">
        <CheckCircle2 :size="15" /> {{ successMessage }}
      </div>
    </div>

    <Footer />

  </div>
</template>