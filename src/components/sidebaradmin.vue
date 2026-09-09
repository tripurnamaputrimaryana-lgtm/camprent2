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
  X,
  ChevronRight
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
    <!-- Backdrop Overlay (Mobile) -->
    <Transition
      enter-active-class="transition-opacity duration-300 ease-linear"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-300 ease-linear"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div 
        v-if="isOpen" 
        @click="emit('close')" 
        class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
      ></div>
    </Transition>

    <!-- Sidebar Container -->
    <aside 
      :class="[
        'fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-white/90 backdrop-blur-xl border-r border-emerald-100/80 flex flex-col justify-between p-5 transition-transform duration-300 ease-in-out shadow-xl lg:shadow-none font-[\'Plus_Jakarta_Sans\',sans-serif]',
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      ]"
    >
      <div class="space-y-6 overflow-y-auto no-scrollbar pr-1">
        
        <!-- Header Branding & Logo -->
        <div class="flex items-center justify-between pb-2">
          <div class="flex items-center gap-3">
            <div class="bg-gradient-to-tr from-emerald-600 to-teal-500 p-2.5 rounded-2xl text-white shadow-md shadow-emerald-600/20">
              <Tent :size="22" class="stroke-[2.5]" />
            </div>
            <div class="flex flex-col">
              <span class="text-xl font-black tracking-tight bg-gradient-to-r from-emerald-800 to-teal-600 bg-clip-text text-transparent">
                CampRent
              </span>
              <span class="inline-block text-[9px] font-black uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-200/60 w-max">
                Admin Panel
              </span>
            </div>
          </div>

          <!-- Close Button (Mobile Only) -->
          <button 
            type="button" 
            @click="emit('close')" 
            class="lg:hidden text-slate-400 hover:text-slate-600 cursor-pointer p-1.5 rounded-xl hover:bg-slate-100 transition active:scale-95"
          >
            <X :size="18" />
          </button>
        </div>

        <!-- Navigation Links -->
        <nav class="space-y-1">
          <p class="text-[10px] font-black uppercase tracking-wider text-slate-400 px-3 mb-2">
            Menu Utama
          </p>

          <!-- Dashboard -->
          <router-link 
            to="/dashboardadmin"
            exact-active-class="bg-emerald-600 !text-white shadow-md shadow-emerald-600/20 font-extrabold"
            class="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-emerald-50/80 hover:text-emerald-700 font-bold text-xs transition-all group cursor-pointer"
            @click="emit('close')"
          >
            <div class="flex items-center gap-2.5">
              <LayoutDashboard :size="18" />
              <span>Dashboard</span>
            </div>
            <ChevronRight :size="14" class="opacity-0 group-hover:opacity-100 transition-opacity" />
          </router-link>

          <!-- Kelola Stok Alat -->
          <router-link 
            to="/equipmentsadmin"
            exact-active-class="bg-emerald-600 !text-white shadow-md shadow-emerald-600/20 font-extrabold"
            class="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-emerald-50/80 hover:text-emerald-700 font-bold text-xs transition-all group cursor-pointer"
            @click="emit('close')"
          >
            <div class="flex items-center gap-2.5">
              <Boxes :size="18" />
              <span>Kelola Stok Alat</span>
            </div>
            <ChevronRight :size="14" class="opacity-0 group-hover:opacity-100 transition-opacity" />
          </router-link>

          <!-- Kategori Alat -->
          <router-link 
            to="/categoriesadmin"
            exact-active-class="bg-emerald-600 !text-white shadow-md shadow-emerald-600/20 font-extrabold"
            class="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-emerald-50/80 hover:text-emerald-700 font-bold text-xs transition-all group cursor-pointer"
            @click="emit('close')"
          >
            <div class="flex items-center gap-2.5">
              <FolderTree :size="18" />
              <span>Kategori</span>
            </div>
            <ChevronRight :size="14" class="opacity-0 group-hover:opacity-100 transition-opacity" />
          </router-link>

          <!-- Transaksi Sewa -->
          <router-link 
            to="/rentaladmin"
            exact-active-class="bg-emerald-600 !text-white shadow-md shadow-emerald-600/20 font-extrabold"
            class="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-emerald-50/80 hover:text-emerald-700 font-bold text-xs transition-all group cursor-pointer"
            @click="emit('close')"
          >
            <div class="flex items-center gap-2.5">
              <ShoppingBag :size="18" />
              <span>Transaksi Sewa</span>
            </div>
            <ChevronRight :size="14" class="opacity-0 group-hover:opacity-100 transition-opacity" />
          </router-link>

          <!-- Data Pelanggan -->
          <router-link 
            to="/usersadmin"
            exact-active-class="bg-emerald-600 !text-white shadow-md shadow-emerald-600/20 font-extrabold"
            class="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-emerald-50/80 hover:text-emerald-700 font-bold text-xs transition-all group cursor-pointer"
            @click="emit('close')"
          >
            <div class="flex items-center gap-2.5">
              <Users :size="18" />
              <span>Data Pelanggan</span>
            </div>
            <ChevronRight :size="14" class="opacity-0 group-hover:opacity-100 transition-opacity" />
          </router-link>

          <!-- Laporan -->
          <router-link 
            to="/reportsadmin"
            exact-active-class="bg-emerald-600 !text-white shadow-md shadow-emerald-600/20 font-extrabold"
            class="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-emerald-50/80 hover:text-emerald-700 font-bold text-xs transition-all group cursor-pointer"
            @click="emit('close')"
          >
            <div class="flex items-center gap-2.5">
              <FileText :size="18" />
              <span>Laporan</span>
            </div>
            <ChevronRight :size="14" class="opacity-0 group-hover:opacity-100 transition-opacity" />
          </router-link>

          <!-- Pengaturan Section -->
          <p class="text-[10px] font-black uppercase tracking-wider text-slate-400 px-3 pt-5 mb-2">
            Akses Publik & Pengaturan
          </p>

          <!-- Lihat Katalog Publik -->
          <router-link 
            to="/catalog"
            exact-active-class="bg-emerald-600 !text-white shadow-md shadow-emerald-600/20 font-extrabold"
            class="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-emerald-50/80 hover:text-emerald-700 font-bold text-xs transition-all group cursor-pointer"
            @click="emit('close')"
          >
            <div class="flex items-center gap-2.5">
              <Sparkles :size="18" class="text-amber-500" />
              <span>Halaman Katalog</span>
            </div>
            <ChevronRight :size="14" class="opacity-0 group-hover:opacity-100 transition-opacity" />
          </router-link>

          <!-- Pengaturan -->
          <router-link 
            to="/settingsadmin"
            exact-active-class="bg-emerald-600 !text-white shadow-md shadow-emerald-600/20 font-extrabold"
            class="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-emerald-50/80 hover:text-emerald-700 font-bold text-xs transition-all group cursor-pointer"
            @click="emit('close')"
          >
            <div class="flex items-center gap-2.5">
              <Settings :size="18" />
              <span>Pengaturan</span>
            </div>
            <ChevronRight :size="14" class="opacity-0 group-hover:opacity-100 transition-opacity" />
          </router-link>
        </nav>
      </div>

      <!-- Footer: Profile & Logout Button -->
      <div class="border-t border-slate-100 pt-4 space-y-3">
        <div class="flex items-center gap-3 p-2.5 bg-slate-50/80 rounded-2xl border border-slate-100">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-black flex items-center justify-center text-sm shadow-xs shrink-0">
            {{ adminUser.name ? adminUser.name.charAt(0).toUpperCase() : 'A' }}
          </div>
          <div class="overflow-hidden">
            <p class="text-xs font-bold text-slate-800 truncate">{{ adminUser.name || 'Administrator' }}</p>
            <p class="text-[10px] font-semibold text-emerald-600 truncate">Super Admin</p>
          </div>
        </div>

        <button
          type="button"
          @click="emit('logout')"
          class="w-full bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/80 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer active:scale-95 shadow-2xs"
        >
          <LogOut :size="16" />
          <span>Keluar Akun</span>
        </button>
      </div>

    </aside>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');

/* Hide scrollbar */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>