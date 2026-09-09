<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Tent, LogOut, History, ShoppingBag } from 'lucide-vue-next';

const router = useRouter();
const user = ref({});

onMounted(() => {
  const userData = localStorage.getItem('user');
  if (userData) {
    user.value = JSON.parse(userData);
  }
});

const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  router.push('/login');
};
</script>

<template>
  <nav class="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-emerald-100/80 shadow-xs">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex justify-between items-center">
      
      <!-- Brand Logo -->
      <router-link to="/catalog" class="flex items-center gap-3 group cursor-pointer">
        <div class="bg-gradient-to-tr from-emerald-600 to-teal-500 p-2.5 rounded-2xl text-white shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
          <Tent :size="22" class="stroke-[2.5]" />
        </div>
        <div class="flex flex-col">
          <span class="text-xl font-black tracking-tight bg-gradient-to-r from-emerald-800 to-teal-600 bg-clip-text text-transparent">
            CampRent
          </span>
          <span class="text-[10px] font-bold text-slate-400 tracking-wider uppercase -mt-1">Outdoor Gear</span>
        </div>
      </router-link>

      <!-- Navigation Links & User Profile -->
      <div class="flex items-center gap-3 sm:gap-4">
        <!-- Link Riwayat Transaksi -->
        <router-link 
          to="/history" 
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition"
        >
          <History :size="16" />
          <span class="hidden sm:inline">Riwayat Sewa</span>
        </router-link>

        <div class="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-100/80 px-3.5 py-1.5 rounded-full border border-slate-200/60">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Halo, <strong class="text-emerald-700 font-bold">{{ user.name || 'Petualang' }}</strong></span>
        </div>

        <button
          @click="handleLogout"
          class="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-2xs"
        >
          <LogOut :size="15" />
          <span class="hidden sm:inline">Keluar</span>
        </button>
      </div>

    </div>
  </nav>
</template>