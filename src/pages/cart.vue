<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { ArrowLeft, ArrowRight, Minus, Plus, ShoppingCart, Trash2, ShieldCheck, PackageOpen } from 'lucide-vue-next';
import Navbar from '../components/navbar.vue';
import Footer from '../components/footer.vue';
import { useCart } from '../utils/cart';

const router = useRouter();
const { cartItems, cartCount, updateQuantity, removeFromCart, clearCart } = useCart();
const totalItemsPrice = computed(() => cartItems.value.reduce((total, item) => total + item.price * item.quantity, 0));
const totalProductTypes = computed(() => cartItems.value.length);

const getImageUrl = (imagePath) => {
  if (!imagePath) return 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80';
  if (imagePath.startsWith('http')) return imagePath;
  return `http://localhost:8000/storage/${imagePath}`;
};
</script>

<template>
  <div class="min-h-screen flex flex-col justify-between bg-[#f4faf6] font-['Plus_Jakarta_Sans',sans-serif]">
    <div>
      <Navbar />
      <main class="max-w-5xl mx-auto px-4 sm:px-6 py-8 w-full">
        <div class="relative overflow-hidden bg-gradient-to-br from-emerald-100 via-white to-teal-50 rounded-[1.75rem] p-6 sm:p-8 mb-7 border border-emerald-100 shadow-lg shadow-emerald-900/5">
          <div class="absolute -right-12 -top-20 w-64 h-64 rounded-full bg-emerald-200/50 blur-3xl"></div>
          <div class="relative flex items-end justify-between gap-4">
          <div>
            <p class="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">Pesananmu</p>
            <h1 class="text-3xl font-black text-slate-900 mt-1">Keranjang Sewa</h1>
            <p class="text-sm text-slate-600 mt-1">{{ cartCount }} unit dari {{ totalProductTypes }} jenis perlengkapan siap diproses.</p>
          </div>
          <button @click="router.push('/catalog')" class="bg-white hover:bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition shadow-sm">
            <ArrowLeft :size="15" /> Tambah alat
          </button>
          </div>
        </div>

        <div v-if="cartItems.length === 0" class="bg-white rounded-3xl border border-emerald-100 p-12 text-center shadow-sm">
          <div class="mx-auto w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><PackageOpen :size="32" /></div>
          <h2 class="font-black text-slate-800 mt-4">Keranjang masih kosong</h2>
          <p class="text-sm text-slate-500 mt-1">Pilih perlengkapan yang ingin kamu bawa untuk petualangan berikutnya.</p>
          <button @click="router.push('/catalog')" class="mt-5 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl text-xs font-bold cursor-pointer transition flex items-center gap-2 mx-auto">Lihat katalog <ArrowRight :size="15" /></button>
        </div>

        <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div class="lg:col-span-2 space-y-3">
            <div class="flex items-center justify-between px-1 mb-2">
              <p class="text-xs font-black uppercase tracking-wider text-slate-500">Perlengkapan pilihan</p>
              <button @click="clearCart" class="text-[11px] font-bold text-rose-500 hover:text-rose-700 cursor-pointer">Hapus semua</button>
            </div>
            <div v-for="item in cartItems" :key="item.id" class="bg-white border border-emerald-100 rounded-2xl p-4 flex gap-4 items-center shadow-sm hover:shadow-md hover:border-emerald-200 transition">
              <img :src="getImageUrl(item.image)" :alt="item.name" class="w-20 h-20 rounded-xl object-cover bg-emerald-50" />
              <div class="flex-1 min-w-0">
                <h3 class="font-black text-slate-800 truncate">{{ item.name }}</h3>
                <p class="text-xs text-emerald-700 font-bold mt-1">Rp {{ item.price.toLocaleString('id-ID') }} / hari</p>
                <div class="flex items-center gap-2 mt-3">
                  <button @click="updateQuantity(item.id, item.quantity - 1)" class="w-7 h-7 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 flex items-center justify-center cursor-pointer transition"><Minus :size="13" /></button>
                  <span class="text-xs font-black w-6 text-center">{{ item.quantity }}</span>
                  <button @click="updateQuantity(item.id, item.quantity + 1)" class="w-7 h-7 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 flex items-center justify-center cursor-pointer transition"><Plus :size="13" /></button>
                </div>
              </div>
              <div class="text-right self-stretch flex flex-col justify-between items-end">
                <button @click="removeFromCart(item.id)" class="text-rose-500 cursor-pointer" aria-label="Hapus dari keranjang"><Trash2 :size="16" /></button>
                <p class="text-sm font-black text-slate-800">Rp {{ (item.price * item.quantity).toLocaleString('id-ID') }}</p>
              </div>
            </div>
          </div>

          <aside class="bg-white border border-emerald-100 rounded-2xl p-5 shadow-sm sticky top-20">
            <div class="flex items-center gap-2 pb-4 border-b border-emerald-100">
              <span class="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center"><ShoppingCart :size="17" /></span>
              <div><p class="text-xs font-black text-slate-800">Ringkasan pesanan</p><p class="text-[11px] text-slate-500">Harga dihitung per hari</p></div>
            </div>
            <div class="space-y-3 mt-4 text-xs">
              <div class="flex justify-between"><span class="text-slate-500">Jenis perlengkapan</span><strong class="text-slate-800">{{ totalProductTypes }}</strong></div>
              <div class="flex justify-between"><span class="text-slate-500">Total unit</span><strong class="text-slate-800">{{ cartCount }}</strong></div>
              <div class="flex justify-between pt-3 border-t border-slate-100"><span class="font-bold text-slate-700">Subtotal / hari</span><strong class="text-lg text-emerald-700">Rp {{ totalItemsPrice.toLocaleString('id-ID') }}</strong></div>
            </div>
            <div class="mt-4 flex gap-2 items-start bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-[11px] text-emerald-800"><ShieldCheck :size="16" class="shrink-0 text-emerald-600" /> Total akhir akan menyesuaikan durasi sewa di checkout.</div>
            <button @click="router.push('/rental')" class="w-full mt-5 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl text-xs font-bold cursor-pointer transition flex items-center justify-center gap-2">Lanjut ke checkout <ArrowRight :size="15" /></button>
          </aside>
        </div>
      </main>
    </div>
    <Footer />
  </div>
</template>