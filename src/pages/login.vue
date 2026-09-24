<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { LogIn, Tent, Mail, Lock, Sparkles, ShieldCheck, Eye, EyeOff } from 'lucide-vue-next';
import API from '../utils/axios';

const router = useRouter();

const formData = ref({
  email: '',
  password: '',
});

const error = ref('');
const loading = ref(false);
const showPassword = ref(false);

const getAvatarStorageKey = (currentUser) => {
  const identity = currentUser?.id || currentUser?.email;
  return identity ? `camprent_avatar_${identity}` : '';
};

const handleSubmit = async () => {
  error.value = '';
  loading.value = true;

  try {
    const response = await API.post('/login', formData.value);

    // Ambil token dari berbagai struktur response Laravel (token / access_token / data.token)
    const token = response.data.token || response.data.access_token || response.data.data?.token;
    const user = response.data.user || response.data.data?.user || response.data.data || {};

    if (!token) {
      throw new Error('Token authentication tidak ditemukan dari server.');
    }

    const avatarStorageKey = getAvatarStorageKey(user);
    const savedAvatar = avatarStorageKey ? localStorage.getItem(avatarStorageKey) : '';
    const userWithAvatar = savedAvatar && !(
      user.photo || user.avatar || user.photo_url || user.avatar_url
    )
      ? { ...user, avatar: savedAvatar, photo: savedAvatar, photo_url: savedAvatar }
      : user;

    // Simpan token dan data user yang valid ke LocalStorage
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userWithAvatar));

    alert('Login berhasil!');

    // Redirect berdasarkan role
    if (userWithAvatar?.role === 'admin') {
      router.push('/dashboardadmin');
    } else {
      router.push('/');
    }
  } catch (err) {
    console.error('Login Error:', err);
    error.value = err.response?.data?.message || err.message || 'Email atau password salah, silakan coba lagi.';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen flex bg-[#f4faf6] font-['Plus_Jakarta_Sans',sans-serif] overflow-hidden">
    <!-- Banner Kiri (Gambar Cerah Bergerak + Gradient Overlay) -->
    <div class="hidden lg:flex lg:w-7/12 relative items-center justify-center overflow-hidden">
      <!-- Background Image Bergerak (Pan Animation) -->
      <div 
        class="absolute inset-0 bg-cover bg-center animate-pan-bg scale-105"
        style="background-image: url('https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80&fm=webp');"
      ></div>

      <!-- Overlay Tint Hijau Alam & Putih Cerah -->
      <div class="absolute inset-0 bg-gradient-to-tr from-emerald-950/60 via-emerald-800/35 to-emerald-100/10 backdrop-blur-[1px]"></div>

      <!-- Brand Content Sisi Kiri -->
      <div class="relative z-10 p-12 text-white max-w-xl flex flex-col justify-between h-full py-16">
        <!-- Logo Header -->
        <div class="flex items-center gap-3">
          <div class="bg-white/25 p-3 rounded-2xl backdrop-blur-md border border-white/40 shadow-xl animate-float">
            <Tent :size="32" class="text-white" />
          </div>
          <span class="text-2xl font-black tracking-wide text-white drop-shadow-sm">
            CampRent
          </span>
        </div>

        <!-- Headline & Badges Melayang -->
        <div class="space-y-6">
          <h1 class="text-5xl font-extrabold leading-tight tracking-tight text-white drop-shadow-md">
            Selamat Datang <br />
            <span class="text-emerald-200">Kembali Petualang!</span>
          </h1>
          <p class="text-emerald-50 text-sm leading-relaxed max-w-md backdrop-blur-md bg-white/15 p-4 rounded-2xl border border-white/20 shadow-lg">
            Masuk ke akunmu untuk melanjutkan pemesanan, mengecek status sewa, dan menjelajah perlengkapan camping terbaru.
          </p>

          <!-- Floating Badges -->
          <div class="flex gap-3 pt-2">
            <div class="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30 text-xs font-semibold text-white shadow-md animate-float">
              <Sparkles :size="16" class="text-amber-300" />
              <span>Sewa Instan & Mudah</span>
            </div>
            <div class="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30 text-xs font-semibold text-white shadow-md animate-float-delay">
              <ShieldCheck :size="16" class="text-emerald-300" />
              <span>Transaksi 100% Aman</span>
            </div>
          </div>
        </div>

        <p class="text-xs text-emerald-100/80 font-medium">© CampRent Outdoor Gear. Premium Experience.</p>
      </div>
    </div>

    <!-- Sisi Kanan: Form Login -->
    <div class="w-full lg:w-5/12 flex items-center justify-center p-6 sm:p-10 bg-gradient-to-br from-white via-emerald-50/40 to-teal-50/50 relative">
      <div class="w-full max-w-md space-y-6 bg-white/90 backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl shadow-emerald-900/10 border border-emerald-100">
        
        <!-- Logo Mobile -->
        <div class="flex items-center gap-2 text-emerald-700 lg:hidden mb-2">
          <Tent :size="28" />
          <span class="text-xl font-bold tracking-tight">CampRent</span>
        </div>

        <div>
          <h2 class="text-3xl font-extrabold text-slate-800 tracking-tight">Masuk Akun</h2>
          <p class="text-xs text-slate-500 font-medium mt-1">Masukkan email dan password kamu untuk melanjutkan</p>
        </div>

        <!-- Alert Error -->
        <div v-if="error" class="bg-rose-50 border border-rose-200 text-rose-600 p-3 text-xs rounded-xl font-medium animate-pulse">
          {{ error }}
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Email -->
          <div>
            <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email</label>
            <div class="relative">
              <Mail class="absolute left-3.5 top-3 text-slate-400" :size="18" />
              <input
                v-model="formData.email"
                type="email"
                required
                placeholder="nama@email.com"
                class="w-full pl-10 pr-4 py-2.5 bg-emerald-50/40 border border-emerald-100 text-slate-800 placeholder-slate-400 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:bg-white outline-none transition-all duration-200 shadow-sm"
              />
            </div>
          </div>

          <!-- Password -->
          <div>
            <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Password</label>
            <div class="relative">
              <Lock class="absolute left-3.5 top-3 text-slate-400" :size="18" />
              <input
                v-model="formData.password"
                :type="showPassword ? 'text' : 'password'"
                required
                placeholder="••••••••"
                class="w-full pl-10 pr-11 py-2.5 bg-emerald-50/40 border border-emerald-100 text-slate-800 placeholder-slate-400 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:bg-white outline-none transition-all duration-200 shadow-sm"
              />
              <button type="button" :aria-label="showPassword ? 'Sembunyikan password' : 'Tampilkan password'" @click="showPassword = !showPassword" class="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-emerald-600 transition cursor-pointer">
                <EyeOff v-if="showPassword" :size="17" />
                <Eye v-else :size="17" />
              </button>
            </div>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/40 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 cursor-pointer mt-4"
          >
            <LogIn :size="18" />
            {{ loading ? 'Memproses Masuk...' : 'Masuk Sekarang' }}
          </button>
        </form>

        <p class="text-center text-xs font-semibold text-slate-500 border-t border-slate-100 pt-4">
          Belum punya akun?
          <router-link to="/register" class="text-emerald-600 font-bold hover:text-emerald-700 hover:underline ml-1">
            Daftar di sini
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

@keyframes pan-bg {
  0% { transform: scale(1.05) translate(0%, 0%); }
  50% { transform: scale(1.15) translate(-2%, -1%); }
  100% { transform: scale(1.05) translate(0%, 0%); }
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-6px); }
}

.animate-pan-bg {
  animation: pan-bg 22s ease-in-out infinite alternate;
}

.animate-float {
  animation: float 4s ease-in-out infinite;
}

.animate-float-delay {
  animation: float 4s ease-in-out 2s infinite;
}
</style>