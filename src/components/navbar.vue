<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Tent, LogOut, History, LogIn, UserPlus, ShoppingCart, ChevronDown, Mail, Phone } from 'lucide-vue-next';
import { useCart } from '../utils/cart';
import API from '../utils/axios';

const router = useRouter();
const user = ref(null);
const isLoggedIn = ref(false);
const isProfileOpen = ref(false);
const { cartCount } = useCart();
const apiOrigin = (API.defaults.baseURL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api')
  .replace(/\/api\/?$/, '');

const getAvatarUrl = (avatar) => {
  if (!avatar || typeof avatar !== 'string') return '';
  if (avatar.startsWith('data:') || avatar.startsWith('blob:') || avatar.startsWith('http')) return avatar;
  const normalizedPath = avatar.replace(/^\//, '');
  return `${apiOrigin}/${normalizedPath.startsWith('storage/') ? normalizedPath : `storage/${normalizedPath}`}`;
};

const getUserAvatar = (currentUser) => getAvatarUrl(
  currentUser?.photo
    || currentUser?.avatar
    || currentUser?.photo_url
    || currentUser?.avatar_url
    || currentUser?.profile_photo
    || currentUser?.profile_image
    || currentUser?.image
);

const getAvatarStorageKey = (currentUser) => {
  const identity = currentUser?.id || currentUser?.email;
  return identity ? `camprent_avatar_${identity}` : '';
};

const loadUser = () => {
  const userData = localStorage.getItem('user');
  if (!userData) return;

  try {
    user.value = JSON.parse(userData);
    isLoggedIn.value = true;
  } catch (e) {
    user.value = null;
    isLoggedIn.value = false;
  }
};

onMounted(() => {
  const token = localStorage.getItem('token');

  if (token) loadUser();
  window.addEventListener('profile-updated', loadUser);
});

const handleLogout = () => {
  const avatar = getUserAvatar(user.value);
  const avatarStorageKey = getAvatarStorageKey(user.value);
  if (avatar && avatarStorageKey) {
    localStorage.setItem(avatarStorageKey, avatar);
  }
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  isLoggedIn.value = false;
  user.value = null;
  isProfileOpen.value = false;
  router.push('/');
};

const toggleProfile = () => {
  isProfileOpen.value = !isProfileOpen.value;
};

const maskEmail = (email) => {
  if (!email) return 'Email belum tersedia';
  const [name, domain] = email.split('@');
  if (!domain) return email;
  return `${name.charAt(0)}***@${domain}`;
};

const maskPhone = (phone) => {
  if (!phone) return 'Nomor telepon belum tersedia';
  const value = String(phone);
  return `${'*'.repeat(Math.max(0, value.length - 4))}${value.slice(-4)}`;
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
  <nav class="sticky top-0 z-50 bg-[#fbfefc]/90 backdrop-blur-xl border-b border-emerald-100/80 shadow-[0_8px_30px_-20px_rgba(6,78,59,0.45)]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex justify-between items-center gap-4">
      
      <!-- Brand Logo -->
      <router-link to="/" class="flex items-center gap-2.5 group cursor-pointer shrink-0" aria-label="Kembali ke halaman awal">
        <div class="relative bg-gradient-to-tr from-emerald-600 to-teal-500 p-2.5 rounded-[0.9rem] text-white shadow-md shadow-emerald-600/20 group-hover:rotate-3 group-hover:scale-105 transition-transform">
          <Tent :size="22" class="stroke-[2.5]" />
          <span class="absolute -right-1 -top-1 w-2.5 h-2.5 rounded-full bg-lime-300 border-2 border-white"></span>
        </div>
        <div class="flex flex-col">
          <span class="text-lg sm:text-xl font-black tracking-tight bg-gradient-to-r from-emerald-800 to-teal-600 bg-clip-text text-transparent">
            CampRent
          </span>
          <span class="hidden sm:block text-[9px] font-bold text-emerald-600/70 tracking-[0.16em] uppercase -mt-1">Outdoor Gear</span>
        </div>
      </router-link>

      <!-- Navigation Links & Auth State -->
      <div class="flex items-center gap-1 sm:gap-1.5 bg-emerald-50/70 border border-emerald-100 rounded-[1.1rem] p-1">
        
        <!-- KONDISI 1: JIKA BELUM LOGIN (Sebagai Tamu) -->
        <template v-if="!isLoggedIn">
          <router-link 
            to="/login" 
            class="px-3 py-2 rounded-[0.85rem] text-xs font-bold text-emerald-700 bg-white hover:bg-emerald-100 border border-emerald-100 transition flex items-center gap-1.5 shadow-sm"
          >
            <LogIn :size="15" />
            <span>Masuk</span>
          </router-link>

          <router-link 
            to="/register" 
            class="px-3 py-2 rounded-[0.85rem] text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
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
            class="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-[0.85rem] text-xs font-bold text-slate-600 hover:text-emerald-700 hover:bg-white transition"
          >
            <History :size="16" />
            <span class="hidden sm:inline">Riwayat Sewa</span>
          </router-link>

          <router-link
            to="/cart"
            active-class="bg-white text-emerald-700 shadow-sm"
            class="relative flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-[0.85rem] text-xs font-bold text-slate-600 hover:text-emerald-700 hover:bg-white transition"
            aria-label="Buka keranjang"
          >
            <ShoppingCart :size="16" />
            <span class="hidden sm:inline">Keranjang</span>
            <span class="min-w-4 h-4 px-1 rounded-full bg-emerald-600 text-white text-[9px] flex items-center justify-center font-black">{{ cartCount }}</span>
          </router-link>

          <div class="relative">
            <button
              type="button"
              @click="toggleProfile"
              class="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-white px-2 sm:px-3 py-2 rounded-[0.85rem] border border-emerald-100 shadow-sm hover:border-emerald-300 transition cursor-pointer"
              :aria-expanded="isProfileOpen"
              aria-label="Lihat data diri"
            >
              <span class="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-black overflow-hidden ring-2 ring-white">
                <img v-if="getUserAvatar(user)" :src="getUserAvatar(user)" alt="Foto profil" class="w-full h-full object-cover" />
                <span v-else>{{ user?.name?.charAt(0)?.toUpperCase() || 'P' }}</span>
              </span>
              <strong class="hidden sm:inline text-emerald-700 font-bold">{{ user?.name || 'Petualang' }}</strong>
              <ChevronDown :size="15" class="text-emerald-600 transition-transform" :class="{ 'rotate-180': isProfileOpen }" />
            </button>

            <div
              v-if="isProfileOpen"
              class="absolute right-0 top-full mt-2 w-72 max-w-[calc(100vw-2rem)] bg-white border border-emerald-100 rounded-2xl shadow-xl shadow-emerald-900/10 p-4 z-50"
            >
              <div class="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div class="w-11 h-11 rounded-full bg-emerald-600 text-white flex items-center justify-center text-lg font-black overflow-hidden ring-2 ring-emerald-100">
                  <img v-if="getUserAvatar(user)" :src="getUserAvatar(user)" alt="Foto profil" class="w-full h-full object-cover" />
                  <span v-else>{{ user?.name?.charAt(0)?.toUpperCase() || 'P' }}</span>
                </div>
                <div class="min-w-0">
                  <p class="font-black text-slate-800 truncate">{{ user?.name || 'Petualang' }}</p>
                  <p class="text-[11px] text-emerald-600 font-bold uppercase tracking-wider">{{ user?.role || 'user' }}</p>
                </div>
              </div>

              <div class="space-y-3 pt-3 text-xs">
                <div class="flex items-center gap-2.5 text-slate-600">
                  <Mail :size="16" class="text-emerald-600 shrink-0" />
                  <span class="truncate">{{ maskEmail(user?.email) }}</span>
                </div>
                <div class="flex items-center gap-2.5 text-slate-600">
                  <Phone :size="16" class="text-emerald-600 shrink-0" />
                  <span>{{ maskPhone(user?.phone_number) }}</span>
                </div>
                <button
                  type="button"
                  @click="router.push('/profile')"
                  class="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-xl font-bold transition cursor-pointer"
                >
                  Edit Profil
                </button>
                <button
                  type="button"
                  @click="handleLogout"
                  class="w-full bg-white hover:bg-rose-50 text-rose-600 border border-rose-100 px-3 py-2 rounded-xl font-bold transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <LogOut :size="15" />
                  Keluar
                </button>
              </div>
            </div>
          </div>
        </template>

      </div>

    </div>
  </nav>
</template>