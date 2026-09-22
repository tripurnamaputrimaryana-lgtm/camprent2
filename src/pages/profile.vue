<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { User, Mail, Phone, Camera, Save, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-vue-next';
import Navbar from '../components/navbar.vue';
import Footer from '../components/footer.vue';
import API from '../utils/axios';

const router = useRouter();
const loading = ref(false);
const saving = ref(false);
const errorMessage = ref('');
const successMessage = ref('');
const user = ref({
  id: '',
  name: '',
  email: '',
  phone_number: '',
  role: 'user',
  avatar: '',
  password: ''
});
const avatarFile = ref(null);
const avatarPreview = ref('');

const handleBack = () => {
  router.push('/catalog');
};

const getUserFromStorage = () => {
  const token = localStorage.getItem('token');
  const userData = localStorage.getItem('user');

  if (!token || !userData) {
    router.push('/login');
    return;
  }

  try {
    const parsed = JSON.parse(userData);
    user.value = {
      id: parsed.id || '',
      name: parsed.name || '',
      email: parsed.email || '',
      phone_number: parsed.phone_number || '',
      role: parsed.role || 'user',
      avatar: parsed.avatar || parsed.photo || parsed.profile_photo || parsed.profile_image || parsed.image || ''
    };
    avatarPreview.value = parsed.avatar || parsed.photo || parsed.profile_photo || parsed.profile_image || parsed.image || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(parsed.name || 'User');
  } catch (error) {
    router.push('/login');
  }
};

const handleAvatarChange = (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  avatarFile.value = file;
  const fileReader = new FileReader();
  fileReader.onload = () => {
    avatarPreview.value = fileReader.result;
  };
  fileReader.readAsDataURL(file);
};

const handleSubmit = async () => {
  saving.value = true;
  errorMessage.value = '';
  successMessage.value = '';

  try {
    const payload = new FormData();
    payload.append('name', user.value.name || '');
    payload.append('email', user.value.email || '');
    payload.append('phone_number', user.value.phone_number || '');
    payload.append('role', user.value.role || 'user');
    payload.append('_method', 'PUT');

    if (user.value.password && user.value.password.trim()) {
      payload.append('password', user.value.password.trim());
    }

    if (avatarFile.value) {
      payload.append('photo', avatarFile.value);
    }

    const response = await API.post(`/users/${user.value.id}`, payload, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    const updatedUser = response.data?.user || response.data?.data?.user || {
      ...JSON.parse(localStorage.getItem('user') || '{}'),
      ...user.value
    };
    if (avatarFile.value && avatarPreview.value) {
      updatedUser.photo = avatarPreview.value;
    }
    localStorage.setItem('user', JSON.stringify(updatedUser));
    user.value = {
      ...user.value,
      ...updatedUser,
      avatar: updatedUser.avatar || updatedUser.photo || updatedUser.profile_photo || updatedUser.profile_image || updatedUser.image || user.value.avatar
    };
    window.dispatchEvent(new Event('profile-updated'));

    successMessage.value = 'Profil berhasil diperbarui.';
    avatarFile.value = null;
  } catch (err) {
    console.error('Gagal update profil:', err);
    const validationErrors = err.response?.data?.errors;
    const firstValidationError = validationErrors
      ? Object.values(validationErrors).flat()[0]
      : '';
    errorMessage.value = firstValidationError || err.response?.data?.message || 'Gagal memperbarui profil.';
  } finally {
    saving.value = false;
  }
};

onMounted(() => {
  getUserFromStorage();
});
</script>

<template>
  <div class="min-h-screen bg-[#f4faf6] font-['Plus_Jakarta_Sans',sans-serif] text-slate-800">
    <Navbar />

    <main class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div class="bg-white rounded-[2rem] border border-emerald-100 shadow-[0_24px_60px_-30px_rgba(16,185,129,0.35)] overflow-hidden">
        <div class="bg-gradient-to-br from-emerald-50 via-white to-teal-50 px-6 py-8 sm:px-8 text-slate-800 border-b border-emerald-100">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/20">
                <User :size="22" />
              </div>
              <div>
                <p class="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700">Akun Saya</p>
                <h1 class="text-2xl font-black tracking-tight text-slate-900">Edit Profil</h1>
                <p class="text-xs text-slate-500 mt-1">Perbarui informasi diri dan foto profilmu.</p>
              </div>
            </div>
            <button
              type="button"
              @click="handleBack"
              class="self-start sm:self-auto bg-white hover:bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-sm"
            >
              <ArrowLeft :size="15" />
              Kembali
            </button>
          </div>
        </div>

        <div class="p-6 sm:p-8">
          <div v-if="errorMessage" class="mb-5 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-2">
            <AlertCircle :size="15" />
            <span>{{ errorMessage }}</span>
          </div>

          <div v-if="successMessage" class="mb-5 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-bold flex items-center gap-2">
            <CheckCircle2 :size="15" />
            <span>{{ successMessage }}</span>
          </div>

          <form @submit.prevent="handleSubmit" class="space-y-6">
            <div class="flex flex-col sm:flex-row items-start gap-6 bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 sm:p-5">
              <div class="flex flex-col items-center shrink-0">
                <div class="w-28 h-28 rounded-full border-4 border-white bg-emerald-50 overflow-hidden shadow-lg shadow-emerald-900/10 ring-2 ring-emerald-100">
                  <img :src="avatarPreview || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name || 'User')" alt="Foto profil" class="w-full h-full object-cover" />
                </div>
                <label class="mt-3 cursor-pointer inline-flex items-center gap-2 bg-white text-emerald-700 border border-emerald-200 px-3 py-2 rounded-xl text-xs font-bold hover:bg-emerald-100 transition shadow-sm">
                  <Camera :size="15" />
                  Pilih Foto
                  <input type="file" accept="image/*" @change="handleAvatarChange" class="hidden" />
                </label>
              </div>

              <div class="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <div class="md:col-span-2">
                  <label class="block text-[11px] font-black uppercase tracking-[0.16em] text-slate-500 mb-1.5">Nama Lengkap</label>
                  <div class="relative">
                    <User class="absolute left-3.5 top-3 text-slate-400" :size="18" />
                    <input v-model="user.name" type="text" required class="w-full pl-10 pr-4 py-2.5 bg-emerald-50/40 border border-emerald-100 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:bg-white outline-none" />
                  </div>
                </div>

                <div>
                  <label class="block text-[11px] font-black uppercase tracking-[0.16em] text-slate-500 mb-1.5">Email</label>
                  <div class="relative">
                    <Mail class="absolute left-3.5 top-3 text-slate-400" :size="18" />
                    <input v-model="user.email" type="email" required class="w-full pl-10 pr-4 py-2.5 bg-emerald-50/40 border border-emerald-100 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:bg-white outline-none" />
                  </div>
                </div>

                <div>
                  <label class="block text-[11px] font-black uppercase tracking-[0.16em] text-slate-500 mb-1.5">Nomor Telepon</label>
                  <div class="relative">
                    <Phone class="absolute left-3.5 top-3 text-slate-400" :size="18" />
                    <input v-model="user.phone_number" type="tel" required class="w-full pl-10 pr-4 py-2.5 bg-emerald-50/40 border border-emerald-100 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:bg-white outline-none" />
                  </div>
                </div>

                <div class="md:col-span-2">
                  <label class="block text-[11px] font-black uppercase tracking-[0.16em] text-slate-500 mb-1.5">Password Baru (opsional)</label>
                  <input v-model="user.password" type="password" placeholder="Isi jika ingin ganti password" class="w-full px-4 py-2.5 bg-emerald-50/40 border border-emerald-100 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:bg-white outline-none" />
                </div>

                <div class="md:col-span-2">
                  <label class="block text-[11px] font-black uppercase tracking-[0.16em] text-slate-500 mb-1.5">Role</label>
                  <input v-model="user.role" type="text" disabled class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-500" />
                </div>
              </div>
            </div>

            <div class="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="submit"
                :disabled="saving"
                class="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-lg shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
              >
                <Save :size="16" />
                {{ saving ? 'Menyimpan...' : 'Simpan Perubahan' }}
              </button>
            </div>

          </form>
        </div>
      </div>
    </main>

    <Footer />
  </div>
</template>
