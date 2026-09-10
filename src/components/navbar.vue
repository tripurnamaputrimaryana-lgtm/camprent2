<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Tent, LogOut, History, LogIn, UserPlus } from 'lucide-vue-next';

const router = useRouter();
const user = ref(null);
const isLoggedIn = ref(false);

onMounted(() => {
  const token = localStorage.getItem('token');
  const userData = localStorage.getItem('user');
  
  if (token && userData) {
    try {
      user.value = JSON.parse(userData);
      isLoggedIn.value = true;
    } catch (e) {
      user.value = null;
      isLoggedIn.value = false;
    }
  }
});

const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  isLoggedIn.value = false;
  user.value = null;
  router.push('/');
};

const handleHistoryClick = (e) => {
  if (!isLoggedIn.value) {
    e.preventDefault();
    alert('Silakan login terlebih dahulu untuk melihat riwayat sewa!');
    router.push('/login');
  }
};
</script>

<template>
  <nav class="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-emerald-100/80 shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center gap-4">
      
      <!-- Brand Logo -->
      <router-link to="/catalog" class="flex items-center gap-3 group cursor-pointer shrink-0">
        <div class="relative bg-gradient-to-tr from-emerald-600 to-teal-500 p-2.5 rounded-2xl text-white shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
          <Tent :size="22" class="stroke-[2.5]" />
          <span class="absolute -right-1 -top-1 w-2.5 h-2.5 rounded-full bg-lime-300 border-2 border-white"></span>
        </div>
        <div class="flex flex-col">
          <span class="text-xl font-black tracking-tight bg-gradient-to-r from-emerald-800 to-teal-600 bg-clip-text text-transparent">
            CampRent
          </span>
          <span class="text-[10px] font-bold text-emerald-600/70 tracking-wider uppercase -mt-1">Outdoor Gear</span>
        </div>
      </router-link>

      <!-- Navigation Links & Auth State -->
      <div class="flex items-center gap-1.5 sm:gap-2 bg-emerald-50/70 border border-emerald-100 rounded-2xl p-1.5">
        
        <!-- KONDISI 1: JIKA BELUM LOGIN (Sebagai Tamu) -->
        <template v-if="!isLoggedIn">
          <router-link 
            to="/login" 
            class="px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-700 bg-white hover:bg-emerald-100 border border-emerald-100 transition flex items-center gap-1.5 shadow-sm"
          >
            <LogIn :size="15" />
            <span>Masuk</span>
          </router-link>

          <router-link 
            to="/register" 
            class="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
          >
            <UserPlus :size="15" />
            <span class="hidden sm:inline">Daftar</span>
          </router-link>
        </template>

        <!-- KONDISI 2: JIKA SUDAH LOGIN -->
        <template v-else>
          <!-- Link Riwayat Transaksi -->
          <router-link 
            to="/history" 
            @click="handleHistoryClick"
            class="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-emerald-700 hover:bg-white transition"
          >
            <History :size="16" />
            <span class="hidden sm:inline">Riwayat Sewa</span>
          </router-link>

          <div class="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-600 bg-white px-3.5 py-2 rounded-xl border border-emerald-100 shadow-sm">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Halo, <strong class="text-emerald-700 font-bold">{{ user?.name || 'Petualang' }}</strong></span>
          </div>

          <button
            @click="handleLogout"
            class="bg-white hover:bg-rose-50 text-rose-600 border border-rose-100 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-sm"
          >
            <LogOut :size="15" />
            <span class="hidden sm:inline">Keluar</span>
          </button>
        </template>

      </div>

    </div>
  </nav>
</template>