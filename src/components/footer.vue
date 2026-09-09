<script setup>
import { Tent, Heart, Phone, Mail, MapPin } from 'lucide-vue-next';
</script>

<template>
  <footer class="bg-slate-900 text-slate-300 mt-16 border-t border-slate-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        
        <!-- Brand Info -->
        <div class="space-y-3 md:col-span-1">
          <div class="flex items-center gap-2.5">
            <div class="bg-emerald-600 p-2 rounded-xl text-white">
              <Tent :size="20" />
            </div>
            <span class="text-lg font-black text-white tracking-tight">CampRent</span>
          </div>
          <p class="text-xs text-slate-400 leading-relaxed">
            Penyedia layanan sewa alat outdoor dan camping steril, berkualitas tinggi, dan siap pakai untuk setiap petualanganmu.
          </p>
        </div>

        <!-- Quick Links -->
        <div>
          <h4 class="text-xs font-bold uppercase tracking-wider text-white mb-3">Layanan</h4>
          <ul class="space-y-2 text-xs text-slate-400">
            <li><router-link to="/catalog" class="hover:text-emerald-400 transition">Katalog Alat</router-link></li>
            <li><router-link to="/history" class="hover:text-emerald-400 transition">Cek Transaksi</router-link></li>
            <li><a href="#" class="hover:text-emerald-400 transition">Syarat & Ketentuan</a></li>
          </ul>
        </div>

        <!-- Support -->
        <div>
          <h4 class="text-xs font-bold uppercase tracking-wider text-white mb-3">Dukungan</h4>
          <ul class="space-y-2 text-xs text-slate-400">
            <li><a href="#" class="hover:text-emerald-400 transition">Panduan Pemesanan</a></li>
            <li><a href="#" class="hover:text-emerald-400 transition">F.A.Q</a></li>
            <li><a href="#" class="hover:text-emerald-400 transition">Pusat Bantuan</a></li>
          </ul>
        </div>

        <!-- Contact Info -->
        <div>
          <h4 class="text-xs font-bold uppercase tracking-wider text-white mb-3">Kontak</h4>
          <ul class="space-y-2 text-xs text-slate-400">
            <li class="flex items-center gap-2">
              <MapPin :size="14" class="text-emerald-500 shrink-0" />
              <span>Bandung, Jawa Barat</span>
            </li>
            <li class="flex items-center gap-2">
              <Phone :size="14" class="text-emerald-500 shrink-0" />
              <span>+62 812-3456-7890</span>
            </li>
            <li class="flex items-center gap-2">
              <Mail :size="14" class="text-emerald-500 shrink-0" />
              <span>support@camprent.id</span>
            </li>
          </ul>
        </div>

      </div>

      <div class="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
        <p>&copy; {{ new Date().getFullYear() }} CampRent. All rights reserved.</p>
        <p class="flex items-center gap-1">
          Dibuat dengan <Heart :size="12" class="text-rose-500 fill-rose-500" /> untuk para petualang.
        </p>
      </div>
    </div>
  </footer>
</template>