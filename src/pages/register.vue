<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { UserPlus, Tent, Mail, Lock, User, Phone, Sparkles, ShieldCheck } from 'lucide-vue-next';
import API from '../utils/axios';
import { addAdminNotification } from '../utils/notifications';

const router = useRouter();

const formData = ref({
  name: '',
  phone_number: '',
  email: '',
  password: '',
  role: 'user',
});

const error = ref('');
const loading = ref(false);

const handleSubmit = async () => {
  error.value = '';
  loading.value = true;

  try {
    const response = await API.post('/register', formData.value);

    if (response.data && response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    addAdminNotification({
      title: 'Pelanggan baru',
      message: `${formData.value.name} berhasil mendaftar akun baru.`,
      type: 'success'
    });
    alert('Registrasi berhasil! Silakan login.');
    router.push('/login');
  } catch (err) {
    // Penanganan error yang lebih aman dan robust di baris 25
    if (err.response && err.response.data) {
      if (err.response.data.message) {
        error.value = err.response.data.message;
      } else if (err.response.data.errors) {
        // Ambil error validasi pertama dari Laravel jika ada
        const firstKey = Object.keys(err.response.data.errors)[0];
        error.value = err.response.data.errors[firstKey][0];
      } else {
        error.value = 'Registrasi gagal, periksa kembali data Anda.';
      }
    } else {
      error.value = 'Terjadi kesalahan koneksi ke server.';
    }
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
        style="background-image: url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&fm=webp');"
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
            Petualangan Seru <br />
            <span class="text-emerald-200">Dimulai Dari Sini.</span>
          </h1>
          <p class="text-emerald-50 text-sm leading-relaxed max-w-md backdrop-blur-md bg-white/15 p-4 rounded-2xl border border-white/20 shadow-lg">
            Nikmati kemudahan menyewa tenda, alat hiking, dan perlengkapan camping berkualitas premium dalam satu platform.
          </p>

          <!-- Floating Badges -->
          <div class="flex gap-3 pt-2">
            <div class="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30 text-xs font-semibold text-white shadow-md animate-float">
              <Sparkles :size="16" class="text-amber-300" />
              <span>Alat Steril & Bersih</span>
            </div>
            <div class="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30 text-xs font-semibold text-white shadow-md animate-float-delay">
              <ShieldCheck :size="16" class="text-emerald-300" />
              <span>Sewa Cepat & Praktis</span>
            </div>
          </div>
        </div>

        <p class="text-xs text-emerald-100/80 font-medium">© CampRent Outdoor Gear. Premium Experience.</p>
      </div>
    </div>

    <!-- Sisi Kanan: Form Pendaftaran (Bright Clean Glassmorphic) -->
    <div class="w-full lg:w-5/12 flex items-center justify-center p-6 sm:p-10 bg-gradient-to-br from-white via-emerald-50/40 to-teal-50/50 relative">
      <div class="w-full max-w-md space-y-6 bg-white/90 backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl shadow-emerald-900/10 border border-emerald-100">
        
        <!-- Logo Mobile -->
        <div class="flex items-center gap-2 text-emerald-700 lg:hidden mb-2">
          <Tent :size="28" />
          <span class="text-xl font-bold tracking-tight">CampRent</span>
        </div>

        <div>
          <h2 class="text-3xl font-extrabold text-slate-800 tracking-tight">Daftar Akun</h2>
          <p class="text-xs text-slate-500 font-medium mt-1">Lengkapi data diri kamu untuk mulai memilih alat camping</p>
        </div>

        <!-- Alert Error -->
        <div v-if="error" class="bg-rose-50 border border-rose-200 text-rose-600 p-3 text-xs rounded-xl font-medium animate-pulse">
          {{ error }}
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Nama Lengkap -->
          <div>
            <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nama Lengkap</label>
            <div class="relative">
              <User class="absolute left-3.5 top-3 text-slate-400" :size="18" />
              <input
                v-model="formData.name"
                type="text"
                required
                placeholder="Nama Lengkap Kamu"
                class="w-full pl-10 pr-4 py-2.5 bg-emerald-50/40 border border-emerald-100 text-slate-800 placeholder-slate-400 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:bg-white outline-none transition-all duration-200 shadow-sm"
              />
            </div>
          </div>

          <!-- Nomor WhatsApp -->
          <div>
            <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nomor WhatsApp</label>
            <div class="relative">
              <Phone class="absolute left-3.5 top-3 text-slate-400" :size="18" />
              <input
                v-model="formData.phone_number"
                type="tel"
                required
                placeholder="081234567890"
                class="w-full pl-10 pr-4 py-2.5 bg-emerald-50/40 border border-emerald-100 text-slate-800 placeholder-slate-400 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:bg-white outline-none transition-all duration-200 shadow-sm"
              />
            </div>
          </div>

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
                type="password"
                required
                placeholder="••••••••"
                class="w-full pl-10 pr-4 py-2.5 bg-emerald-50/40 border border-emerald-100 text-slate-800 placeholder-slate-400 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:bg-white outline-none transition-all duration-200 shadow-sm"
              />
            </div>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/40 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 cursor-pointer mt-4"
          >
            <UserPlus :size="18" />
            {{ loading ? 'Memproses Data...' : 'Daftar Akun Sekarang' }}
          </button>
        </form>

        <p class="text-center text-xs font-semibold text-slate-500 border-t border-slate-100 pt-4">
          Sudah memiliki akun?
          <router-link to="/login" class="text-emerald-600 font-bold hover:text-emerald-700 hover:underline ml-1">
            Masuk di sini
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