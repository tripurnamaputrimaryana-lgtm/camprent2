<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { Bell, ShieldCheck, Truck, SlidersHorizontal, Save, CheckCircle2, X } from 'lucide-vue-next';
import SidebarAdmin from '../components/SidebarAdmin.vue';
import NavbarAdmin from '../components/navbaradmin.vue';

const router = useRouter();
const isSidebarOpen = ref(false);
const adminUser = ref(JSON.parse(localStorage.getItem('user') || '{}'));

const settings = ref({
  notifications: true,
  emailAlerts: true,
  lowStockAlert: true,
  newOrderAlert: true,
  maintenanceMode: false,
  reservationReminder: true
});

const stats = computed(() => [
  { label: 'Notifikasi Aktif', value: Object.values(settings.value).filter(Boolean).length, icon: Bell },
  { label: 'Keamanan', value: 'Aman', icon: ShieldCheck },
  { label: 'Pengiriman', value: 'Siap', icon: Truck },
  { label: 'Pengaturan', value: 'Sistem', icon: SlidersHorizontal }
]);

const saveSettings = () => {
  // simulasi berhasil simpan
  alert('Pengaturan berhasil disimpan.');
};

const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  router.push('/login');
};
</script>

<template>
  <div class="min-h-screen bg-[#f4faf6] font-['Plus_Jakarta_Sans',sans-serif] text-slate-800 flex">
    <SidebarAdmin :is-open="isSidebarOpen" :admin-user="adminUser" @close="isSidebarOpen = false" @logout="handleLogout" />

    <div class="flex-1 flex flex-col min-w-0">
      <NavbarAdmin title="Pengaturan Admin" :admin-user="adminUser" @menu="isSidebarOpen = true" @logout="handleLogout" />

      <main class="p-4 sm:p-8 max-w-7xl w-full space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div v-for="item in stats" :key="item.label" class="bg-white rounded-3xl border border-emerald-100 p-4 shadow-sm shadow-emerald-900/5">
            <div class="flex items-center justify-between">
              <div class="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <component :is="item.icon" :size="18" />
              </div>
              <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Live</span>
            </div>
            <p class="mt-4 text-2xl font-black text-slate-900">{{ item.value }}</p>
            <p class="text-[11px] text-slate-500 font-semibold">{{ item.label }}</p>
          </div>
        </div>

        <div class="bg-white rounded-[2rem] border border-emerald-100 shadow-lg shadow-emerald-900/5 overflow-hidden">
          <div class="px-6 py-5 border-b border-emerald-100">
            <div class="flex items-center justify-between gap-4">
              <div>
                <p class="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">Notifikasi & sistem</p>
                <h2 class="text-xl font-black text-slate-900 mt-1">Pengaturan Kontrol Admin</h2>
              </div>
              <button @click="saveSettings" class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer">
                <Save :size="15" />
                Simpan
              </button>
            </div>
          </div>

          <div class="p-6 space-y-5">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div class="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-xs font-extrabold uppercase tracking-wide text-emerald-700">Notifikasi umum</p>
                    <p class="text-[11px] text-slate-500 mt-1">Aktifkan semua pemberitahuan admin.</p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input v-model="settings.notifications" type="checkbox" class="sr-only peer" />
                    <div class="w-11 h-6 bg-slate-200 peer-checked:bg-emerald-500 rounded-full transition-all"></div>
                    <div class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all peer-checked:translate-x-5"></div>
                  </label>
                </div>
              </div>

              <div class="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-xs font-extrabold uppercase tracking-wide text-emerald-700">Email alert</p>
                    <p class="text-[11px] text-slate-500 mt-1">Kirim laporan ke email admin.</p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input v-model="settings.emailAlerts" type="checkbox" class="sr-only peer" />
                    <div class="w-11 h-6 bg-slate-200 peer-checked:bg-emerald-500 rounded-full transition-all"></div>
                    <div class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all peer-checked:translate-x-5"></div>
                  </label>
                </div>
              </div>

              <div class="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-xs font-extrabold uppercase tracking-wide text-emerald-700">Low stock alert</p>
                    <p class="text-[11px] text-slate-500 mt-1">Peringatan saat stok alat menipis.</p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input v-model="settings.lowStockAlert" type="checkbox" class="sr-only peer" />
                    <div class="w-11 h-6 bg-slate-200 peer-checked:bg-emerald-500 rounded-full transition-all"></div>
                    <div class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all peer-checked:translate-x-5"></div>
                  </label>
                </div>
              </div>

              <div class="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-xs font-extrabold uppercase tracking-wide text-emerald-700">Pesanan baru</p>
                    <p class="text-[11px] text-slate-500 mt-1">Pemberitahuan saat ada transaksi baru.</p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input v-model="settings.newOrderAlert" type="checkbox" class="sr-only peer" />
                    <div class="w-11 h-6 bg-slate-200 peer-checked:bg-emerald-500 rounded-full transition-all"></div>
                    <div class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all peer-checked:translate-x-5"></div>
                  </label>
                </div>
              </div>

              <div class="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-xs font-extrabold uppercase tracking-wide text-emerald-700">Maintenance mode</p>
                    <p class="text-[11px] text-slate-500 mt-1">Nonaktifkan akses publik sementara.</p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input v-model="settings.maintenanceMode" type="checkbox" class="sr-only peer" />
                    <div class="w-11 h-6 bg-slate-200 peer-checked:bg-emerald-500 rounded-full transition-all"></div>
                    <div class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all peer-checked:translate-x-5"></div>
                  </label>
                </div>
              </div>

              <div class="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-xs font-extrabold uppercase tracking-wide text-emerald-700">Reminder sewa</p>
                    <p class="text-[11px] text-slate-500 mt-1">Ingatkan pengembalian alat pada pelanggan.</p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input v-model="settings.reservationReminder" type="checkbox" class="sr-only peer" />
                    <div class="w-11 h-6 bg-slate-200 peer-checked:bg-emerald-500 rounded-full transition-all"></div>
                    <div class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all peer-checked:translate-x-5"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>
