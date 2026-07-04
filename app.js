// ============================================================
// BagVerse Store - API Integration Layer
// Author: Dewi Shinta
// ============================================================

export const BASE_URL = 'https://web-production-8184a.up.railway.app/api';

// ============================================================
// STORAGE HELPER
// Admin & customer pakai session key berbeda agar tidak saling timpa.
// Data cart/wishlist/orders dipisah per user ID.
// ============================================================

function isAdminContext() {
  // Cek dari URL path
  return window.location.pathname.includes('/admin');
}

// Key session: admin pakai 'admin_session', customer pakai 'session'
const SESSION_KEY = () => isAdminContext() ? 'admin_session' : 'session';
const TOKEN_KEY   = () => isAdminContext() ? 'admin_token'   : 'auth_token';

// Key storage per user (cart, wishlist, orders)
function storageKey(key) {
  // Baca dari kedua kemungkinan session
  const user = JSON.parse(localStorage.getItem('session'))
            || JSON.parse(localStorage.getItem('admin_session'));
  const prefix = user ? `u${user.id}_` : 'guest_';
  return prefix + key;
}

// ============================================================
// API HELPER
// ============================================================
async function apiFetch(endpoint, options = {}) {
  // Ambil token dari context yang sesuai
  const token = localStorage.getItem(TOKEN_KEY())
             || localStorage.getItem('auth_token')
             || localStorage.getItem('admin_token');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  try {
    const res  = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
    const data = await res.json();
    return { ok: res.ok, status: res.status, data };
  } catch (err) {
    console.error(`[API Error] ${endpoint}:`, err);
    return { ok: false, status: 0, data: { success: false, message: 'Tidak dapat terhubung ke server.' } };
  }
}

// ============================================================
// STORE OBJECT
// ============================================================
export const Store = {

  // ---------- AUTH ----------
  // getUser membaca session sesuai context (admin page atau customer page)
  getUser() {
    if (isAdminContext()) {
      return JSON.parse(localStorage.getItem('admin_session'));
    }
    // Halaman customer: baca customer session, BUKAN admin session
    return JSON.parse(localStorage.getItem('session'));
  },

  setUser(user) {
    if (isAdminContext()) {
      localStorage.setItem('admin_session', JSON.stringify(user));
    } else {
      localStorage.setItem('session', JSON.stringify(user));
    }
  },

  getToken() {
    return isAdminContext()
      ? localStorage.getItem('admin_token')
      : localStorage.getItem('auth_token');
  },

  setToken(token) {
    if (isAdminContext()) {
      localStorage.setItem('admin_token', token);
    } else {
      localStorage.setItem('auth_token', token);
    }
  },

  logout() {
    if (isAdminContext()) {
      // Admin logout: hapus hanya admin session, customer session tetap
      localStorage.removeItem('admin_session');
      localStorage.removeItem('admin_token');
      window.location.href = 'login.html'; // relatif ke /admin/
    } else {
      // Customer logout: hapus hanya customer session, admin session tetap
      localStorage.removeItem('session');
      localStorage.removeItem('auth_token');
      window.location.href = 'index.html';
    }
  },

  // ---------- API: Auth ----------
  async apiRegister(name, email, password) {
    return apiFetch('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) });
  },

  async apiLogin(email, password) {
    const result = await apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    if (result.ok && result.data.token) {
      this.setToken(result.data.token);
      this.setUser(result.data.user);
      // Merge guest cart/wishlist ke akun hanya untuk customer login
      if (!isAdminContext()) {
        _mergeGuestToUser(result.data.user);
      }
    }
    return result;
  },

  // ---------- API: Products ----------
  async apiGetProducts(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return apiFetch(`/products${qs ? '?' + qs : ''}`);
  },
  async apiGetProduct(id)       { return apiFetch(`/products/${id}`); },
  async apiCreateProduct(data)  { return apiFetch('/products', { method: 'POST', body: JSON.stringify(data) }); },
  async apiUpdateProduct(id, d) { return apiFetch(`/products/${id}`, { method: 'PUT', body: JSON.stringify(d) }); },
  async apiDeleteProduct(id)    { return apiFetch(`/products/${id}`, { method: 'DELETE' }); },
  async apiGetAllProducts()     { return apiFetch('/products/admin/all'); },

  // ---------- API: Orders ----------
  async apiCheckout(orderData)         { return apiFetch('/orders/checkout', { method: 'POST', body: JSON.stringify(orderData) }); },
  async apiGetMyOrders()               { return apiFetch('/orders/my'); },
  async apiGetAllOrders(params = {})   { const qs = new URLSearchParams(params).toString(); return apiFetch(`/orders${qs ? '?' + qs : ''}`); },
  async apiUpdateOrderStatus(oid, s)   { return apiFetch(`/orders/${oid}/status`, { method: 'PUT', body: JSON.stringify({ status: s }) }); },
  async apiGetStats()                  { return apiFetch('/orders/admin/stats'); },

  // ---------- API: Wishlist ----------
  async apiGetWishlist()              { return apiFetch('/wishlist'); },
  async apiToggleWishlist(product_id) { return apiFetch('/wishlist/toggle', { method: 'POST', body: JSON.stringify({ product_id }) }); },
  async apiRemoveWishlist(productId)  { return apiFetch(`/wishlist/${productId}`, { method: 'DELETE' }); },

  // ---------- PRODUK ----------
  async getProducts() {
    const result = await this.apiGetProducts({ limit: 100 });
    if (result.ok && result.data.data) return result.data.data;
    const DATA_VERSION = '1.2';
    let local = JSON.parse(localStorage.getItem('all_products'));
    if (!local || localStorage.getItem('db_version') !== DATA_VERSION) {
      try {
        // Path relatif: dari /admin/ perlu ../data.json, dari root cukup ./data.json
        const dataPath = isAdminContext() ? '../data.json' : './data.json';
        const res   = await fetch(dataPath);
        const fresh = await res.json();
        localStorage.setItem('all_products', JSON.stringify(fresh));
        localStorage.setItem('db_version', DATA_VERSION);
        return fresh;
      } catch (e) { return local || []; }
    }
    return local;
  },

  // ---------- CART — per user, admin punya sendiri ----------
  getCart()      { return JSON.parse(localStorage.getItem(storageKey('cart'))) || []; },
  saveCart(cart) { localStorage.setItem(storageKey('cart'), JSON.stringify(cart)); },

  // ---------- WISHLIST — per user ----------
  getWishlist()       { return JSON.parse(localStorage.getItem(storageKey('wishlist'))) || []; },
  saveWishlist(data)  { localStorage.setItem(storageKey('wishlist'), JSON.stringify(data)); },

  async toggleWishlist(product) {
    const user = this.getUser();
    if (user) {
      const result = await this.apiToggleWishlist(product.id);
      if (result.ok) {
        let list = this.getWishlist();
        if (result.data.action === 'added') {
          if (!list.find(i => i.id === product.id)) list.push(product);
        } else {
          list = list.filter(i => i.id !== product.id);
        }
        this.saveWishlist(list);
        return { action: result.data.action, data: list };
      }
    }
    let list = this.getWishlist();
    const idx = list.findIndex(i => i.id === product.id);
    if (idx === -1) { list.push(product); this.saveWishlist(list); return { action: 'added', data: list }; }
    else { list.splice(idx, 1); this.saveWishlist(list); return { action: 'removed', data: list }; }
  },

  // ---------- ORDERS — per user ----------
  getOrders()          { return JSON.parse(localStorage.getItem(storageKey('orders'))) || []; },
  saveOrders(orders)   { localStorage.setItem(storageKey('orders'), JSON.stringify(orders)); },

  seedDummyOrders() { /* tidak lagi seed global */ },

  // ---------- THEME ----------
  initTheme() {
    if (localStorage.getItem('theme') === 'dark' ||
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
};

// Merge cart & wishlist guest ke user setelah login
function _mergeGuestToUser(user) {
  const guestCart = JSON.parse(localStorage.getItem('guest_cart')) || [];
  if (guestCart.length) {
    const userCartKey = `u${user.id}_cart`;
    const userCart    = JSON.parse(localStorage.getItem(userCartKey)) || [];
    guestCart.forEach(g => {
      const exist = userCart.find(u => u.id === g.id);
      if (exist) exist.qty += g.qty;
      else userCart.push(g);
    });
    localStorage.setItem(userCartKey, JSON.stringify(userCart));
    localStorage.removeItem('guest_cart');
  }

  const guestWish = JSON.parse(localStorage.getItem('guest_wishlist')) || [];
  if (guestWish.length) {
    const userWishKey = `u${user.id}_wishlist`;
    const userWish    = JSON.parse(localStorage.getItem(userWishKey)) || [];
    guestWish.forEach(g => {
      if (!userWish.find(u => u.id === g.id)) userWish.push(g);
    });
    localStorage.setItem(userWishKey, JSON.stringify(userWish));
    localStorage.removeItem('guest_wishlist');
  }
}

// ============================================================
// UI HELPERS
// ============================================================
export function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.innerText = msg;
  t.className = 'fixed bottom-10 left-1/2 -translate-x-1/2 bg-black text-white px-8 py-4 rounded-2xl shadow-2xl z-[300] transition-all duration-500 opacity-100 translate-y-0 font-bold text-xs';
  setTimeout(() => t.classList.add('opacity-0', 'translate-y-10'), 2500);
}

export function showAlert(title, message, type = 'success') {
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 flex items-center justify-center z-[200] p-4 bg-black/60 backdrop-blur-sm';
  modal.innerHTML = `
    <div class="bg-white dark:bg-gray-800 rounded-[40px] p-8 max-w-sm w-full text-center shadow-2xl">
      <div class="text-5xl mb-4">${type === 'success' ? '🎉' : '⚠️'}</div>
      <h3 class="text-xl font-black mb-2 dark:text-white">${title}</h3>
      <p class="text-sm opacity-60 mb-6 dark:text-gray-400">${message}</p>
      <button id="close-alert" class="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase text-xs hover:bg-indigo-700 transition">Oke</button>
    </div>`;
  document.body.appendChild(modal);
  document.getElementById('close-alert').onclick = () => modal.remove();
}
