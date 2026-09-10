<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { 
  Plus, 
  Search, 
  Pencil, 
  Trash2, 
  Bell, 
  Menu, 
  X,
  FolderTree,
  AlertCircle,
  Eye,
  FileText
} from 'lucide-vue-next';
import api from '../utils/axios';
import SidebarAdmin from '../components/SidebarAdmin.vue';
import NavbarAdmin from '../components/navbaradmin.vue';

const router = useRouter();

const categories = ref([]);
const loading = ref(true);
const isSubmitting = ref(false);
const errorMessage = ref('');

const adminUser = ref(JSON.parse(localStorage.getItem('user') || '{}'));
const searchTerm = ref('');
const isSidebarOpen = ref(false);

// State Modal Form (Tambah/Edit)
const showModal = ref(false);
const isEditing = ref(false);
const currentId = ref(null);

// State Modal Detail (Show)
const showDetailModal = ref(false);
const selectedCategory = ref(null);

const form = ref({
  name: '',
  description: ''
});

const fetchData = async () => {
  loading.value = true;
  try {
    const resCategories = await api.get('/categories');
    categories.value = resCategories.data.data || resCategories.data;
  } catch (err) {
    console.error('Gagal mengambil data kategori:', err);
  } finally {
    loading.value = false;
  }
};

// Penggunaan Computed Property agar lebih reaktif dan efisien
const filteredCategories = computed(() => {
  if (!searchTerm.value) return categories.value;
  return categories.value.filter(item => 
    item.name && item.name.toLowerCase().includes(searchTerm.value.toLowerCase())
  );
});

const resetForm = () => {
  form.value = { name: '', description: '' };
  isEditing.value = false;
  currentId.value = null;
  errorMessage.value = '';
  showModal.value = false;
};

// Buka Modal Detail (Show)
const openDetailModal = (item) => {
  selectedCategory.value = item;
  showDetailModal.value = true;
};

const openEditModal = (item) => {
  isEditing.value = true;
  currentId.value = item.id;
  form.value = {
    name: item.name || '',
    description: item.description || ''
  };
  errorMessage.value = '';
  showModal.value = true;
};

const handleSubmit = async () => {
  isSubmitting.value = true;
  errorMessage.value = '';

  const payload = {
    name: form.value.name,
    description: form.value.description
  };

  try {
    if (isEditing.value) {
      await api.put(`/categories/${currentId.value}`, payload);
    } else {
      await api.post('/categories', payload);
    }
    resetForm();
    fetchData();
  } catch (err) {
    console.error('Gagal menyimpan kategori:', err);
    if (err.response && err.response.data) {
      errorMessage.value = err.response.data.message || 'Gagal menyimpan data kategori. Periksa inputan kamu.';
    } else {
      errorMessage.value = 'Terjadi kesalahan koneksi ke server.';
    }
  } finally {
    isSubmitting.value = false;
  }
};

const handleDelete = async (id) => {
  if (confirm('Apakah kamu yakin ingin menghapus kategori ini?')) {
    try {
      await api.delete(`/categories/${id}`);
      fetchData();
    } catch (err) {
      console.error('Gagal menghapus kategori:', err);
      alert('Gagal menghapus kategori. Kategori mungkin sedang digunakan oleh data alat.');
    }
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
      
      <NavbarAdmin title="Kelola Kategori Alat" :admin-user="adminUser" @menu="isSidebarOpen = true" @logout="handleLogout" />

      <main class="p-4 sm:p-8 space-y-6 max-w-7xl">
        
        <div class="relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-br from-emerald-100 via-white to-teal-50 rounded-[2rem] border border-emerald-100 p-6 shadow-lg shadow-emerald-900/5">
          <div class="absolute -right-12 -top-20 w-64 h-64 rounded-full bg-emerald-200/40 blur-3xl"></div>
          <div>
            <span class="relative text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">Catalog Structure</span>
            <h1 class="relative text-2xl sm:text-3xl font-black text-slate-900 mt-1">Kategori Peralatan</h1>
            <p class="relative text-xs text-slate-600 font-medium mt-1">Kelola kelompok alat outdoor seperti tenda, carrier, atau penerangan.</p>
          </div>

          <button 
            @click="showModal = true"
            class="relative bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-600/20 cursor-pointer active:scale-95"
          >
            <Plus :size="18" /> Tambah Kategori
          </button>
        </div>

        <div class="bg-white rounded-3xl shadow-xl shadow-emerald-900/5 border border-emerald-100 overflow-hidden">
          <div class="p-5 sm:p-6 border-b border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="relative w-full sm:w-80">
              <Search class="absolute left-3.5 top-3 text-slate-400" :size="16" />
              <input 
                v-model="searchTerm" 
                type="text" 
                placeholder="Cari kategori..." 
                class="w-full pl-9 pr-4 py-2.5 bg-emerald-50/40 border border-emerald-100 text-slate-800 placeholder-slate-400 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:bg-white outline-none transition"
              />
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-emerald-50/60 text-emerald-800/60 uppercase font-extrabold tracking-wider border-b border-emerald-100">
                <tr>
                  <th class="p-4 pl-6">Nama Kategori</th>
                  <th class="p-4">Deskripsi</th>
                  <th class="p-4 text-center pr-6">Aksi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-emerald-50 text-slate-700 font-medium">
                <tr v-if="loading">
                  <td colspan="3" class="p-12 text-center text-slate-400">
                    <div class="inline-block w-6 h-6 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                    <p class="text-xs font-semibold">Mengambil data dari server...</p>
                  </td>
                </tr>

                <tr v-else-if="filteredCategories.length === 0">
                  <td colspan="3" class="p-12 text-center text-slate-400">
                    Tidak ada kategori yang ditemukan.
                  </td>
                </tr>

                <tr v-else v-for="item in filteredCategories" :key="item.id" class="hover:bg-emerald-50/50 transition-colors">
                  <td class="p-4 pl-6 font-bold text-slate-800 flex items-center gap-3">
                    <div class="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl border border-emerald-200">
                      <FolderTree :size="18" />
                    </div>
                    <span class="font-extrabold text-sm">{{ item.name }}</span>
                  </td>

                  <td class="p-4 text-slate-500">
                    {{ item.description || 'Tidak ada deskripsi' }}
                  </td>

                  <td class="p-4 text-center pr-6">
                    <div class="flex items-center justify-center gap-2">
                      <!-- Tombol Show / Detail -->
                      <button 
                        @click="openDetailModal(item)" 
                        class="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 p-2 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs border border-emerald-100"
                        title="Lihat Detail"
                      >
                        <Eye :size="14" />
                      </button>

                      <!-- Tombol Edit -->
                      <button 
                        @click="openEditModal(item)" 
                        class="bg-amber-50 hover:bg-amber-100 text-amber-700 p-2 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs border border-amber-100"
                        title="Edit Kategori"
                      >
                        <Pencil :size="14" />
                      </button>

                      <!-- Tombol Hapus -->
                      <button 
                        @click="handleDelete(item.id)" 
                        class="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 p-2 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
                        title="Hapus Kategori"
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

    <!-- Modal Form Tambah/Edit Kategori -->
    <div v-if="showModal" class="fixed inset-0 z-50 bg-emerald-950/25 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-[2rem] w-full max-w-md p-6 shadow-2xl shadow-emerald-950/15 border border-emerald-100 space-y-5">
        <div class="flex items-center justify-between border-b border-emerald-100 pb-3">
          <h3 class="font-black text-slate-800 text-base">
            {{ isEditing ? 'Edit Kategori' : 'Tambah Kategori Baru' }}
          </h3>
          <button @click="resetForm" class="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X :size="20" />
          </button>
        </div>

        <div v-if="errorMessage" class="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-600 text-xs font-bold">
          <AlertCircle :size="16" class="shrink-0" />
          <span>{{ errorMessage }}</span>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="text-[11px] font-extrabold uppercase text-slate-500 block mb-1">Nama Kategori</label>
            <input 
              v-model="form.name" 
              type="text" 
              required 
              placeholder="Contoh: Tenda & Shelter" 
              class="w-full px-3.5 py-2.5 bg-emerald-50/40 border border-emerald-100 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:bg-white outline-none"
            />
          </div>

          <div>
            <label class="text-[11px] font-extrabold uppercase text-slate-500 block mb-1">Deskripsi Singkat</label>
            <textarea 
              v-model="form.description" 
              rows="3" 
              placeholder="Penjelasan ringkas tentang kategori ini..." 
              class="w-full px-3.5 py-2.5 bg-emerald-50/40 border border-emerald-100 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:bg-white outline-none"
            ></textarea>
          </div>

          <div class="flex items-center justify-end gap-2 pt-3">
            <button 
              type="button" 
              @click="resetForm" 
              class="px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold hover:bg-emerald-100 transition cursor-pointer"
            >
              Batal
            </button>
            <button 
              type="submit" 
              :disabled="isSubmitting"
              class="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              <span v-if="isSubmitting" class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>{{ isEditing ? 'Update Kategori' : 'Simpan Kategori' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Show / Detail Kategori -->
    <div v-if="showDetailModal" class="fixed inset-0 z-50 bg-emerald-950/25 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-[2rem] w-full max-w-md p-6 shadow-2xl shadow-emerald-950/15 border border-emerald-100 space-y-5">
        
        <div class="flex items-center justify-between border-b border-emerald-100 pb-3">
          <h3 class="font-extrabold text-slate-900 text-base flex items-center gap-2">
            <FileText :size="18" class="text-emerald-600" /> Detail Kategori
          </h3>
          <button @click="showDetailModal = false" class="text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-lg hover:bg-slate-100">
            <X :size="18" />
          </button>
        </div>

        <div v-if="selectedCategory" class="space-y-4 text-xs">
          <div class="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-100/80 flex items-center gap-3">
            <div class="p-3 bg-emerald-600 text-white rounded-xl shadow-md shadow-emerald-600/20">
              <FolderTree :size="20" />
            </div>
            <div>
              <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Nama Kategori</span>
              <h4 class="font-black text-slate-800 text-base">{{ selectedCategory.name }}</h4>
            </div>
          </div>

          <div class="space-y-1.5 bg-emerald-50/60 p-4 rounded-2xl border border-emerald-100">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Deskripsi</span>
            <p class="text-slate-600 font-medium leading-relaxed">
              {{ selectedCategory.description || 'Tidak ada deskripsi yang ditambahkan untuk kategori ini.' }}
            </p>
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