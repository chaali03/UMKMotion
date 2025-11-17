# UMKMotion - Platform UMKM Modern

Platform komprehensif untuk UMKM (Usaha Mikro Kecil Menengah) dengan fitur lengkap mulai dari katalog produk, manajemen pesanan, hingga analitik bisnis.

## 🚀 Fitur Utama

- **Katalog Produk Digital** - Tampilkan produk dengan gambar dan deskripsi menarik
- **Manajemen Pesanan** - Sistem pemesanan terintegrasi dengan pembayaran digital
- **AI Assistant (Dina)** - Asisten virtual untuk membantu pelanggan 24/7
- **Analitik Bisnis** - Pantau kinerja penjualan dan pertumbuhan bisnis
- **Responsif** - Tampilan optimal di semua perangkat

## 🛠️ Teknologi yang Digunakan

- **Frontend**: Astro, React, TypeScript, Tailwind CSS
- **UI Components**: Framer Motion, React Icons
- **State Management**: Zustand
- **Form Handling**: React Hook Form
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **AI Integration**: Gemini API
- **Deployment**: Netlify

## 🚀 Cara Menjalankan

1. Clone repository ini
2. Install dependencies:
   ```bash
   npm install
   ```
3. Buat file `.env` berdasarkan `.env.example`
4. Jalankan development server:
   ```bash
   npm run dev
   ```
5. Buka `http://localhost:4321` di browser

## 🔗 Link Penting

- **Demo Aplikasi**: [https://umkmotion.netlify.app](https://umkmotion.netlify.app)
- **Video Pitching**: [Tonton di YouTube](https://youtu.be/pRsn-8m_CXQ)

## 🔐 Akses Login

Gunakan kredensial berikut untuk login ke sistem:
- **Email**: `umkmotion@gmail.com`
- **Password**: `chaali_MwD0324`

## 🏗️ Struktur Proyek

```
src/
├── components/          # Komponen React yang dapat digunakan ulang
│   ├── auth/          # Komponen autentikasi
│   ├── etalase/       # Komponen katalog produk
│   └── payment/       # Komponen pembayaran
├── pages/              # Halaman Astro
│   ├── index.astro     # Halaman utama
│   └── auth/           # Halaman autentikasi
├── layouts/           # Layout halaman
├── styles/            # File gaya global
└── utils/             # Utility functions
```

## 🚀 Fitur Unggulan

### Dina AI Assistant
- Asisten virtual cerdas berbasis AI
- Dapat diakses melalui tombol mengambang di sudut layar
- Membantu pengguna menemukan produk dan informasi

### Sistem Pembayaran
- Dukungan berbagai metode pembayaran digital
- Integrasi dengan sistem pembayaran populer
- Proses checkout yang aman dan mudah

### Manajemen Produk
- Upload dan kelola katalog produk
- Kategori dan tag untuk memudahkan pencarian
- Preview produk dengan gambar berkualitas tinggi

## 🔧 Perintah yang Tersedia

- `npm run dev` - Menjalankan development server
- `npm run build` - Build untuk produksi
- `npm run preview` - Preview hasil build produksi
- `npm run astro` - Menjalankan perintah Astro CLI

## 📚 Dokumentasi

- [Dokumentasi Astro](https://docs.astro.build/)
- [Dokumentasi React](https://react.dev/)
- [Dokumentasi TypeScript](https://www.typescriptlang.org/)
- [Dokumentasi Tailwind CSS](https://tailwindcss.com/)
- [Dokumentasi Firebase](https://firebase.google.com/docs)

## 🤝 Berkontribusi

Kami menerima kontribusi untuk pengembangan UMKMotion. Silakan buat issue atau pull request untuk fitur atau perbaikan bug.

## 📄 Lisensi

Proyek ini dilisensikan di bawah [MIT License](LICENSE).