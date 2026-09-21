<script setup>
import { computed, onMounted, onBeforeUnmount, ref } from 'vue';
import { Bell, LogOut, Menu, Tent, PackageCheck, Users, ShoppingBag } from 'lucide-vue-next';
import {
  getNotifications,
  markAllNotificationsAsRead,
  markOneNotificationAsRead,
  saveNotifications
} from '../utils/notifications';

const props = defineProps({
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

const isNotificationOpen = ref(false);
const notifications = ref([]);

const unreadCount = computed(() => notifications.value.filter((item) => !item.read).length);

const refreshNotifications = () => {
  notifications.value = getNotifications();
};

const toggleNotifications = () => {
  isNotificationOpen.value = !isNotificationOpen.value;
};

const markAllAsRead = () => {
  notifications.value = markAllNotificationsAsRead();
};

const markOneAsRead = (id) => {
  notifications.value = markOneNotificationAsRead(id);
};

const onNotificationsUpdated = () => {
  refreshNotifications();
};

onMounted(() => {
  refreshNotifications();
  window.addEventListener('admin-notifications-updated', onNotificationsUpdated);
});

onBeforeUnmount(() => {
  window.removeEventListener('admin-notifications-updated', onNotificationsUpdated);
});
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

    <div class="flex items-center gap-2 sm:gap-3 shrink-0 relative">
      <slot name="actions"></slot>

      <div class="relative">
        <button
          type="button"
          @click="toggleNotifications"
          class="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl transition relative cursor-pointer border border-emerald-100"
          aria-label="Notifikasi"
        >
          <Bell :size="17" />
          <span
            v-if="unreadCount > 0"
            class="absolute -top-1 -right-1 min-w-4 h-4 px-1 flex items-center justify-center bg-emerald-500 text-[9px] text-white rounded-full font-black"
          >
            {{ unreadCount > 9 ? '9+' : unreadCount }}
          </span>
        </button>

        <div
          v-if="isNotificationOpen"
          class="absolute right-0 top-12 w-[340px] bg-white border border-emerald-100 rounded-2xl shadow-2xl shadow-emerald-900/10 overflow-hidden z-50"
        >
          <div class="flex items-center justify-between px-4 py-3 border-b border-emerald-100 bg-emerald-50/60">
            <div>
              <p class="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">Notifikasi</p>
              <p class="text-[10px] text-slate-500">{{ unreadCount }} belum dibaca</p>
            </div>
            <button
              v-if="notifications.length"
              type="button"
              @click="markAllAsRead"
              class="text-[10px] font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer"
            >
              Tandai dibaca
            </button>
          </div>

          <div v-if="notifications.length" class="max-h-72 overflow-y-auto">
            <button
              v-for="item in notifications"
              :key="item.id"
              type="button"
              @click="markOneAsRead(item.id)"
              class="w-full text-left px-4 py-3 border-b border-emerald-50 hover:bg-emerald-50/60 transition cursor-pointer"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="flex-1">
                  <div class="flex items-center gap-2">
                    <span
                      :class="[
                        'w-2 h-2 rounded-full',
                        item.read ? 'bg-slate-300' : 'bg-emerald-500'
                      ]"
                    ></span>
                    <p class="text-xs font-extrabold text-slate-800">{{ item.title }}</p>
                  </div>
                  <p class="mt-1 text-[11px] text-slate-600 leading-relaxed">{{ item.message }}</p>
                  <p class="mt-1 text-[10px] text-slate-400">{{ item.createdAt ? new Date(item.createdAt).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }) : 'Baru' }}</p>
                </div>
              </div>
            </button>
          </div>

          <div v-else class="px-4 py-8 text-center text-slate-500">
            <div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <Bell :size="20" />
            </div>
            <p class="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Kosong</p>
            <p class="mt-2 text-sm text-slate-500">Belum ada aktivitas baru.</p>
          </div>
        </div>
      </div>

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
