<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { BarChart3, Download, CalendarDays, TrendingUp, ShoppingBag, Wallet, Package, Menu } from 'lucide-vue-next';
import API from '../utils/axios';
import SidebarAdmin from '../components/sidebaradmin.vue';
import NavbarAdmin from '../components/navbaradmin.vue';

const router = useRouter();
const adminUser = ref(JSON.parse(localStorage.getItem('user') || '{}'));
const isSidebarOpen = ref(false);
const loading = ref(true);
const rentals = ref([]);
const equipments = ref([]);
const startDate = ref('');
const endDate = ref('');

const fetchData = async () => {
  loading.value = true;
  try {
    const [rentalsResponse, equipmentResponse] = await Promise.all([
      API.get('/rentals'),
      API.get('/equipments')
    ]);
    rentals.value = rentalsResponse.data.data || rentalsResponse.data || [];
    equipments.value = equipmentResponse.data.data || equipmentResponse.data || [];
  } catch (error) {
    console.error('Gagal mengambil data laporan:', error);
  } finally {
    loading.value = false;
  }
};

const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  router.push('/login');
};

const isWithinDateRange = (rental) => {
  const rentalDate = rental.start_date || rental.created_at?.slice(0, 10) || '';
  return (!startDate.value || rentalDate >= startDate.value) && (!endDate.value || rentalDate <= endDate.value);
};

const filteredRentals = computed(() => rentals.value.filter(isWithinDateRange));

const paidRentals = computed(() => filteredRentals.value.filter((rental) => {
  const status = String(rental.payment_status || rental.status || '').toLowerCase();
  return ['paid', 'success', 'approved', 'completed', 'selesai', 'disetujui'].includes(status);
}));

const totalRevenue = computed(() => paidRentals.value.reduce((total, rental) => total + Number(rental.total_price || rental.total_harga || rental.price || 0), 0));
const pendingRentals = computed(() => filteredRentals.value.filter((rental) => String(rental.payment_status || '').toLowerCase() !== 'paid').length);
const lowStockEquipments = computed(() => equipments.value.filter((equipment) => Number(equipment.stock ?? equipment.stok ?? 0) <= 2));

const popularEquipments = computed(() => {
  const counts = {};
  filteredRentals.value.forEach((rental) => {
    const items = rental.rental_items || rental.items || [];
    items.forEach((item) => {
      const name = item.equipment?.name || item.equipment_name || 'Peralatan Outdoor';
      counts[name] = (counts[name] || 0) + Number(item.qty || item.quantity || 1);
    });
  });
  return Object.entries(counts).sort(([, first], [, second]) => second - first).slice(0, 5);
});

const formatRupiah = (value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);

const exportCsv = () => {
  const header = ['Kode Sewa', 'Pelanggan', 'Tanggal Mulai', 'Tanggal Selesai', 'Status Pembayaran', 'Total'];
  const rows = filteredRentals.value.map((rental) => [
    rental.rental_code || rental.code || '-',
    rental.customer_name || rental.user?.name || '-',
    rental.start_date || '-',
    rental.end_date || '-',
    rental.payment_status || '-',
    rental.total_price || 0
  ]);
  const csv = [header, ...rows].map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'laporan-camprent.csv';
  link.click();
  URL.revokeObjectURL(url);
};

onMounted(fetchData);
</script>

<template>
  <div class="min-h-screen bg-[#f4faf6] font-['Plus_Jakarta_Sans',sans-serif] text-slate-800 flex">
    <SidebarAdmin :is-open="isSidebarOpen" :admin-user="adminUser" @close="isSidebarOpen = false" @logout="handleLogout" />

    <div class="flex-1 min-w-0">
      <NavbarAdmin title="Laporan Admin" :admin-user="adminUser" @menu="isSidebarOpen = true" @logout="handleLogout">
        <template #actions>
          <button @click="exportCsv" class="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl border border-emerald-100 transition cursor-pointer" title="Export CSV">
            <Download :size="17" />
          </button>
        </template>
      </NavbarAdmin>

      <main class="p-4 sm:p-8 space-y-6 max-w-7xl">
        <section class="relative overflow-hidden bg-gradient-to-br from-emerald-100 via-white to-teal-50 rounded-[2rem] border border-emerald-100 p-6 sm:p-8 shadow-lg shadow-emerald-900/5">
          <div class="absolute -right-12 -top-20 w-64 h-64 rounded-full bg-emerald-200/40 blur-3xl"></div>
          <div class="relative flex flex-col lg:flex-row lg:items-end justify-between gap-5">
            <div>
              <span class="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">Business Overview</span>
              <h1 class="text-2xl sm:text-3xl font-black text-slate-900 mt-1">Laporan & Analitik</h1>
              <p class="text-xs text-slate-600 mt-1">Pantau performa penyewaan dan kesehatan stok CampRent.</p>
            </div>
            <div class="flex flex-col sm:flex-row gap-2">
              <label class="relative flex items-center gap-2 bg-white border border-emerald-100 rounded-xl px-3 py-2 text-xs text-slate-500">
                <CalendarDays :size="14" class="text-emerald-600" />
                <input v-model="startDate" type="date" class="bg-transparent outline-none text-xs text-slate-700" />
              </label>
              <label class="relative flex items-center gap-2 bg-white border border-emerald-100 rounded-xl px-3 py-2 text-xs text-slate-500">
                <span class="text-emerald-600">s/d</span>
                <input v-model="endDate" type="date" class="bg-transparent outline-none text-xs text-slate-700" />
              </label>
            </div>
          </div>
        </section>

        <div v-if="loading" class="bg-white rounded-3xl border border-emerald-100 py-20 text-center shadow-sm">
          <div class="inline-block w-8 h-8 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
          <p class="text-xs text-slate-500 font-semibold mt-3">Menyiapkan laporan...</p>
        </div>

        <template v-else>
          <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="bg-white rounded-2xl border border-emerald-100 p-5 shadow-sm"><TrendingUp class="text-emerald-600" :size="20" /><span class="block text-[10px] text-slate-400 uppercase font-bold mt-4">Pendapatan</span><strong class="block text-xl text-emerald-800 font-black mt-1">{{ formatRupiah(totalRevenue) }}</strong></div>
            <div class="bg-white rounded-2xl border border-emerald-100 p-5 shadow-sm"><ShoppingBag class="text-teal-600" :size="20" /><span class="block text-[10px] text-slate-400 uppercase font-bold mt-4">Total Transaksi</span><strong class="block text-xl text-slate-900 font-black mt-1">{{ filteredRentals.length }}</strong></div>
            <div class="bg-white rounded-2xl border border-amber-100 p-5 shadow-sm"><Wallet class="text-amber-600" :size="20" /><span class="block text-[10px] text-slate-400 uppercase font-bold mt-4">Menunggu Bayar</span><strong class="block text-xl text-amber-700 font-black mt-1">{{ pendingRentals }}</strong></div>
            <div class="bg-white rounded-2xl border border-rose-100 p-5 shadow-sm"><Package class="text-rose-500" :size="20" /><span class="block text-[10px] text-slate-400 uppercase font-bold mt-4">Stok Menipis</span><strong class="block text-xl text-rose-700 font-black mt-1">{{ lowStockEquipments.length }}</strong></div>
          </section>

          <section class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="bg-white rounded-3xl border border-emerald-100 shadow-sm p-6">
              <div class="flex items-center gap-2 border-b border-emerald-100 pb-4"><BarChart3 :size="18" class="text-emerald-600" /><h2 class="font-black text-slate-900">Alat Paling Sering Disewa</h2></div>
              <div v-if="popularEquipments.length" class="space-y-4 mt-5"><div v-for="([name, count], index) in popularEquipments" :key="name" class="flex items-center gap-3"><span class="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-black">{{ index + 1 }}</span><div class="flex-1"><div class="flex justify-between text-xs font-bold"><span class="truncate">{{ name }}</span><span class="text-emerald-700">{{ count }} unit</span></div><div class="h-2 bg-emerald-50 rounded-full mt-2 overflow-hidden"><div class="h-full bg-emerald-500 rounded-full" :style="{ width: `${Math.min(100, count * 12)}%` }"></div></div></div></div></div><p v-else class="text-xs text-slate-500 mt-5">Belum ada data alat yang disewa.</p>
            </div>
            <div class="bg-white rounded-3xl border border-emerald-100 shadow-sm p-6"><div class="flex items-center gap-2 border-b border-emerald-100 pb-4"><Package :size="18" class="text-emerald-600" /><h2 class="font-black text-slate-900">Stok Perlu Perhatian</h2></div><div v-if="lowStockEquipments.length" class="space-y-3 mt-5"><div v-for="equipment in lowStockEquipments" :key="equipment.id" class="flex items-center justify-between bg-rose-50/60 border border-rose-100 rounded-xl px-3 py-3"><span class="text-xs font-bold text-slate-700 truncate">{{ equipment.name || equipment.title }}</span><span class="text-[10px] font-black text-rose-700 bg-white border border-rose-100 rounded-lg px-2 py-1">{{ equipment.stock ?? equipment.stok ?? 0 }} unit</span></div></div><p v-else class="text-xs text-slate-500 mt-5">Semua stok masih dalam kondisi aman.</p></div>
          </section>
        </template>
      </main>
    </div>
  </div>
</template>
