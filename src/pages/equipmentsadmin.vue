<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { 
  Plus, Search, Pencil, Trash2, Bell, Menu, X, Boxes, AlertCircle, Image, Eye, FileText
} from 'lucide-vue-next';
import api from '../utils/axios';
import SidebarAdmin from '../components/SidebarAdmin.vue';
import NavbarAdmin from '../components/navbaradmin.vue';

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
const showDetailModal = ref(false);
const selectedEquipment = ref(null);

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

const openDetailModal = (item) => {
  selectedEquipment.value = item;
  showDetailModal.value = true;
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
  <div class="min-h-screen bg-[#f4faf6] font-['Plus_Jakarta_Sans',sans-serif] text-slate-800 flex">
    
    <SidebarAdmin 
      :is-open="isSidebarOpen" 
      :admin-user="adminUser"
      @close="isSidebarOpen = false"
      @logout="handleLogout"
    />

    <div class="flex-1 flex flex-col min-w-0">
      
      <NavbarAdmin title="Kelola Stok Alat" :admin-user="adminUser" @menu="isSidebarOpen = true" @logout="handleLogout" />

      <main class="p-4 sm:p-8 space-y-6 max-w-7xl">
        
        <div class="relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-br from-emerald-100 via-white to-teal-50 rounded-[2rem] border border-emerald-100 p-6 shadow-lg shadow-emerald-900/5">
          <div class="absolute -right-12 -top-20 w-64 h-64 rounded-full bg-emerald-200/40 blur-3xl"></div>
          <div>
            <span class="relative text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">Inventory Control</span>
            <h1 class="relative text-2xl sm:text-3xl font-black text-slate-900 mt-1">Stok Peralatan</h1>
            <p class="relative text-xs text-slate-600 font-medium mt-1">Kelola alat camping, harga sewa, dan jumlah stok yang tersedia.</p>
          </div>

          <button 
            @click="showModal = true"
            class="relative bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-600/20 cursor-pointer active:scale-95"
          >
            <Plus :size="18" /> Tambah Alat
          </button>
        </div>

        <div class="bg-white rounded-3xl shadow-xl shadow-emerald-900/5 border border-emerald-100 overflow-hidden">
          <div class="p-5 sm:p-6 border-b border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="relative w-full sm:w-80">
              <Search class="absolute left-3.5 top-3 text-slate-400" :size="16" />
              <input 
                v-model="searchTerm" 
                type="text" 
                placeholder="Cari nama alat..." 
                class="w-full pl-9 pr-4 py-2.5 bg-emerald-50/40 border border-emerald-100 text-slate-800 placeholder-slate-400 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:bg-white outline-none transition"
              />
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-emerald-50/60 text-emerald-800/60 uppercase font-extrabold tracking-wider border-b border-emerald-100">
                <tr>
                  <th class="p-4 pl-6">Nama Alat</th>
                  <th class="p-4">Kategori</th>
                  <th class="p-4">Harga / Hari</th>
                  <th class="p-4">Stok</th>
                  <th class="p-4 text-center pr-6">Aksi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-emerald-50 text-slate-700 font-medium">
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

                <tr v-else v-for="item in filteredEquipments()" :key="item.id" class="hover:bg-emerald-50/50 transition-colors">
                  <td class="p-4 pl-6 font-bold text-slate-800 flex items-center gap-3">
                    <div class="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 overflow-hidden shrink-0 flex items-center justify-center">
                      <img v-if="item.image || item.gambar" :src="item.image || item.gambar" class="w-full h-full object-cover" />
                      <Image v-else :size="18" class="text-emerald-400" />
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
                    <span class="inline-flex items-center bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1 rounded-lg">
                      {{ item.stock || item.stok || 0 }} unit
                    </span>
                  </td>

                  <td class="p-4 text-center pr-6">
                    <div class="flex items-center justify-center gap-2">
                      <button
                        @click="openDetailModal(item)"
                        class="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-100 p-2 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
                        title="Lihat Detail Alat"
                      >
                        <Eye :size="14" />
                      </button>
                      <button 
                        @click="openEditModal(item)" 
                        class="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-100 p-2 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
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

    <!-- Modal Detail Alat -->
    <div v-if="showDetailModal" class="fixed inset-0 z-50 bg-emerald-950/25 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-[2rem] w-full max-w-lg p-6 shadow-2xl shadow-emerald-950/15 border border-emerald-100 space-y-5">
        <div class="flex items-center justify-between border-b border-emerald-100 pb-3">
          <h3 class="font-extrabold text-slate-900 text-base flex items-center gap-2"><FileText :size="18" class="text-emerald-600" /> Detail Peralatan</h3>
          <button @click="showDetailModal = false" class="text-slate-400 hover:text-slate-600 cursor-pointer"><X :size="18" /></button>
        </div>
        <div v-if="selectedEquipment" class="space-y-4 text-xs">
          <div class="flex items-center gap-4 bg-emerald-50/60 p-4 rounded-2xl border border-emerald-100">
            <div class="w-20 h-20 rounded-2xl overflow-hidden bg-white border border-emerald-100 shrink-0 flex items-center justify-center">
              <img v-if="selectedEquipment.image || selectedEquipment.gambar" :src="selectedEquipment.image || selectedEquipment.gambar" class="w-full h-full object-cover" />
              <Image v-else :size="24" class="text-emerald-400" />
            </div>
            <div><span class="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Nama Alat</span><h4 class="font-black text-slate-800 text-base">{{ selectedEquipment.name || selectedEquipment.title }}</h4><p class="text-emerald-700 font-bold mt-1">{{ selectedEquipment.category?.name || 'Umum' }}</p></div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div class="bg-emerald-50/60 p-3 rounded-2xl border border-emerald-100"><span class="text-[10px] font-bold uppercase text-slate-400">Harga / Hari</span><p class="font-black text-emerald-700 mt-1">Rp {{ Number(selectedEquipment.price_per_day || selectedEquipment.price || selectedEquipment.harga || 0).toLocaleString('id-ID') }}</p></div>
            <div class="bg-emerald-50/60 p-3 rounded-2xl border border-emerald-100"><span class="text-[10px] font-bold uppercase text-slate-400">Stok</span><p class="font-black text-slate-800 mt-1">{{ selectedEquipment.stock || selectedEquipment.stok || 0 }} unit</p></div>
          </div>
          <div class="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-100"><span class="text-[10px] font-bold uppercase text-slate-400">Deskripsi</span><p class="text-slate-600 leading-relaxed mt-1">{{ selectedEquipment.description || selectedEquipment.deskripsi || 'Tidak ada deskripsi.' }}</p></div>
        </div>
        <button @click="showDetailModal = false" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20">Tutup</button>
      </div>
    </div>

    <!-- Modal Form Tambah/Edit Alat -->
    <div v-if="showModal" class="fixed inset-0 z-50 bg-emerald-950/25 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-[2rem] w-full max-w-lg p-6 shadow-2xl shadow-emerald-950/15 border border-emerald-100 space-y-5 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between border-b border-emerald-100 pb-3">
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
              class="w-full px-3.5 py-2.5 bg-emerald-50/40 border border-emerald-100 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:bg-white outline-none"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-[11px] font-extrabold uppercase text-slate-500 block mb-1">Kategori</label>
              <select 
                v-model="form.category_id" 
                required 
                class="w-full px-3.5 py-2.5 bg-emerald-50/40 border border-emerald-100 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:bg-white outline-none"
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
                class="w-full px-3.5 py-2.5 bg-emerald-50/40 border border-emerald-100 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:bg-white outline-none"
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
              class="w-full px-3.5 py-2.5 bg-emerald-50/40 border border-emerald-100 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:bg-white outline-none"
            />
          </div>

          <div>
            <label class="text-[11px] font-extrabold uppercase text-slate-500 block mb-1">URL Gambar Alat</label>
            <input 
              v-model="form.image" 
              type="text" 
              placeholder="https://images.unsplash.com/..." 
              class="w-full px-3.5 py-2.5 bg-emerald-50/40 border border-emerald-100 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:bg-white outline-none"
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
              <span>{{ isEditing ? 'Update Alat' : 'Simpan Alat' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>