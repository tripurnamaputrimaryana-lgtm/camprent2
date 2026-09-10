<script setup>
import { Tent, Heart, Phone, Mail, MapPin } from 'lucide-vue-next';
</script>

<template>
  <footer class="bg-gradient-to-br from-emerald-50 via-white to-teal-50 text-slate-600 mt-16 border-t border-emerald-100">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
        
        <!-- Brand Info -->
        <div class="space-y-4 md:col-span-1">
          <div class="flex items-center gap-2.5">
            <div class="bg-emerald-600 p-2.5 rounded-2xl text-white shadow-md shadow-emerald-600/20">
              <Tent :size="20" />
            </div>
            <span class="text-lg font-black text-emerald-900 tracking-tight">CampRent</span>
          </div>
          <p class="text-xs text-slate-500 leading-relaxed">
            Penyedia layanan sewa alat outdoor dan camping steril, berkualitas tinggi, dan siap pakai untuk setiap petualanganmu.
          </p>
          <div class="inline-flex items-center gap-2 bg-white border border-emerald-100 rounded-full px-3 py-1.5 text-[10px] font-bold text-emerald-700 shadow-sm">
            <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
            Siap menemani petualanganmu
          </div>
        </div>

        <!-- Quick Links -->
        <div>
          <h4 class="text-xs font-bold uppercase tracking-wider text-emerald-900 mb-4">Layanan</h4>
          <ul class="space-y-3 text-xs text-slate-500">
            <li><router-link to="/catalog" class="hover:text-emerald-700 transition">Katalog Alat</router-link></li>
            <li><router-link to="/history" class="hover:text-emerald-700 transition">Cek Transaksi</router-link></li>
            <li><a href="#" class="hover:text-emerald-700 transition">Syarat & Ketentuan</a></li>
          </ul>
        </div>

        <!-- Support -->
        <div>
          <h4 class="text-xs font-bold uppercase tracking-wider text-emerald-900 mb-4">Dukungan</h4>
          <ul class="space-y-3 text-xs text-slate-500">
            <li><a href="#" class="hover:text-emerald-700 transition">Panduan Pemesanan</a></li>
            <li><a href="#" class="hover:text-emerald-700 transition">F.A.Q</a></li>
            <li><a href="#" class="hover:text-emerald-700 transition">Pusat Bantuan</a></li>
          </ul>
        </div>

        <!-- Contact Info -->
        <div>
          <h4 class="text-xs font-bold uppercase tracking-wider text-emerald-900 mb-4">Kontak</h4>
          <ul class="space-y-2.5 text-xs text-slate-500">
            <li class="flex items-center gap-2 bg-white/70 border border-emerald-100 rounded-xl px-3 py-2">
              <MapPin :size="14" class="text-emerald-600 shrink-0" />
              <span>Bandung, Jawa Barat</span>
            </li>
            <li class="flex items-center gap-2 bg-white/70 border border-emerald-100 rounded-xl px-3 py-2">
              <Phone :size="14" class="text-emerald-600 shrink-0" />
              <span>+62 812-3456-7890</span>
            </li>
            <li class="flex items-center gap-2 bg-white/70 border border-emerald-100 rounded-xl px-3 py-2">
              <Mail :size="14" class="text-emerald-600 shrink-0" />
              <span>support@camprent.id</span>
            </li>
          </ul>
        </div>

      </div>

      <div class="border-t border-emerald-100 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
        <p>&copy; {{ new Date().getFullYear() }} CampRent. All rights reserved.</p>
        <p class="flex items-center gap-1">
          Dibuat dengan <Heart :size="12" class="text-rose-500 fill-rose-500" /> untuk para petualang.
        </p>
      </div>
    </div>
  </footer>
</template>