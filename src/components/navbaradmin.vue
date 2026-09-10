<script setup>
import { Bell, LogOut, Menu, Tent } from 'lucide-vue-next';

defineProps({
  title: {
    type: String,
    default: 'Admin Workspace'
  },
  adminUser: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['menu', 'logout']);
</script>

<template>
  <header class="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-emerald-100/80 px-4 sm:px-8 py-3 flex items-center justify-between shadow-sm">
    <div class="flex items-center gap-3 min-w-0">
      <button
        type="button"
        @click="emit('menu')"
        class="lg:hidden p-2 bg-emerald-50 hover:bg-emerald-100 rounded-xl text-emerald-700 transition cursor-pointer"
        aria-label="Buka menu admin"
      >
        <Menu :size="20" />
      </button>
      <div class="flex items-center gap-2.5 min-w-0">
        <div class="hidden sm:flex w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 items-center justify-center">
          <Tent :size="18" />
        </div>
        <div class="min-w-0">
          <span class="block text-[9px] font-black uppercase tracking-[0.18em] text-emerald-600">Admin Panel</span>
          <h2 class="text-base sm:text-lg font-black text-slate-900 tracking-tight truncate">{{ title }}</h2>
        </div>
      </div>
    </div>

    <div class="flex items-center gap-2 sm:gap-3 shrink-0">
      <slot name="actions"></slot>
      <button type="button" class="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl transition relative cursor-pointer border border-emerald-100" aria-label="Notifikasi">
        <Bell :size="17" />
        <span class="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full"></span>
      </button>
      <div class="hidden sm:flex items-center gap-2 bg-emerald-50/70 border border-emerald-100 rounded-xl px-2.5 py-1.5">
        <span class="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-black">
          {{ adminUser.name ? adminUser.name.charAt(0).toUpperCase() : 'A' }}
        </span>
        <span class="text-xs font-bold text-slate-700 max-w-28 truncate">{{ adminUser.name || 'Administrator' }}</span>
      </div>
      <button type="button" @click="emit('logout')" class="p-2.5 bg-white hover:bg-rose-50 text-rose-600 rounded-xl transition cursor-pointer border border-rose-100" aria-label="Keluar akun">
        <LogOut :size="17" />
      </button>
    </div>
  </header>
</template>
