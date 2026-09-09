<script setup>
import { ref } from 'vue';
import { users, search, mail, phone, shieldcheck } from 'lucide-vue-next';

const userslist = ref([
  { id: 1, name: 'budi santoso', email: 'budi@gmail.com', phone: '081234567890', role: 'customer', joined_at: '2026-01-12' },
  { id: 2, name: 'siti rahma', email: 'siti@gmail.com', phone: '089876543210', role: 'customer', joined_at: '2026-02-15' },
  { id: 3, name: 'abdan (admin)', email: 'admin@camprent.com', phone: '081122334455', role: 'admin', joined_at: '2025-11-01' },
]);

const searchquery = ref('');
</script>

<template>
  <div class="space-y-6 font-['plus_jakarta_sans',sans-serif]">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
      <div>
        <h1 class="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2.5">
          <users class="text-emerald-600" :size="24" />
          <span>data pelanggan & pengguna</span>
        </h1>
        <p class="text-xs text-slate-500 mt-1">daftar seluruh akun yang terdaftar pada sistem camprent.</p>
      </div>

      <div class="relative w-full sm:w-72">
        <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
          <search :size="16" />
        </span>
        <input 
          v-model="searchquery"
          type="text" 
          placeholder="cari nama atau email..." 
          class="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
        />
      </div>
    </div>

    <div class="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50/70 border-b border-slate-100 text-[11px] font-black uppercase tracking-wider text-slate-400">
              <th class="py-3.5 px-4">nama lengkap</th>
              <th class="py-3.5 px-4">email</th>
              <th class="py-3.5 px-4">no. telepon</th>
              <th class="py-3.5 px-4">role akun</th>
              <th class="py-3.5 px-4">tanggal bergabung</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-xs font-semibold text-slate-600">
            <tr v-for="user in userslist" :key="user.id" class="hover:bg-slate-50/50 transition">
              <td class="py-4 px-4 font-bold text-slate-800 flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 font-black flex items-center justify-center text-xs">
                  {{ user.name.charAt(0).toUpperCase() }}
                </div>
                {{ user.name }}
              </td>
              <td class="py-4 px-4 text-slate-500 flex items-center gap-1.5 pt-5">
                <mail :size="14" class="text-slate-400" />
                {{ user.email }}
              </td>
              <td class="py-4 px-4 text-slate-500">
                <span class="flex items-center gap-1.5">
                  <phone :size="14" class="text-slate-400" />
                  {{ user.phone }}
                </span>
              </td>
              <td class="py-4 px-4">
                <span :class="[
                  'px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase inline-flex items-center gap-1',
                  user.role === 'admin' ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                ]">
                  <shieldcheck :size="12" v-if="user.role === 'admin'" />
                  {{ user.role }}
                </span>
              </td>
              <td class="py-4 px-4 text-slate-500">{{ user.joined_at }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>