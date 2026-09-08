<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { 
  Plus, Search, Pencil, Trash2, Bell, Menu, X, Boxes, AlertCircle, Image 
} from 'lucide-vue-next';
import api from '../utils/axios';
import SidebarAdmin from '../components/SidebarAdmin.vue';

const router = useRouter();

const equipments = ref([]);
const categories = ref([]);
const loading = ref(true);
const isSubmitting = ref(false);
const errorMessage = ref('');

const adminUser = ref(JSON.parse(localStorage.getItem('user') || '{}'));
const searchTerm = ref('');
const isSidebarOpen = ref(false);

const showModal = ref(false);
const isEditing = ref(false);
const currentId = ref(null);

const form = ref({
  name: '',
  category_id: '',
  price: '',
  stock: '',
  description: '',
  image: ''
});

const fetchData = async () => {
  loading.value = true;
  try {
    const [resEquip, resCat] = await Promise.all([
      api.get('/equipments'),
      api.get('/categories')
    ]);
    equipments.value = resEquip.data.data || resEquip.data;
    categories.value = resCat.data.data || resCat.data;
  } catch (err) {
    console.error('Gagal mengambil data:', err);
  } finally {
    loading.value = false;
  }
};

const filteredEquipments = () => {
  if (!searchTerm.value) return equipments.value;
  return equipments.value.filter(item => 
    (item.name || item.title || '').toLowerCase().includes(searchTerm.value.toLowerCase())
  );
};

const resetForm = () => {
  form.value = { name: '', category_id: '', price: '', stock: '', description: '', image: '' };
  isEditing.value = false;
  currentId.value = null;
  errorMessage.value = '';
  showModal.value = false;
};

const openEditModal = (item) => {
  isEditing.value = true;
  currentId.value = item.id;
  form.value = {
    name: item.name || item.title || '',
    category_id: item.category_id || (item.category ? item.category.id : ''),
    price: item.price_per_day || item.price || item.harga || '',
    stock: item.stock || item.stok || '',
    description: item.description || item.deskripsi || '',
    image: item.image || item.gambar || ''
  };
  errorMessage.value = '';
  showModal.value = true;
};

const handleSubmit = async () => {
  isSubmitting.value = true;
  errorMessage.value = '';

  // Payload lengkap menyesuaikan field Laravel (Inggris / Indonesia / price_per_day)
  const payload = {
    name: form.value.name,
    title: form.value.name,
    category_id: form.value.category_id,
    
    // Kirim harga ke semua kemungkinan nama field backend
    price_per_day: form.value.price,
    price: form.value.price,
    harga: form.value.price,

    stock: form.value.stock,
    stok: form.value.stock,
    description: form.value.description,
    deskripsi: form.value.description,
    image: form.value.image,
    gambar: form.value.image
  };

  try {
    if (isEditing.value) {
      await api.put(`/equipments/${currentId.value}`, payload);
    } else {
      await api.post('/equipments', payload);
    }
    resetForm();
    fetchData();
  } catch (err) {
    console.error('Gagal menyimpan peralatan:', err);
    if (err.response && err.response.data) {
      errorMessage.value = err.response.data.message || 'Gagal menyimpan data alat. Periksa inputan kamu.';
    } else {
      errorMessage.value = 'Terjadi kesalahan koneksi ke server.';
    }
  } finally {
    isSubmitting.value = false;
  }
};

const handleDelete = async (id) => {
  if (confirm('Apakah kamu yakin ingin menghapus alat ini?')) {
    try {
      await api.delete(`/equipments/${id}`);
      fetchData();
    } catch (err) {
      console.error('Gagal menghapus alat:', err);
      alert('Gagal menghapus alat.');
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
  <div class="min-h-screen bg-emerald-50/40 font-['Plus_Jakarta_Sans',sans-serif] text-slate-800 flex">
    
    <SidebarAdmin 
      :is-open="isSidebarOpen" 
      :admin-user="adminUser"
      @close="isSidebarOpen = false"
      @logout="handleLogout"
    />

    <div class="flex-1 flex flex-col min-w-0">
      
      <header class="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-emerald-100/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <button @click="isSidebarOpen = true" class="lg:hidden p-2 bg-slate-100 rounded-xl text-slate-600 cursor-pointer">
            <Menu :size="20" />
          </button>
          <h2 class="text-lg font-black text-slate-800">Kelola Stok Alat</h2>
        </div>

        <div class="flex items-center gap-3">
          <button class="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition relative cursor-pointer">
            <Bell :size="18" />
            <span class="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full"></span>
          </button>
        </div>
      </header>

      <main class="p-4 sm:p-8 space-y-6 max-w-7xl">
        
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 class="text-2xl font-black text-slate-800">Stok Peralatan</h1>
            <p class="text-xs text-slate-500 font-medium">Kelola daftar alat camping, harga sewa per hari, dan jumlah stok yang tersedia.</p>
          </div>

          <button 
            @click="showModal = true"
            class="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-600/20 cursor-pointer active:scale-95"
          >
            <Plus :size="18" /> Tambah Alat
          </button>
        </div>

        <div class="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-emerald-900/5 border border-white overflow-hidden">
          <div class="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="relative w-full sm:w-80">
              <Search class="absolute left-3.5 top-3 text-slate-400" :size="16" />
              <input 
                v-model="searchTerm" 
                type="text" 
                placeholder="Cari nama alat..." 
                class="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none transition"
              />
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-50/80 text-slate-400 uppercase font-extrabold tracking-wider border-b border-slate-100">
                <tr>
                  <th class="p-4 pl-6">Nama Alat</th>
                  <th class="p-4">Kategori</th>
                  <th class="p-4">Harga / Hari</th>
                  <th class="p-4">Stok</th>
                  <th class="p-4 text-center pr-6">Aksi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 text-slate-700 font-medium">
                <tr v-if="loading">
                  <td colspan="5" class="p-12 text-center text-slate-400">
                    <div class="inline-block w-6 h-6 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                    <p class="text-xs font-semibold">Mengambil data dari server...</p>
                  </td>
                </tr>

                <tr v-else-if="filteredEquipments().length === 0">
                  <td colspan="5" class="p-12 text-center text-slate-400">
                    Tidak ada peralatan yang ditemukan.
                  </td>
                </tr>

                <tr v-else v-for="item in filteredEquipments()" :key="item.id" class="hover:bg-emerald-50/30 transition-colors">
                  <td class="p-4 pl-6 font-bold text-slate-800 flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                      <img v-if="item.image || item.gambar" :src="item.image || item.gambar" class="w-full h-full object-cover" />
                      <Image v-else :size="18" class="text-slate-400" />
                    </div>
                    <span class="font-extrabold text-sm">{{ item.name || item.title }}</span>
                  </td>

                  <td class="p-4 text-slate-600 font-semibold">
                    {{ item.category?.name || 'Umum' }}
                  </td>

                  <td class="p-4 font-extrabold text-emerald-600">
                    Rp {{ Number(item.price_per_day || item.price || item.harga || 0).toLocaleString('id-ID') }}
                  </td>

                  <td class="p-4 font-bold text-slate-700">
                    {{ item.stock || item.stok || 0 }} unit
                  </td>

                  <td class="p-4 text-center pr-6">
                    <div class="flex items-center justify-center gap-2">
                      <button 
                        @click="openEditModal(item)" 
                        class="bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
                      >
                        <Pencil :size="14" />
                      </button>
                      <button 
                        @click="handleDelete(item.id)" 
                        class="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 p-2 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
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

    <!-- Modal Form Tambah/Edit Alat -->
    <div v-if="showModal" class="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-slate-100 space-y-5 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 class="font-black text-slate-800 text-base">
            {{ isEditing ? 'Edit Peralatan' : 'Tambah Peralatan Baru' }}
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
            <label class="text-[11px] font-extrabold uppercase text-slate-500 block mb-1">Nama Alat</label>
            <input 
              v-model="form.name" 
              type="text" 
              required 
              placeholder="Contoh: Tenda Arpenaz 4.1" 
              class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-[11px] font-extrabold uppercase text-slate-500 block mb-1">Kategori</label>
              <select 
                v-model="form.category_id" 
                required 
                class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none"
              >
                <option value="" disabled>Pilih Kategori</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
              </select>
            </div>

            <div>
              <label class="text-[11px] font-extrabold uppercase text-slate-500 block mb-1">Stok Unit</label>
              <input 
                v-model="form.stock" 
                type="number" 
                required 
                placeholder="10" 
                class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label class="text-[11px] font-extrabold uppercase text-slate-500 block mb-1">Harga Sewa / Hari (Rp)</label>
            <input 
              v-model="form.price" 
              type="number" 
              required 
              placeholder="50000" 
              class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none"
            />
          </div>

          <div>
            <label class="text-[11px] font-extrabold uppercase text-slate-500 block mb-1">URL Gambar Alat</label>
            <input 
              v-model="form.image" 
              type="text" 
              placeholder="https://images.unsplash.com/..." 
              class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none"
            />
          </div>

          <div>
            <label class="text-[11px] font-extrabold uppercase text-slate-500 block mb-1">Deskripsi Ringkas</label>
            <textarea 
              v-model="form.description" 
              rows="3" 
              placeholder="Spesifikasi atau detail alat..." 
              class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none"
            ></textarea>
          </div>

          <div class="flex items-center justify-end gap-2 pt-3">
            <button 
              type="button" 
              @click="resetForm" 
              class="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 transition cursor-pointer"
            >
              Batal
            </button>
            <button 
              type="submit" 
              :disabled="isSubmitting"
              class="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              <span v-if="isSubmitting" class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>{{ isEditing ? 'Update Alat' : 'Simpan Alat' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>