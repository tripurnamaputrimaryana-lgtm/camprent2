import { computed, ref } from 'vue';

const STORAGE_KEY = 'camprent_cart';
const cartItems = ref(loadCart());

function loadCart() {
  try {
    const savedCart = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(savedCart) ? savedCart : [];
  } catch {
    return [];
  }
}

function saveCart() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems.value));
}

export function useCart() {
  const cartCount = computed(() => cartItems.value.reduce((total, item) => total + item.quantity, 0));

  const addToCart = (equipment) => {
    const existingItem = cartItems.value.find((item) => item.id === equipment.id);
    const stock = Number(equipment.stock || equipment.stok || 0);

    if (existingItem) {
      existingItem.quantity = Math.min(existingItem.quantity + 1, stock || existingItem.quantity + 1);
    } else {
      cartItems.value.push({
        id: equipment.id,
        name: equipment.name || equipment.title,
        price: Number(equipment.price_per_day || equipment.price || equipment.harga || 0),
        stock,
        image: equipment.image || equipment.gambar || '',
        quantity: 1,
      });
    }
    saveCart();
  };

  const updateQuantity = (equipmentId, quantity) => {
    const item = cartItems.value.find((cartItem) => cartItem.id === equipmentId);
    if (!item) return;

    const maxQuantity = item.stock || 99;
    item.quantity = Math.max(1, Math.min(Number(quantity) || 1, maxQuantity));
    saveCart();
  };

  const removeFromCart = (equipmentId) => {
    cartItems.value = cartItems.value.filter((item) => item.id !== equipmentId);
    saveCart();
  };

  const clearCart = () => {
    cartItems.value = [];
    saveCart();
  };

  return { cartItems, cartCount, addToCart, updateQuantity, removeFromCart, clearCart };
}