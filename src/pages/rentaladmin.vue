<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { 
  Plus, 
  Search, 
  Bell, 
  Menu, 
  X,
  ShoppingBag,
  AlertCircle,
  Eye,
  FileText,
  CheckCircle,
  ExternalLink,
  PackageCheck,
  RotateCcw,
  XCircle
} from 'lucide-vue-next';
import api from '../utils/axios';
import SidebarAdmin from '../components/SidebarAdmin.vue';
import NavbarAdmin from '../components/navbaradmin.vue';

const router = useRouter();

const rentals = ref([]);
const loading = ref(true);
const errorMessage = ref('');

const adminUser = ref(JSON.parse(localStorage.getItem('user') || '{}'));
const searchTerm = ref('');
const isSidebarOpen = ref(false);

// State Modal Detail (Show Transaksi & Bukti Bayar)
const showDetailModal = ref(false);
const selectedRental = ref(null);
const showPickupModal = ref(false);
const pickupRental = ref(null);
const pickupForm = ref({ ktp_url: '', pickup_note: '' });

const fetchData = async () => {
  loading.value = true;
  errorMessage.value = '';
  try {
    // Diubah dari '/admin/rentals' menjadi '/rentals' sesuai rute Laravel yang aktif
    const res = await api.get('/rentals');
    rentals.value = res.data.data || res.data;
  } catch (err) {
    console.error('Gagal mengambil data transaksi:', err);
    errorMessage.value = 'Gagal memuat data transaksi dari server.';
  } finally {
    loading.value = false;
  }
};

// Computed property untuk pencarian berdasarkan kode sewa atau nama pelanggan
const filteredRentals = computed(() => {
  if (!searchTerm.value) return rentals.value;
  return rentals.value.filter(item => {
    const code = item.rental_code || item.code || '';
    const name = item.customer_name || item.user?.name || '';
    const query = searchTerm.value.toLowerCase();
    return code.toLowerCase().includes(query) || name.toLowerCase().includes(query);
  });
});

const formatRupiah = (value) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
};

const getPaymentProof = (rental) => {
  const payment = rental?.payment || rental?.payments?.[0] || rental?.latest_payment || {};
  return rental?.payment_proof || rental?.proof || payment.payment_proof || payment.proof || payment.file || payment.file_path || '';
};

const getProofUrl = (proof) => {
  if (!proof) return '';
  if (proof.startsWith('http')) return proof;
  if (proof.startsWith('/')) return `${api.defaults.baseURL.replace(/\/api\/?$/, '')}${proof}`;
  return `${api.defaults.baseURL.replace(/\/api\/?$/, '')}/storage/${proof.replace(/^storage\//, '')}`;
};

const rentalStatusLabels = {
  pending: 'Menunggu',
  ready_for_pickup: 'Siap Diambil',
  ongoing: 'Sedang Disewa',
  completed: 'Dikembalikan',
  cancelled: 'Tidak Jadi'
};

const getRentalStatusLabel = (status) => rentalStatusLabels[status] || status || 'Belum Diatur';

const getKtpProof = (rental) => rental?.ktp_url || rental?.ktp_image || rental?.ktp || rental?.identity_card || '';

const getRentalEndDate = (rental) => {
  if (rental?.returned_at) return rental.returned_at.slice(0, 10);
  if (rental?.return_date) return rental.return_date;
  return new Date().toISOString().slice(0, 10);
};

const getLateDays = (rental) => {
  if (!rental?.end_date || ['pending', 'cancelled'].includes(rental.rental_status)) return 0;
  const dueDate = new Date(`${rental.end_date}T00:00:00`);
  const actualDate = new Date(`${getRentalEndDate(rental)}T00:00:00`);
  const days = Math.ceil((actualDate - dueDate) / (1000 * 60 * 60 * 24));
  return Math.max(0, days);
};

const getLateFee = (rental) => getLateDays(rental) * Number(rental?.total_price || 0) * 0.2;

// Fungsi Ubah Status Rental / Konfirmasi Pembayaran
const updateStatus = async (id, newStatus) => {
  const rental = rentals.value.find((item) => item.id === id);
  const payload = { rental_status: newStatus };

  if (newStatus === 'completed') {
    payload.return_note = window.prompt('Keterangan saat pengembalian (kondisi barang):', '')?.trim() || '';
  }

  if (newStatus === 'cancelled') {
    payload.cancellation_reason = window.prompt('Alasan transaksi tidak jadi (opsional):', '')?.trim() || '';
  }

  if (confirm(`Apakah kamu yakin ingin mengubah status transaksi ini menjadi ${getRentalStatusLabel(newStatus)}?`)) {
    try {
      await api.put(`/rentals/${id}/status`, payload);
      fetchData();
    } catch (err) {
      console.error('Gagal memperbarui status:', err);
      alert('Gagal memperbarui status transaksi.');
    }
  }
};

const openPickupModal = (rental) => {
  pickupRental.value = rental;
  pickupForm.value = { ktp_url: getKtpProof(rental), pickup_note: '' };
  showPickupModal.value = true;
};

const closePickupModal = () => {
  showPickupModal.value = false;
  pickupRental.value = null;
  pickupForm.value = { ktp_url: '', pickup_note: '' };
};

const confirmPickup = async () => {
  if (!pickupRental.value || !pickupForm.value.ktp_url.trim()) return;

  try {
    await api.put(`/rentals/${pickupRental.value.id}/status`, {
      rental_status: 'ongoing',
      ktp_url: pickupForm.value.ktp_url.trim(),
      pickup_note: pickupForm.value.pickup_note.trim()
    });
    closePickupModal();
    fetchData();
  } catch (err) {
    console.error('Gagal mencatat jaminan KTP:', err);
    alert('Gagal menyimpan jaminan KTP dan status pengambilan.');
  }
};

// Buka Modal Detail
const openDetailModal = (item) => {
  selectedRental.value = item;
  showDetailModal.value = true;
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
  <div class="min-h-screen bg-[#f4faf6] font-['Plus_Jakarta_Sans',sans-serif] text-slate-800 flex">
    
    <SidebarAdmin 
      :is-open="isSidebarOpen" 
      :admin-user="adminUser"
      @close="isSidebarOpen = false"
      @logout="handleLogout"
    />

    <div class="flex-1 flex flex-col min-w-0">
      
      <NavbarAdmin title="Kelola Transaksi Sewa" :admin-user="adminUser" @menu="isSidebarOpen = true" @logout="handleLogout" />

      <main class="p-4 sm:p-8 space-y-6 max-w-7xl">
        
        <div class="relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-br from-emerald-100 via-white to-teal-50 rounded-[2rem] border border-emerald-100 p-6 shadow-lg shadow-emerald-900/5">
          <div class="absolute -right-12 -top-20 w-64 h-64 rounded-full bg-emerald-200/40 blur-3xl"></div>
          <div>
            <span class="relative text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">Rental Operations</span>
            <h1 class="relative text-2xl sm:text-3xl font-black text-slate-900 mt-1">Daftar Transaksi Pelanggan</h1>
            <p class="relative text-xs text-slate-600 font-medium mt-1">Pantau pesanan masuk, verifikasi pembayaran, dan kelola status penyewaan.</p>
          </div>
        </div>

        <!-- Alert Error jika ada -->
        <div v-if="errorMessage" class="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-rose-600 text-xs font-bold">
          <AlertCircle :size="18" class="shrink-0" />
          <span>{{ errorMessage }}</span>
        </div>

        <div class="bg-white rounded-3xl shadow-xl shadow-emerald-900/5 border border-emerald-100 overflow-hidden">
          <div class="p-5 sm:p-6 border-b border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="relative w-full sm:w-80">
              <Search class="absolute left-3.5 top-3 text-slate-400" :size="16" />
              <input 
                v-model="searchTerm" 
                type="text" 
                placeholder="Cari kode sewa / nama pelanggan..." 
                class="w-full pl-9 pr-4 py-2.5 bg-emerald-50/40 border border-emerald-100 text-slate-800 placeholder-slate-400 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:bg-white outline-none transition"
              />
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-emerald-50/60 text-emerald-800/60 uppercase font-extrabold tracking-wider border-b border-emerald-100">
                <tr>
                  <th class="p-4 pl-6">Kode Sewa</th>
                  <th class="p-4">Pelanggan</th>
                  <th class="p-4">Tanggal Sewa</th>
                  <th class="p-4">Total Harga</th>
                  <th class="p-4">Pembayaran</th>
                  <th class="p-4">Status Rental</th>
                  <th class="p-4 text-center pr-6">Aksi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-emerald-50 text-slate-700 font-medium">
                <tr v-if="loading">
                  <td colspan="7" class="p-12 text-center text-slate-400">
                    <div class="inline-block w-6 h-6 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                    <p class="text-xs font-semibold">Mengambil data transaksi dari server...</p>
                  </td>
                </tr>

                <tr v-else-if="filteredRentals.length === 0">
                  <td colspan="7" class="p-12 text-center text-slate-400">
                    Belum ada data transaksi atau pembayaran yang ditemukan.
                  </td>
                </tr>

                <tr v-else v-for="item in filteredRentals" :key="item.id" class="hover:bg-emerald-50/50 transition-colors">
                  <td class="p-4 pl-6 font-bold text-emerald-700">
                    <span class="inline-flex bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg">
                      {{ item.rental_code || item.code }}
                    </span>
                  </td>

                  <td class="p-4 font-bold text-slate-800">
                    {{ item.customer_name || item.user?.name || 'Tanpa Nama' }}
                  </td>

                  <td class="p-4 text-slate-500">
                    {{ item.start_date }} s/d {{ item.end_date }}
                  </td>

                  <td class="p-4 font-extrabold text-slate-800">
                    {{ formatRupiah(item.total_price) }}
                  </td>

                  <td class="p-4">
                    <span :class="[
                      'px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase',
                      item.payment_status === 'paid' || item.payment_status === 'success' 
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                        : 'bg-amber-100 text-amber-700 border border-amber-200'
                    ]">
                      {{ item.payment_status }}
                    </span>
                  </td>

                  <td class="p-4">
                    <span :class="[
                      'px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase',
                      item.rental_status === 'ready_for_pickup' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                      item.rental_status === 'ongoing' ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' :
                      item.rental_status === 'completed' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                      item.rental_status === 'cancelled' ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-slate-100 text-slate-600 border border-slate-200'
                    ]">
                      {{ getRentalStatusLabel(item.rental_status) }}
                    </span>
                  </td>

                  <td class="p-4 text-center pr-6">
                    <div class="flex items-center justify-center gap-2">
                      <!-- Tombol Konfirmasi Siap Diambil / Proses -->
                      <button 
                        v-if="item.rental_status === 'pending'"
                        @click="updateStatus(item.id, 'ready_for_pickup')" 
                        class="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 p-2 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
                        title="Set Siap Diambil"
                      >
                        <CheckCircle :size="14" />
                      </button>

                      <button
                        v-if="item.rental_status === 'ready_for_pickup'"
                        @click="openPickupModal(item)"
                        class="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 p-2 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
                        title="Tandai Sudah Diambil"
                      >
                        <PackageCheck :size="14" />
                      </button>

                      <button
                        v-if="item.rental_status === 'ongoing'"
                        @click="updateStatus(item.id, 'completed')"
                        class="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 p-2 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
                        title="Tandai Sudah Dikembalikan"
                      >
                        <RotateCcw :size="14" />
                      </button>

                      <button
                        v-if="['pending', 'ready_for_pickup'].includes(item.rental_status)"
                        @click="updateStatus(item.id, 'cancelled')"
                        class="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 p-2 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
                        title="Tandai Tidak Jadi"
                      >
                        <XCircle :size="14" />
                      </button>

                      <!-- Tombol Lihat Detail / Bukti Bayar -->
                      <button 
                        @click="openDetailModal(item)" 
                        class="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 p-2 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs border border-emerald-100"
                        title="Lihat Detail & Bukti Bayar"
                      >
                        <Eye :size="14" />
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

    <!-- Modal Jaminan KTP Saat Pengambilan -->
    <div v-if="showPickupModal" class="fixed inset-0 z-50 bg-emerald-950/25 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-[2rem] w-full max-w-lg p-6 shadow-2xl shadow-emerald-950/15 border border-emerald-100 space-y-5">
        <div class="flex items-center justify-between border-b border-emerald-100 pb-3">
          <div>
            <span class="text-[10px] font-black uppercase tracking-wider text-emerald-700">Proses Pengambilan</span>
            <h3 class="font-extrabold text-slate-900 text-base mt-1">Jaminan KTP Pelanggan</h3>
          </div>
          <button @click="closePickupModal" class="text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-lg hover:bg-slate-100" title="Tutup">
            <X :size="18" />
          </button>
        </div>

        <div class="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-800">
          Masukkan link foto KTP sebagai jaminan sebelum barang dibawa pelanggan. Status rental akan berubah menjadi <strong>Sedang Disewa</strong> setelah disimpan.
        </div>

        <div v-if="pickupRental" class="space-y-4 text-xs">
          <div class="bg-emerald-50/60 border border-emerald-100 rounded-xl p-3">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Transaksi</span>
            <p class="font-black text-slate-800 mt-1">{{ pickupRental.rental_code || `Rental #${pickupRental.id}` }}</p>
            <p class="text-slate-500 mt-0.5">{{ pickupRental.customer_name || pickupRental.user?.name || 'Tanpa Nama' }}</p>
          </div>

          <div>
            <label class="text-[11px] font-extrabold uppercase text-slate-500 block mb-1">Link Foto KTP <span class="text-rose-500">*</span></label>
            <input
              v-model="pickupForm.ktp_url"
              type="url"
              required
              placeholder="https://contoh.com/ktp-pelanggan.jpg"
              class="w-full px-3.5 py-2.5 bg-emerald-50/40 border border-emerald-100 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:bg-white outline-none"
            />
          </div>

          <div>
            <label class="text-[11px] font-extrabold uppercase text-slate-500 block mb-1">Keterangan Saat Diambil</label>
            <textarea
              v-model="pickupForm.pickup_note"
              rows="3"
              placeholder="Contoh: KTP asli sudah diperiksa, kondisi alat lengkap dan baik."
              class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none"
            ></textarea>
          </div>
        </div>

        <div class="flex items-center justify-end gap-2">
          <button @click="closePickupModal" class="px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold hover:bg-emerald-100 transition cursor-pointer">Batal</button>
          <button
            @click="confirmPickup"
            :disabled="!pickupForm.ktp_url.trim()"
            class="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition shadow-md shadow-emerald-600/20 cursor-pointer"
          >
            Simpan & Tandai Diambil
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Detail Transaksi & Bukti Pembayaran -->
    <div v-if="showDetailModal" class="fixed inset-0 z-50 bg-emerald-950/25 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-[2rem] w-full max-w-lg p-6 shadow-2xl shadow-emerald-950/15 border border-emerald-100 space-y-5 max-h-[90vh] overflow-y-auto">
        
        <div class="flex items-center justify-between border-b border-emerald-100 pb-3">
          <h3 class="font-extrabold text-slate-900 text-base flex items-center gap-2">
            <FileText :size="18" class="text-emerald-600" /> Detail Transaksi Sewa
          </h3>
          <button @click="showDetailModal = false" class="text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-lg hover:bg-slate-100">
            <X :size="18" />
          </button>
        </div>

        <div v-if="selectedRental" class="space-y-4 text-xs">
          <div class="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-100/80 flex items-center justify-between">
            <div>
              <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">Kode Sewa</span>
              <h4 class="font-black text-slate-800 text-sm">{{ selectedRental.rental_code || selectedRental.code }}</h4>
            </div>
            <div class="text-right">
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Total Biaya</span>
              <h4 class="font-black text-emerald-700 text-sm">{{ formatRupiah(selectedRental.total_price) }}</h4>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="bg-emerald-50/60 p-3 rounded-2xl border border-emerald-100">
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Nama Pelanggan</span>
              <p class="font-bold text-slate-800 mt-0.5">{{ selectedRental.customer_name || selectedRental.user?.name }}</p>
            </div>
            <div class="bg-emerald-50/60 p-3 rounded-2xl border border-emerald-100">
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Durasi Sewa</span>
              <p class="font-bold text-slate-800 mt-0.5">{{ selectedRental.start_date }} s/d {{ selectedRental.end_date }}</p>
            </div>
          </div>

          <div class="bg-emerald-50/60 p-3 rounded-2xl border border-emerald-100 space-y-1">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Status Pembayaran & Rental</span>
            <div class="flex gap-2 pt-1">
              <span class="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-700">
                {{ selectedRental.payment_status }}
              </span>
              <span class="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase bg-blue-100 text-blue-700">
                {{ selectedRental.rental_status }}
              </span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="bg-emerald-50/60 p-3 rounded-2xl border border-emerald-100">
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Jaminan KTP</span>
              <a
                v-if="getKtpProof(selectedRental)"
                :href="getProofUrl(getKtpProof(selectedRental))"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-1 text-emerald-700 font-bold mt-1 hover:underline"
              >
                Lihat KTP <ExternalLink :size="12" />
              </a>
              <p v-else class="text-rose-600 font-bold mt-1">Belum dicatat</p>
            </div>
            <div class="bg-amber-50 p-3 rounded-2xl border border-amber-200">
              <span class="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">Denda Keterlambatan</span>
              <p class="font-black text-amber-800 mt-1">{{ formatRupiah(getLateFee(selectedRental)) }}</p>
              <span v-if="getLateDays(selectedRental)" class="text-[10px] text-amber-700">{{ getLateDays(selectedRental) }} hari x 20%</span>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Keterangan Diambil</span>
              <p class="text-slate-600 mt-1">{{ selectedRental.pickup_note || 'Belum ada keterangan.' }}</p>
            </div>
            <div class="bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Keterangan Dikembalikan</span>
              <p class="text-slate-600 mt-1">{{ selectedRental.return_note || 'Belum ada keterangan.' }}</p>
            </div>
          </div>

          <!-- Bagian Bukti Bayar -->
          <div class="space-y-1.5 bg-emerald-50/60 p-4 rounded-2xl border border-emerald-100">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Bukti Pembayaran / Transfer</span>
            <div v-if="getPaymentProof(selectedRental)">
              <a :href="getProofUrl(getPaymentProof(selectedRental))" target="_blank" rel="noopener noreferrer" class="block group relative overflow-hidden rounded-xl border border-emerald-100">
                <img :src="getProofUrl(getPaymentProof(selectedRental))" alt="Bukti Bayar" class="w-full h-48 object-cover rounded-xl group-hover:scale-105 transition duration-300" />
                <div class="absolute inset-0 bg-emerald-950/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white font-bold gap-1 text-xs">
                  <ExternalLink :size="16" /> Buka Gambar Full
                </div>
              </a>
            </div>
            <div v-else class="text-slate-400 italic py-4 text-center bg-white rounded-xl border border-dashed border-slate-200">
              Pelanggan belum mengunggah bukti pembayaran.
            </div>
          </div>
        </div>

        <button 
          @click="showDetailModal = false"
          class="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-xs font-bold transition cursor-pointer shadow-md shadow-emerald-600/20"
        >
          Tutup
        </button>

      </div>
    </div>

  </div>
</template>