<script setup>
import { 
  Tent, 
  Users, 
  ShoppingBag, 
  LayoutDashboard, 
  Boxes, 
  FolderTree, 
  FileText, 
  Settings, 
  Sparkles, 
  LogOut, 
  X 
} from 'lucide-vue-next';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  adminUser: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['close', 'logout']);
</script>

<template>
  <div>
    <!-- Backdrop Overlay (Khusus Tampilan Mobile/Layar Kecil) -->
    <div 
      v-if="isOpen" 
      @click="emit('close')" 
      class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden pointer-events-auto"
    ></div>

    <!-- Container Utama Sidebar -->
    <aside 
      :class="[
        'fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-white/90 backdrop-blur-xl border-r border-emerald-100 flex flex-col justify-between p-5 transition-transform duration-300 shadow-xl lg:shadow-none pointer-events-auto',
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      ]"
    >
      <div class="space-y-6">
        <!-- Header Branding & Logo -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="bg-emerald-600 p-2.5 rounded-2xl text-white shadow-lg shadow-emerald-600/30">
              <Tent :size="22" />
            </div>
            <div>
              <span class="text-xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-800 to-emerald-600 bg-clip-text text-transparent block">
                CampRent
              </span>
              <span class="text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-200">
                Admin Panel
              </span>
            </div>
          </div>

          <!-- Tombol Tutup Sidebar untuk Mobile -->
          <button 
            type="button" 
            @click="emit('close')" 
            class="lg:hidden text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-lg hover:bg-slate-100"
          >
            <X :size="20" />
          </button>
        </div>

        <!-- Menu Navigasi Utama -->
        <nav class="space-y-1.5 pt-4">
          <p class="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3 mb-2">Menu Utama</p>

          <!-- Menu Dashboard -->
          <router-link 
            to="/dashboardadmin"
            active-class="bg-emerald-600 !text-white shadow-md shadow-emerald-600/25"
            class="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 font-bold text-xs transition cursor-pointer"
            @click="emit('close')"
          >
            <LayoutDashboard :size="18" /> Dashboard
          </router-link>

          <!-- Menu Kelola Stok Alat -->
          <router-link 
            to="/equipmentsadmin"
            active-class="bg-emerald-600 !text-white shadow-md shadow-emerald-600/25"
            class="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 font-bold text-xs transition cursor-pointer"
            @click="emit('close')"
          >
            <Boxes :size="18" /> Kelola Stok Alat
          </router-link>

          <!-- Menu Kategori Alat -->
          <router-link 
            to="/categoriesadmin"
            active-class="bg-emerald-600 !text-white shadow-md shadow-emerald-600/25"
            class="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 font-bold text-xs transition cursor-pointer"
            @click="emit('close')"
          >
            <FolderTree :size="18" /> Kategori
          </router-link>

          <!-- Menu Transaksi Sewa -->
          <router-link 
            to="/dashboardadmin"
            active-class="bg-emerald-600 !text-white shadow-md shadow-emerald-600/25"
            class="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 font-bold text-xs transition cursor-pointer"
            @click="emit('close')"
          >
            <ShoppingBag :size="18" /> Transaksi Sewa
          </router-link>

          <!-- Menu Data Pelanggan -->
          <router-link 
            to="/dashboardadmin"
            active-class="bg-emerald-600 !text-white shadow-md shadow-emerald-600/25"
            class="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 font-bold text-xs transition cursor-pointer"
            @click="emit('close')"
          >
            <Users :size="18" /> Data Pelanggan
          </router-link>

          <!-- Menu Laporan -->
          <router-link 
            to="/dashboardadmin"
            active-class="bg-emerald-600 !text-white shadow-md shadow-emerald-600/25"
            class="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 font-bold text-xs transition cursor-pointer"
            @click="emit('close')"
          >
            <FileText :size="18" /> Laporan
          </router-link>

          <p class="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3 mt-6 mb-2">Pengaturan</p>

          <!-- Menu Halaman Katalog Utama -->
          <router-link 
            to="/catalog"
            active-class="bg-emerald-600 !text-white shadow-md shadow-emerald-600/25"
            class="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 font-bold text-xs transition cursor-pointer"
            @click="emit('close')"
          >
            <Sparkles :size="18" /> Halaman Katalog
          </router-link>

          <!-- Menu Pengaturan Admin -->
          <router-link 
            to="/dashboardadmin"
            active-class="bg-emerald-600 !text-white shadow-md shadow-emerald-600/25"
            class="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 font-bold text-xs transition cursor-pointer"
            @click="emit('close')"
          >
            <Settings :size="18" /> Pengaturan
          </router-link>
        </nav>
      </div>

      <!-- Informasi Profil Admin & Tombol Keluar -->
      <div class="border-t border-slate-100 pt-4 space-y-3">
        <div class="flex items-center gap-3 p-2 bg-slate-50/80 rounded-2xl border border-slate-100">
          <div class="w-9 h-9 rounded-xl bg-emerald-600 text-white font-extrabold flex items-center justify-center text-sm shadow-sm">
            {{ adminUser.name ? adminUser.name.charAt(0).toUpperCase() : 'A' }}
          </div>
          <div class="overflow-hidden">
            <p class="text-xs font-extrabold text-slate-800 truncate">{{ adminUser.name || 'Administrator' }}</p>
            <p class="text-[10px] font-medium text-emerald-600">Super Admin</p>
          </div>
        </div>

        <button
          type="button"
          @click="emit('logout')"
          class="w-full bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/80 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-xs active:scale-95"
        >
          <LogOut :size="16" /> Keluar Akun
        </button>
      </div>
    </aside>
  </div>
</template>