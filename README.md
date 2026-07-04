# 👜 BagVerse Store - UASA Full Stack

**Mahasiswa:** Dewi Shinta  
**Mata Kuliah:** Pemrograman Web 2 - UASA  
**Stack:** Node.js + Express + MySQL (Backend) | HTML + Tailwind CSS (Frontend)

---

## 🗂️ Struktur Proyek

```
UAS/
├── backend/                 ← Node.js REST API
│   ├── config/db.js         ← Koneksi MySQL
│   ├── middleware/auth.js   ← JWT Auth Middleware
│   ├── routes/
│   │   ├── auth.js          ← Register, Login, Profile
│   │   ├── products.js      ← CRUD Produk
│   │   ├── orders.js        ← Checkout + Notif WA + Admin
│   │   ├── wishlist.js      ← Wishlist CRUD
│   │   └── users.js         ← User Management
│   ├── utils/whatsapp.js    ← WA Notification (Fonnte API)
│   ├── server.js            ← Entry Point
│   ├── bagverse_db.sql      ← Database Schema + Seed
│   ├── BagVerse_API.postman_collection.json
│   ├── .env                 ← Environment Variables
│   └── package.json
├── admin.html               ← Dashboard Admin (4 Tab)
├── index.html               ← Halaman Utama
├── cart.html                ← Keranjang + Checkout
├── detail.html              ← Detail Produk
├── wishlist.html            ← Wishlist
├── history.html             ← Riwayat Pesanan
├── login.html               ← Login
├── register.html            ← Register
├── app.js                   ← API Integration Layer
└── data.json                ← Fallback data
```

---

## 🔌 API Endpoints

Base URL: `http://localhost:3000` (lokal) atau Railway URL saat deploy

### 🔐 Auth
| Method | Endpoint | Deskripsi | Auth |
|--------|----------|-----------|------|
| POST | `/api/auth/register` | Daftar akun | - |
| POST | `/api/auth/login` | Login, dapat JWT token | - |
| GET | `/api/auth/profile` | Profil user aktif | ✅ User |

### 📦 Products
| Method | Endpoint | Deskripsi | Auth |
|--------|----------|-----------|------|
| GET | `/api/products` | Semua produk (search, filter, sort, pagination) | - |
| GET | `/api/products/:id` | Detail produk | - |
| POST | `/api/products` | Tambah produk | ✅ Admin |
| PUT | `/api/products/:id` | Update produk | ✅ Admin |
| DELETE | `/api/products/:id` | Hapus produk (soft delete) | ✅ Admin |
| GET | `/api/products/admin/all` | Semua produk incl. nonaktif | ✅ Admin |

Query params: `?search=bag&category=Wanita&sort=cheap&page=1&limit=6`

### 🛒 Orders
| Method | Endpoint | Deskripsi | Auth |
|--------|----------|-----------|------|
| POST | `/api/orders/checkout` | Buat pesanan + notif WA | ✅ User |
| GET | `/api/orders/my` | Riwayat pesanan user | ✅ User |
| GET | `/api/orders/:orderId` | Detail satu pesanan | ✅ User/Admin |
| GET | `/api/orders` | Semua pesanan | ✅ Admin |
| PUT | `/api/orders/:orderId/status` | Update status | ✅ Admin |
| GET | `/api/orders/admin/stats` | Statistik dashboard | ✅ Admin |

### ❤️ Wishlist
| Method | Endpoint | Deskripsi | Auth |
|--------|----------|-----------|------|
| GET | `/api/wishlist` | Ambil wishlist | ✅ User |
| POST | `/api/wishlist` | Tambah ke wishlist | ✅ User |
| POST | `/api/wishlist/toggle` | Toggle wishlist | ✅ User |
| DELETE | `/api/wishlist/:productId` | Hapus dari wishlist | ✅ User |

### 👤 Users
| Method | Endpoint | Deskripsi | Auth |
|--------|----------|-----------|------|
| GET | `/api/users` | Semua user | ✅ Admin |
| GET | `/api/users/:id` | Detail user | ✅ User |
| PUT | `/api/users/:id` | Update profil | ✅ User |
| DELETE | `/api/users/:id` | Hapus user | ✅ Admin |

---

## 🚀 Cara Menjalankan

### 1. Setup Database
1. Pastikan XAMPP MySQL berjalan
2. Jalankan SQL:
```bash
mysql -u root < backend/bagverse_db.sql
```

### 2. Setup Backend
```bash
cd backend
cp .env.example .env    # edit DB credentials
npm install
npm start               # http://localhost:3000
```

### 3. Setup Frontend
Buka dengan Live Server (VS Code) atau XAMPP:
- `http://localhost/UAS/`

### Akun Demo
| Email | Password | Role |
|-------|----------|------|
| admin@mail.com | admin123 | Admin |
| dewi@mail.com | user123 | User |

---

## 📲 Notifikasi WhatsApp

Saat checkout, sistem mengirim notifikasi ke nomor owner. Dua opsi:

**Option 1 - Fonnte (Gratis):**
1. Daftar di [fonnte.com](https://fonnte.com)
2. Tambahkan di `.env`: `FONNTE_TOKEN=your_token`

**Option 2 - Fallback:** Link wa.me di-generate otomatis dan ditampilkan di console server.

---

## 🏗️ Deploy ke Railway

1. Push backend ke repo GitHub
2. Buat project baru di [railway.app](https://railway.app)
3. Add MySQL service, ambil connection string
4. Set environment variables sesuai `.env.example`
5. Deploy, ambil URL dan update `BASE_URL` di `app.js`

---

## ✨ Fitur Dashboard Admin (4 Tab)

1. **📊 Dashboard** - Revenue, Orders, Chart trend, Category stats, Transaction log, Export CSV
2. **📦 Produk** - CRUD produk (tambah, edit, hapus, filter, search)
3. **🛒 Pesanan** - Lihat semua pesanan, update status (pending → processing → shipped → delivered)
4. **👤 Users** - Lihat & hapus users

---

*Dibuat oleh Dewi Shinta | UASA Pemrograman Web 2 | 2026*
