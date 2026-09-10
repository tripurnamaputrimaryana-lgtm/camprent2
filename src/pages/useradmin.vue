<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { 
  Search, 
  Bell, 
  Menu, 
  X,
  Pencil,
  Trash2,
  AlertCircle,
  Eye,
  FileText,
  Mail,
  Phone,
  ShieldCheck
} from 'lucide-vue-next';
import api from '../utils/axios';
import SidebarAdmin from '../components/sidebaradmin.vue';
import NavbarAdmin from '../components/navbaradmin.vue';

const router = useRouter();

const users = ref([]);
const loading = ref(true);
const errorMessage = ref('');

const adminUser = ref(JSON.parse(localStorage.getItem('user') || '{}'));
const searchTerm = ref('');
const isSidebarOpen = ref(false);

// State Modal Detail Pelanggan
const showDetailModal = ref(false);
const selectedUser = ref(null);
const showEditModal = ref(false);
const isSubmitting = ref(false);
const editError = ref('');
const editForm = ref({ name: '', phone_number: '', email: '', role: 'user' });

const fetchData = async () => {
  loading.value = true;
  errorMessage.value = '';
  try {
    const res = await api.get('/users');
    users.value = res.data.data || res.data;
  } catch (err) {
    console.error('Gagal mengambil data pelanggan:', err);
    errorMessage.value = 'Gagal memuat data pelanggan dari server.';
  } finally {
    loading.value = false;
  }
};

// Computed property untuk pencarian berdasarkan nama atau email pelanggan
const filteredUsers = computed(() => {
  if (!searchTerm.value) return users.value;
  return users.value.filter(item => {
    const name = item.name || '';
    const email = item.email || '';
    const query = searchTerm.value.toLowerCase();
    return name.toLowerCase().includes(query) || email.toLowerCase().includes(query);
  });
});

// Buka Modal Detail
const openDetailModal = (item) => {
  selectedUser.value = item;
  showDetailModal.value = true;
};

const openEditModal = (item) => {
  selectedUser.value = item;
  editForm.value = {
    name: item.name || '',
    phone_number: item.phone_number || '',
    email: item.email || '',
    role: item.role || 'user'
  };
  editError.value = '';
  showEditModal.value = true;
};

const handleEdit = async () => {
  isSubmitting.value = true;
  editError.value = '';
  try {
    await api.put(`/users/${selectedUser.value.id}`, editForm.value);
    showEditModal.value = false;
    await fetchData();
  } catch (err) {
    editError.value = err.response?.data?.message || 'Gagal memperbarui data pelanggan.';
  } finally {
    isSubmitting.value = false;
  }
};

const handleDelete = async (user) => {
  if (!confirm(`Apakah kamu yakin ingin menghapus akun ${user.name || 'ini'}?`)) return;
  try {
    await api.delete(`/users/${user.id}`);
    await fetchData();
  } catch (err) {
    alert(err.response?.data?.message || 'Gagal menghapus data pelanggan.');
  }
};

const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  router.push('/login');
};

onMounted(() => {
  fetchData();
});
</script>

<template>
  <div class="min-h-screen bg-[#f4faf6] font-['Plus_Jakarta_Sans',sans-serif] text-slate-800 flex">
    
    <SidebarAdmin 
      :is-open="isSidebarOpen" 
      :admin-user="adminUser"
      @close="isSidebarOpen = false"
      @logout="handleLogout"
    />

    <div class="flex-1 flex flex-col min-w-0">
      
      <NavbarAdmin title="Kelola Data Pelanggan" :admin-user="adminUser" @menu="isSidebarOpen = true" @logout="handleLogout" />

      <main class="p-4 sm:p-8 space-y-6 max-w-7xl">
        
        <div class="relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-br from-emerald-100 via-white to-teal-50 rounded-[2rem] border border-emerald-100 p-6 shadow-lg shadow-emerald-900/5">
          <div class="absolute -right-12 -top-20 w-64 h-64 rounded-full bg-emerald-200/40 blur-3xl"></div>
          <div>
            <span class="relative text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">Customer Directory</span>
            <h1 class="relative text-2xl sm:text-3xl font-black text-slate-900 mt-1">Daftar Akun Pelanggan</h1>
            <p class="relative text-xs text-slate-600 font-medium mt-1">Kelola dan pantau pengguna yang terdaftar di sistem.</p>
          </div>
        </div>

        <!-- Alert Error jika ada -->
        <div v-if="errorMessage" class="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-rose-600 text-xs font-bold">
          <AlertCircle :size="18" class="shrink-0" />
          <span>{{ errorMessage }}</span>
        </div>

        <div class="bg-white rounded-3xl shadow-xl shadow-emerald-900/5 border border-emerald-100 overflow-hidden">
          <div class="p-5 sm:p-6 border-b border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="relative w-full sm:w-80">
              <Search class="absolute left-3.5 top-3 text-slate-400" :size="16" />
              <input 
                v-model="searchTerm" 
                type="text" 
                placeholder="Cari nama / email pelanggan..." 
                class="w-full pl-9 pr-4 py-2.5 bg-emerald-50/40 border border-emerald-100 text-slate-800 placeholder-slate-400 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:bg-white outline-none transition"
              />
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs border-collapse">
              <thead class="bg-emerald-50/60 text-emerald-800/60 uppercase font-extrabold tracking-wider border-b border-emerald-100">
                <tr>
                  <th class="p-4 pl-6">Nama Lengkap</th>
                  <th class="p-4">Email</th>
                  <th class="p-4">No. Telepon</th>
                  <th class="p-4">Role Akun</th>
                  <th class="p-4">Tanggal Bergabung</th>
                  <th class="p-4 text-center pr-6">Aksi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-emerald-50 text-slate-700 font-medium">
                <tr v-if="loading">
                  <td colspan="6" class="p-12 text-center text-slate-400">
                    <div class="inline-block w-6 h-6 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                    <p class="text-xs font-semibold">Mengambil data pelanggan dari server...</p>
                  </td>
                </tr>

                <tr v-else-if="filteredUsers.length === 0">
                  <td colspan="6" class="p-12 text-center text-slate-400">
                    Belum ada data pelanggan yang ditemukan.
                  </td>
                </tr>

                <tr v-else v-for="user in filteredUsers" :key="user.id" class="hover:bg-emerald-50/50 transition-colors">
                  <!-- Nama Lengkap -->
                  <td class="p-4 pl-6 font-bold text-slate-800">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xs shadow-xs shrink-0 border border-emerald-200">
                        {{ (user.name || 'U').charAt(0).toUpperCase() }}
                      </div>
                      <span class="truncate max-w-[180px]">{{ user.name }}</span>
                    </div>
                  </td>

                  <!-- Email -->
                  <td class="p-4 text-slate-500">
                    <div class="flex items-center gap-1.5">
                      <Mail :size="14" class="text-slate-400 shrink-0" />
                      <span class="truncate max-w-[180px]">{{ user.email }}</span>
                    </div>
                  </td>

                  <!-- No Telepon -->
                  <td class="p-4 text-slate-500">
                    <div class="flex items-center gap-1.5">
                      <Phone :size="14" class="text-slate-400 shrink-0" />
                      <span>{{ user.phone_number || '-' }}</span>
                    </div>
                  </td>

                  <!-- Role Akun -->
                  <td class="p-4">
                    <span :class="[
                      'px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase inline-flex items-center gap-1',
                      user.role === 'admin' ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                    ]">
                      <ShieldCheck :size="12" v-if="user.role === 'admin'" />
                      {{ user.role || 'customer' }}
                    </span>
                  </td>

                  <!-- Tanggal Bergabung -->
                  <td class="p-4 text-slate-500 whitespace-nowrap">
                    {{ user.created_at ? new Date(user.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-' }}
                  </td>

                  <!-- Aksi -->
                  <td class="p-4 text-center pr-6">
                    <div class="flex items-center justify-center gap-2">
                      <button 
                        @click="openDetailModal(user)" 
                        class="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 p-2 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs border border-emerald-100"
                        title="Lihat Detail Pelanggan"
                      >
                        <Eye :size="14" />
                      </button>
                      <button
                        @click="openEditModal(user)"
                        class="bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-100 p-2 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
                        title="Edit Pelanggan"
                      >
                        <Pencil :size="14" />
                      </button>
                      <button
                        @click="handleDelete(user)"
                        class="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 p-2 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
                        title="Hapus Pelanggan"
                      >
                        <Trash2 :size="14" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>

    <!-- Modal Edit Pelanggan -->
    <div v-if="showEditModal" class="fixed inset-0 z-50 bg-emerald-950/25 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-[2rem] w-full max-w-md p-6 shadow-2xl shadow-emerald-950/15 border border-emerald-100 space-y-5">
        <div class="flex items-center justify-between border-b border-emerald-100 pb-3">
          <h3 class="font-extrabold text-slate-900 text-base">Edit Data Pelanggan</h3>
          <button @click="showEditModal = false" class="text-slate-400 hover:text-slate-600 cursor-pointer"><X :size="18" /></button>
        </div>
        <div v-if="editError" class="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs font-bold">{{ editError }}</div>
        <form @submit.prevent="handleEdit" class="space-y-4">
          <div><label class="text-[11px] font-extrabold uppercase text-slate-500 block mb-1">Nama Lengkap</label><input v-model="editForm.name" required type="text" class="w-full px-3.5 py-2.5 bg-emerald-50/40 border border-emerald-100 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:bg-white outline-none" /></div>
          <div><label class="text-[11px] font-extrabold uppercase text-slate-500 block mb-1">Email</label><input v-model="editForm.email" required type="email" class="w-full px-3.5 py-2.5 bg-emerald-50/40 border border-emerald-100 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:bg-white outline-none" /></div>
          <div><label class="text-[11px] font-extrabold uppercase text-slate-500 block mb-1">Nomor Telepon</label><input v-model="editForm.phone_number" type="tel" class="w-full px-3.5 py-2.5 bg-emerald-50/40 border border-emerald-100 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:bg-white outline-none" /></div>
          <div><label class="text-[11px] font-extrabold uppercase text-slate-500 block mb-1">Role</label><select v-model="editForm.role" class="w-full px-3.5 py-2.5 bg-emerald-50/40 border border-emerald-100 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:bg-white outline-none"><option value="user">User</option><option value="admin">Admin</option></select></div>
          <div class="flex justify-end gap-2 pt-2"><button type="button" @click="showEditModal = false" class="px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold">Batal</button><button type="submit" :disabled="isSubmitting" class="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold disabled:opacity-50">{{ isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan' }}</button></div>
        </form>
      </div>
    </div>

    <!-- Modal Detail Pelanggan -->
    <div v-if="showDetailModal" class="fixed inset-0 z-50 bg-emerald-950/25 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-[2rem] w-full max-w-lg p-6 shadow-2xl shadow-emerald-950/15 border border-emerald-100 space-y-5">
        
        <div class="flex items-center justify-between border-b border-emerald-100 pb-3">
          <h3 class="font-extrabold text-slate-900 text-base flex items-center gap-2">
            <FileText :size="18" class="text-emerald-600" /> Detail Informasi Pelanggan
          </h3>
          <button @click="showDetailModal = false" class="text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-lg hover:bg-slate-100">
            <X :size="18" />
          </button>
        </div>

        <div v-if="selectedUser" class="space-y-4 text-xs">
          <div class="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-100/80 flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-lg shadow-md shrink-0">
              {{ (selectedUser.name || 'U').charAt(0).toUpperCase() }}
            </div>
            <div>
              <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">Nama Akun</span>
              <h4 class="font-black text-slate-800 text-sm">{{ selectedUser.name }}</h4>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="bg-emerald-50/60 p-3 rounded-2xl border border-emerald-100">
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Email Pengguna</span>
              <p class="font-bold text-slate-800 mt-0.5 truncate">{{ selectedUser.email }}</p>
            </div>
            <div class="bg-emerald-50/60 p-3 rounded-2xl border border-emerald-100">
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">No. Telepon</span>
              <p class="font-bold text-slate-800 mt-0.5">{{ selectedUser.phone_number || '-' }}</p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="bg-emerald-50/60 p-3 rounded-2xl border border-emerald-100">
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Role Sistem</span>
              <p class="font-bold text-slate-800 mt-0.5 uppercase">{{ selectedUser.role || 'Customer' }}</p>
            </div>
            <div class="bg-emerald-50/60 p-3 rounded-2xl border border-emerald-100">
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Tanggal Bergabung</span>
              <p class="font-bold text-slate-800 mt-0.5">{{ selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-' }}</p>
            </div>
          </div>
        </div>

        <button 
          @click="showDetailModal = false"
          class="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-xs font-bold transition cursor-pointer shadow-md shadow-emerald-600/20"
        >
          Tutup
        </button>

      </div>
    </div>

  </div>
</template>