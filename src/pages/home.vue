<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import API from '../utils/axios';
import Navbar from '../components/navbar.vue';
import Footer from '../components/footer.vue';
import { ShoppingBag, CheckCircle2, XCircle, Compass, ShieldCheck, Headphones, ArrowRight, Sparkles, Tags } from 'lucide-vue-next';

const router = useRouter();
const equipments = ref([]);
const categories = ref([]);
const loading = ref(true);

const fetchEquipments = async () => {
  try {
    const [equipmentResponse, categoryResponse] = await Promise.all([
      API.get('/equipments'),
      API.get('/categories').catch(() => ({ data: [] }))
    ]);
    const equipmentData = equipmentResponse.data.data || equipmentResponse.data;
    const categoryData = categoryResponse.data.data || categoryResponse.data || [];
    equipments.value = equipmentData.slice(0, 8); // Ambil 8 produk unggulan untuk halaman utama
    categories.value = categoryData.slice(0, 6);
  } catch (err) {
    console.error('Gagal memuat data:', err);
  } finally {
    loading.value = false;
  }
};

const getImageUrl = (imagePath) => {
  if (!imagePath) return 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80&fm=webp';
  if (imagePath.startsWith('http')) return imagePath;
  return `http://localhost:8000/storage/${imagePath}`;
};

const goToCatalog = () => {
  router.push('/catalog');
};

const goToCategory = (categoryId) => {
  router.push({ path: '/catalog', query: { category_id: categoryId } });
};

const handleSewaClick = (item) => {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Silakan login atau daftar terlebih dahulu untuk melakukan penyewaan alat!');
    router.push('/login');
    return;
  }
  router.push('/catalog');
};

onMounted(() => {
  fetchEquipments();
});
</script>

<template>
  <div class="min-h-screen flex flex-col justify-between bg-[#f4faf6] font-['Plus_Jakarta_Sans',sans-serif]">
    <div>
      <Navbar />

      <!-- HERO SECTION UTAMA (MEGAH & ESTETIK) -->
      <section class="relative min-h-[560px] flex items-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 text-slate-900 overflow-hidden border-b border-emerald-100">
        <!-- Background Image dengan Overlay Terang -->
        <div class="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80&fm=webp" 
            alt="Camping Outdoor" 
            class="w-full h-full object-cover opacity-35 scale-105"
          />
          <div class="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-white/20"></div>
          <div class="absolute -right-20 -top-24 w-80 h-80 rounded-full bg-emerald-100/60 blur-3xl"></div>
          <div class="absolute -left-24 -bottom-40 w-96 h-96 rounded-full bg-teal-100/50 blur-3xl"></div>
        </div>

        <div class="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div class="max-w-2xl space-y-6">
            <div class="inline-flex items-center gap-2 bg-emerald-100/80 border border-emerald-200 text-emerald-800 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase backdrop-blur-md">
              <Sparkles :size="14" />
              <span>Sewa Alat Pendakian & Outdoor #1</span>
            </div>

            <h1 class="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08]">
              Siapkan Petualangan <span class="text-emerald-600 underline decoration-emerald-300 decoration-wavy">Terbaikmu</span> Hari Ini.
            </h1>

            <p class="text-slate-600 text-sm sm:text-base leading-relaxed font-normal max-w-xl">
              Temukan perlengkapan camping berkualitas tinggi, mulai dari tenda, alat masak, hingga carrier impianmu dengan harga terjangkau dan jaminan keamanan terbaik.
            </p>

            <div class="flex flex-wrap items-center gap-4 pt-2">
              <button 
                @click="goToCatalog"
                class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-7 py-3.5 rounded-2xl text-sm transition-all duration-300 shadow-lg shadow-emerald-600/25 flex items-center gap-2.5 cursor-pointer group"
              >
                <span>Jelajahi Katalog Lengkap</span>
                <ArrowRight :size="16" class="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div class="flex flex-wrap items-center gap-x-6 gap-y-3 pt-2 text-xs font-semibold text-slate-600">
              <span class="flex items-center gap-2"><span class="flex w-7 h-7 items-center justify-center rounded-full bg-white border border-emerald-100 text-emerald-600 shadow-sm"><ShieldCheck :size="15" /></span>Perlengkapan terawat</span>
              <span class="flex items-center gap-2"><span class="flex w-7 h-7 items-center justify-center rounded-full bg-white border border-emerald-100 text-emerald-600 shadow-sm"><Compass :size="15" /></span>Siap untuk petualangan</span>
            </div>
          </div>

          <div class="hidden lg:flex absolute right-8 bottom-14 w-56 items-center gap-3 bg-white/85 backdrop-blur-md border border-white rounded-2xl p-3 shadow-xl shadow-emerald-900/10">
            <div class="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Sparkles :size="20" />
            </div>
            <div>
              <p class="text-[10px] font-black uppercase tracking-wider text-emerald-700">Mulai hari ini</p>
              <p class="text-xs font-bold text-slate-700 leading-snug">Rencanakan perjalanan tanpa ribet.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- KEUNGGULAN / VALUE PROPOSITION -->
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20 mb-16">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div class="relative bg-white p-6 rounded-3xl border border-emerald-100 shadow-lg shadow-emerald-900/5 flex items-center gap-4 overflow-hidden group">
            <div class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-300"></div>
            <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Compass :size="24" />
            </div>
            <div>
              <h3 class="font-bold text-slate-800 text-sm">Alat 100% Berkualitas</h3>
              <p class="text-xs text-slate-500 mt-0.5">Perlengkapan terawat dan siap pakai untuk alam bebas.</p>
            </div>
          </div>

          <div class="relative bg-white p-6 rounded-3xl border border-emerald-100 shadow-lg shadow-emerald-900/5 flex items-center gap-4 overflow-hidden group">
            <div class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-teal-400 to-emerald-300"></div>
            <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <ShieldCheck :size="24" />
            </div>
            <div>
              <h3 class="font-bold text-slate-800 text-sm">Penyewaan Aman & Mudah</h3>
              <p class="text-xs text-slate-500 mt-0.5">Proses cepat secara online dengan sistem terpercaya.</p>
            </div>
          </div>

          <div class="relative bg-white p-6 rounded-3xl border border-emerald-100 shadow-lg shadow-emerald-900/5 flex items-center gap-4 overflow-hidden group">
            <div class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-lime-400 to-emerald-300"></div>
            <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Headphones :size="24" />
            </div>
            <div>
              <h3 class="font-bold text-slate-800 text-sm">Dukungan Pelanggan</h3>
              <p class="text-xs text-slate-500 mt-0.5">Siap membantu kebutuhan logistik pendakianmu.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- KATEGORI PERLENGKAPAN -->
      <section v-if="categories.length" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <span class="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 tracking-wider uppercase">
              <Tags :size="14" /> Jelajahi berdasarkan kebutuhan
            </span>
            <h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">Pilih Kategori Favoritmu</h2>
          </div>
          <button
            @click="goToCatalog"
            class="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 transition cursor-pointer"
          >
            Lihat semua <ArrowRight :size="14" />
          </button>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <button
            v-for="(category, index) in categories"
            :key="category.id"
            @click="goToCategory(category.id)"
            class="group text-left bg-white border border-emerald-100 rounded-2xl p-4 sm:p-5 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-900/10 transition-all duration-300 cursor-pointer"
          >
            <div
              :class="[
                'w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-colors',
                index % 3 === 0 ? 'bg-emerald-100 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white' : '',
                index % 3 === 1 ? 'bg-teal-100 text-teal-700 group-hover:bg-teal-600 group-hover:text-white' : '',
                index % 3 === 2 ? 'bg-lime-100 text-lime-700 group-hover:bg-lime-600 group-hover:text-white' : ''
              ]"
            >
              <Tags :size="19" />
            </div>
            <span class="block font-bold text-slate-800 text-sm line-clamp-2 group-hover:text-emerald-700 transition-colors">
              {{ category.name || category.nama || 'Kategori Alat' }}
            </span>
            <span class="flex items-center gap-1 text-[10px] text-slate-400 font-semibold mt-2">
              Lihat koleksi <ArrowRight :size="11" class="group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
        </div>
      </section>

      <!-- DAFTAR PRODUK UNGGULAN -->
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 mb-16">
        <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span class="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 tracking-wider uppercase"><span class="w-7 h-px bg-emerald-400"></span>Pilihan Populer</span>
            <h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">Peralatan Outdoor Unggulan</h2>
            <p class="text-sm text-slate-500 mt-2 max-w-lg">Perlengkapan pilihan untuk membuat perjalananmu lebih nyaman, aman, dan siap dijalani.</p>
          </div>
          <button 
            @click="goToCatalog" 
            class="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1.5 transition cursor-pointer self-start sm:self-auto bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-xl"
          >
            <span>Lihat Semua Katalog</span>
            <ArrowRight :size="14" />
          </button>
        </div>

        <div v-if="loading" class="text-center py-20 bg-white rounded-3xl border border-slate-100">
          <div class="inline-block w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <div
            v-for="item in equipments"
            :key="item.id"
            class="bg-white rounded-3xl border border-emerald-100 shadow-sm hover:shadow-xl hover:shadow-emerald-900/10 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden group"
          >
            <div>
              <!-- BAGIAN GAMBAR: DIKLIK MASUK KE KATALOG -->
              <div 
                @click="goToCatalog"
                class="relative overflow-hidden bg-emerald-50 h-56 cursor-pointer"
              >
                <img
                  :src="getImageUrl(item.image || item.gambar)"
                  :alt="item.name || item.title"
                  class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  @error="$event.target.src = 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80&fm=webp'"
                />
                <div class="absolute inset-0 bg-emerald-950/0 group-hover:bg-emerald-950/15 transition-colors flex items-center justify-center">
                  <span class="opacity-0 group-hover:opacity-100 bg-white/95 text-emerald-900 text-xs font-bold px-4 py-2 rounded-full shadow-lg transition-all transform scale-95 group-hover:scale-100">
                    Buka di Katalog →
                  </span>
                </div>
              </div>

              <!-- BAGIAN DESKRIPSI -->
              <div class="p-5 space-y-2.5">
                <h3 
                  @click="goToCatalog"
                  class="font-bold text-slate-800 text-base line-clamp-1 cursor-pointer hover:text-emerald-600 transition"
                >
                  {{ item.name || item.title }}
                </h3>
                
                <p class="text-xs text-slate-500 line-clamp-2 leading-relaxed min-h-[2rem]">
                  {{ item.description || '-' }}
                </p>

                <div class="flex items-baseline gap-1 pt-1">
                  <span class="text-emerald-700 font-black text-lg tracking-tight">
                    Rp {{ Number(item.price_per_day || item.price || item.harga || 0).toLocaleString('id-ID') }}
                  </span>
                  <span class="text-xs text-slate-400 font-medium">/ hari</span>
                </div>

                <div class="flex items-center text-xs font-semibold pt-1">
                  <span v-if="(item.stock || item.stok || 0) > 0" class="text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg flex items-center gap-1.5 border border-emerald-100 text-[11px]">
                    <CheckCircle2 :size="14" class="text-emerald-600" /> Stok: {{ item.stock || item.stok }} unit
                  </span>
                  <span v-else class="text-rose-600 bg-rose-50 px-3 py-1 rounded-lg flex items-center gap-1.5 border border-rose-100 text-[11px]">
                    <XCircle :size="14" class="text-rose-500" /> Stok Habis
                  </span>
                </div>
              </div>
            </div>

            <!-- TOMBOL SEWA -->
            <div class="p-5 pt-0">
              <button
                :disabled="(item.stock || item.stok || 0) <= 0"
                @click="handleSewaClick(item)"
                class="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white py-3 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
              >
                <ShoppingBag :size="15" />
                <span>{{ (item.stock || item.stok || 0) > 0 ? 'Sewa Sekarang' : 'Tidak Tersedia' }}</span>
              </button>
            </div>
          </div>
        </div>

      </main>
    </div>

    <Footer />
  </div>
</template>