import 'dotenv/config';
import {
  upsertStoresByName,
  deleteAllStores,
  listStoresWithWIB,
  listStores,
  deleteStoreByName,
} from '../lib/stores.js';
import type { Store } from '../lib/stores.js';

// debug info
console.log('[SEED] Script seeding dijalankan!');
console.log('[SEED] Waktu sekarang (WIB):', new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }));

// === DATA TOKO (8 TOKO LENGKAP) - LOKASI DEPOK & JAKARTA ===
export const stores: Omit<Store, 'createdAt' | 'updatedAt'>[] = [
  {
    nama_toko: "Nusantara Rasa",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&auto=format&fit=crop&q=60",
    banner: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1920&auto=format&fit=crop&q=60",
    kategori: "Makanan & Minuman",
    deskripsi_toko: "Nusantara Rasa menyediakan berbagai produk makanan dan minuman khas Nusantara dengan kualitas terbaik. Kami berkomitmen menghadirkan cita rasa autentik Indonesia untuk keluarga Indonesia.",
    lokasi_toko: "Jl. Margonda Raya No.358, Kemiri Muka, Kec. Beji, Kota Depok, Jawa Barat 16423",
    no_telp: "+62 21 7720 5678",
    email: "hello@nusantararasa.id",
    profileImage: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=60",
    jam_operasional: "07:00 - 22:00",
    hari_operasional: "Senin - Minggu",
    rating_toko: 5.0,
    jumlah_review: 200,
    maps_link: "https://maps.app.goo.gl/8vN9vL3kP9bZfG8J7",
    social: { instagram: "nusantararasa.id", whatsapp: "+622177205678" },
  },
  {
    nama_toko: "Kain Nusantara",
    image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=1200&auto=format&fit=crop&q=60",
    banner: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=1920&auto=format&fit=crop&q=60",
    kategori: "Fashion & Tekstil",
    deskripsi_toko: "Pusat kain batik dan tekstil tradisional Indonesia. Kain Nusantara menawarkan berbagai koleksi batik tulis, batik cap, dan kain tenun dari berbagai daerah di Indonesia dengan motif dan kualitas terbaik.",
    lokasi_toko: "Jl. Raya Citayam No.45, Curug, Kec. Bojongsari, Kota Depok, Jawa Barat 16517",
    no_telp: "+62 21 8779 4321",
    email: "hello@kainnusantara.id",
    profileImage: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=400&auto=format&fit=crop&q=60",
    jam_operasional: "08:00 - 17:00",
    hari_operasional: "Senin - Sabtu",
    rating_toko: 4.9,
    jumlah_review: 89,
    maps_link: "https://maps.app.goo.gl/3kL9mP7vX2fZ9k8J6",
    social: { instagram: "kainnusantara", facebook: "KainNusantaraDepok" },
  },
  {
    nama_toko: "Karya Nusantara",
    image: "https://images.unsplash.com/photo-1582639590011-f5a8416d1101?w=1200&auto=format&fit=crop&q=60",
    banner: "https://images.unsplash.com/photo-1582639590011-f5a8416d1101?w=1920&auto=format&fit=crop&q=60",
    kategori: "Kerajinan Tangan",
    deskripsi_toko: "Galeri dan toko kerajinan tangan Indonesia. Karya Nusantara menghadirkan berbagai produk kerajinan berkualitas seperti anyaman, ukiran kayu, keramik, dan suvenir khas Nusantara yang dibuat oleh pengrajin lokal terpilih.",
    lokasi_toko: "Jl. Raya Sawangan No.123, Pancoran Mas, Kec. Pancoran Mas, Kota Depok, Jawa Barat 16436",
    no_telp: "+62 21 7564 8901",
    email: "hello@karyanusantara.id",
    profileImage: "https://images.unsplash.com/photo-1582639590011-f5a8416d1101?w=400&auto=format&fit=crop&q=60",
    jam_operasional: "09:00 - 21:00",
    hari_operasional: "Senin - Minggu",
    rating_toko: 4.9,
    jumlah_review: 156,
    maps_link: "https://maps.app.goo.gl/9vX8kL3mP7vZfG8J7",
    social: { instagram: "karyanusantara", whatsapp: "+622175648901" },
  },
  {
    nama_toko: "Apotek Sehat Nusantara",
    image: "https://images.unsplash.com/photo-1576602976047-174e57a47881?w=1200&auto=format&fit=crop&q=60",
    banner: "https://images.unsplash.com/photo-1576602976047-174e57a47881?w=1920&auto=format&fit=crop&q=60",
    kategori: "Kesehatan",
    deskripsi_toko: "Apotek terpercaya dengan pelayanan farmasi profesional 24 jam. Menyediakan obat-obatan, vitamin, suplemen, alat kesehatan, dan produk kesehatan lainnya dengan harga terjangkau dan kualitas terjamin.",
    lokasi_toko: "Jl. Raya Cinere No.27, Gandul, Kec. Cinere, Kota Depok, Jawa Barat 16514",
    no_telp: "+62 21 7545 6789",
    email: "support@apoteksehatnusantara.id",
    profileImage: "https://images.unsplash.com/photo-1576602976047-174e57a47881?w=400&auto=format&fit=crop&q=60",
    jam_operasional: "00:00 - 23:59",
    hari_operasional: "Senin - Minggu (24 Jam)",
    rating_toko: 4.9,
    jumlah_review: 203,
    maps_link: "https://maps.app.goo.gl/2mK9vL3kP7bZfG8J7",
    social: { whatsapp: "+622175456789" },
  },
  {
    nama_toko: "Tani Makmur Indonesia",
    image: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1200&auto=format&fit=crop&q=60",
    banner: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1920&auto=format&fit=crop&q=60",
    kategori: "Pertanian",
    deskripsi_toko: "Toko pertanian terlengkap yang menyediakan bibit unggul, pupuk organik dan anorganik, pestisida, alat pertanian modern, dan perlengkapan berkebun. Melayani petani dan penggemar urban farming dengan konsultasi gratis.",
    lokasi_toko: "Jl. Raya Parung No.56, Kemang, Kec. Bogor, Kabupaten Bogor, Jawa Barat 16330",
    no_telp: "+62 21 8796 5678",
    email: "support@tanimakmur.id",
    profileImage: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&auto=format&fit=crop&q=60",
    jam_operasional: "07:00 - 18:00",
    hari_operasional: "Senin - Sabtu",
    rating_toko: 4.9,
    jumlah_review: 97,
    maps_link: "https://maps.app.goo.gl/5vN9vL3kP9bZfG8J7",
    social: { instagram: "tanimakmur", facebook: "TaniMakmurIndonesia" },
  },
  {
    nama_toko: "Gadget Nusantara",
    image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1200&auto=format&fit=crop&q=60",
    banner: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1920&auto=format&fit=crop&q=60",
    kategori: "Elektronik",
    deskripsi_toko: "Official store gadget dan elektronik terlengkap. Menyediakan smartphone, laptop, tablet, smartwatch, accessories, dan berbagai produk teknologi terkini dari brand ternama dengan garansi resmi dan harga kompetitif.",
    lokasi_toko: "Margo City Lt. 2 Unit 207, Jl. Margonda Raya No.358, Kemiri Muka, Kec. Beji, Kota Depok, Jawa Barat 16423",
    no_telp: "+62 21 2934 6789",
    email: "support@gadgetnusantara.id",
    profileImage: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&auto=format&fit=crop&q=60",
    jam_operasional: "10:00 - 22:00",
    hari_operasional: "Senin - Minggu",
    rating_toko: 4.9,
    jumlah_review: 312,
    maps_link: "https://maps.app.goo.gl/7kL9mP7vX2fZ9k8J6",
    social: { instagram: "gadgetnusantara", facebook: "GadgetNusantaraOfficial", whatsapp: "+622129346789" },
  },
  {
    nama_toko: "Mebel Nusantara",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&auto=format&fit=crop&q=60",
    banner: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1920&auto=format&fit=crop&q=60",
    kategori: "Furniture",
    deskripsi_toko: "Produsen dan penjual furniture berkualitas tinggi khas Jepara. Mebel Nusantara menawarkan berbagai produk furniture kayu jati seperti kursi, meja, lemari, tempat tidur, dan custom furniture dengan ukiran detail dan finishing premium.",
    lokasi_toko: "Jl. Raya Limo No.88, Limo, Kec. Limo, Kota Depok, Jawa Barat 16515",
    no_telp: "+62 21 7532 3456",
    email: "support@mebelnusantara.id",
    profileImage: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&auto=format&fit=crop&q=60",
    jam_operasional: "08:00 - 19:00",
    hari_operasional: "Senin - Sabtu",
    rating_toko: 4.9,
    jumlah_review: 145,
    maps_link: "https://maps.app.goo.gl/4kL9mP7vX2fZ9k8J6",
    social: { instagram: "mebelnusantara", whatsapp: "+622175323456" },
  },
  {
    nama_toko: "Cendekia Press",
    image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&auto=format&fit=crop&q=60",
    banner: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920&auto=format&fit=crop&q=60",
    kategori: "Buku & Percetakan",
    deskripsi_toko: "Penerbit dan toko buku terpercaya yang menyediakan berbagai koleksi buku pelajaran, buku referensi, novel, komik, dan alat tulis. Juga melayani jasa percetakan untuk buku, majalah, brosur, dan berbagai kebutuhan cetak lainnya.",
    lokasi_toko: "Jl. Raya UI Kelapa Dua No.27, Tugu, Kec. Cimanggis, Kota Depok, Jawa Barat 16451",
    no_telp: "+62 21 8710 5678",
    email: "hello@cendekiapress.id",
    profileImage: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&auto=format&fit=crop&q=60",
    jam_operasional: "08:00 - 21:00",
    hari_operasional: "Senin - Minggu",
    rating_toko: 4.9,
    jumlah_review: 178,
    maps_link: "https://maps.app.goo.gl/6vX8kL3mP7vZfG8J7",
    social: { instagram: "cendekiapress", facebook: "CendekiaPress" },
  },
];

// normalisasi nama
const normalize = (s: string) => s.trim().toLowerCase();

//hapus update insert
async function syncAndSeed() {
  console.log('[SYNC] Mulai sync penuh...');

  // Ambil semua dari Firestore
  const dbStores = await listStores();
  const dbNames = new Set(dbStores.map(s => normalize(s.data.nama_toko)));
  const seedNames = new Set(stores.map(s => normalize(s.nama_toko)));

  // Hapus toko yang tidak ada di seed
  for (const store of dbStores) {
    if (!seedNames.has(normalize(store.data.nama_toko))) {
      console.log(`[DELETE] Hapus: ${store.data.nama_toko}`);
      await deleteStoreByName(store.data.nama_toko);
    }
  }

  // Upsert toko dari seed
  console.log('[UPSERT] Update/insert toko...');
  const items = stores.map(s => ({ ...s } as Partial<Store> & { nama_toko: string }));
  return await upsertStoresByName(items);
}

// seeding script
const isDirectRun = import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.includes('stores');

if (isDirectRun) {
  const mode = process.argv[2];

  (async () => {
    try {
      let results;

      if (mode === '--clean') {
        console.log('[MODE] CLEAN + RESEED');
        await deleteAllStores();
        results = await upsertStoresByName(stores.map(s => ({ ...s } as any)));
      } else {
        console.log('[MODE] FULL SYNC (hapus + update + insert)');
        results = await syncAndSeed();
      }

      console.log(`\nSUCCESS: ${results.length} toko diproses!`);
      console.log('\n=== DATABASE SAAT INI (WIB) ===');
      await listStoresWithWIB();

    } catch (error: any) {
      console.error('GAGAL:', error.message);
      process.exit(1);
    } finally {
      process.exit(0);
    }
  })();
}