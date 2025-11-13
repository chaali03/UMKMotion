import 'dotenv/config';
import { upsertStoresByName, deleteAllStores, listStoresWithWIB, listStores, deleteStoreByName, } from '../lib/stores.js';
// debug info
console.log('[SEED] Script seeding dijalankan!');
console.log('[SEED] Waktu sekarang (WIB):', new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }));
// === DATA TOKO (8 TOKO LENGKAP) ===
export const stores = [
    {
        nama_toko: "Nusantara Rasa", // ← BISA GANTI HURUF BESAR/KECIL
        image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&auto=format&fit=crop&q=60",
        banner: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1920&auto=format&fit=crop&q=60",
        kategori: "Makanan & Minuman",
        deskripsi_toko: "Nusantara Rasa menyediakan berbagai produk makanan dan minuman khas Nusantara dengan kualitas terbaik. Kami berkomitmen menghadirkan cita rasa autentik Indonesia untuk keluarga Indonesia.",
        lokasi_toko: "Jl. Raya Darmo Permai III No.17, Pradahkalindungan, Kec. Dukuhpakis, Kota Surabaya, Jawa Timur 60226",
        no_telp: "+62 31 5678 9012",
        email: "hello@nusantararasa.id",
        profileImage: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=60",
        jam_operasional: "07:00 - 22:00",
        hari_operasional: "Senin - Minggu",
        rating_toko: 5.0,
        jumlah_review: 200,
        maps_link: "https://maps.app.goo.gl/8vN9vL3kP9bZfG8J7",
        fasilitas: ["Parkir", "Toilet", "WiFi", "Ruang Tunggu", "Mushola"],
        metode_pembayaran: ["Cash", "Debit Card", "Credit Card", "E-Wallet", "QRIS", "Transfer Bank"],
        social: { instagram: "nusantararasa.id", whatsapp: "+623156789012" },
    },
    {
        nama_toko: "Kain Nusantara",
        image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=1200&auto=format&fit=crop&q=60",
        banner: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=1920&auto=format&fit=crop&q=60",
        kategori: "Fashion & Tekstil",
        deskripsi_toko: "Pusat kain batik dan tekstil tradisional Indonesia. Kain Nusantara menawarkan berbagai koleksi batik tulis, batik cap, dan kain tenun dari berbagai daerah di Indonesia dengan motif dan kualitas terbaik.",
        lokasi_toko: "Jl. Kauman No.25, Kauman, Kec. Pekalongan Timur, Kota Pekalongan, Jawa Tengah 51122",
        no_telp: "+62 285 4321 567",
        email: "hello@kainnusantara.id",
        profileImage: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=400&auto=format&fit=crop&q=60",
        jam_operasional: "08:00 - 17:00",
        hari_operasional: "Senin - Sabtu",
        rating_toko: 4.9,
        jumlah_review: 89,
        maps_link: "https://maps.app.goo.gl/3kL9mP7vX2fZ9k8J6",
        fasilitas: ["Parkir", "Ruang Fitting", "Konsultasi Motif", "Workshop Batik"],
        metode_pembayaran: ["Cash", "Transfer Bank", "E-Wallet", "QRIS", "Credit Card"],
        social: { instagram: "kainnusantara", facebook: "KainNusantaraPekalongan" },
    },
    {
        nama_toko: "Karya Nusantara",
        image: "https://images.unsplash.com/photo-1582639590011-f5a8416d1101?w=1200&auto=format&fit=crop&q=60",
        banner: "https://images.unsplash.com/photo-1582639590011-f5a8416d1101?w=1920&auto=format&fit=crop&q=60",
        kategori: "Kerajinan Tangan",
        deskripsi_toko: "Galeri dan toko kerajinan tangan Indonesia. Karya Nusantara menghadirkan berbagai produk kerajinan berkualitas seperti anyaman, ukiran kayu, keramik, dan suvenir khas Nusantara yang dibuat oleh pengrajin lokal terpilih.",
        lokasi_toko: "Jl. Imogiri Timur No.123, Giwangan, Kec. Umbulharjo, Kota Yogyakarta, Daerah Istimewa Yogyakarta 55163",
        no_telp: "+62 274 8901 234",
        email: "hello@karyanusantara.id",
        profileImage: "https://klik-online.com/wp-content/uploads/2023/12/DUTA.jpg",
        jam_operasional: "09:00 - 21:00",
        hari_operasional: "Senin - Minggu",
        rating_toko: 4.9,
        jumlah_review: 156,
        maps_link: "https://maps.app.goo.gl/9vX8kL3mP7vZfG8J7",
        fasilitas: ["Parkir", "Galeri Pameran", "Workshop", "Café"],
        metode_pembayaran: ["Cash", "Debit Card", "Credit Card", "E-Wallet", "QRIS", "Transfer Bank"],
        social: { instagram: "karyanusantara", whatsapp: "+622748901234" },
    },
    {
        nama_toko: "Apotek Sehat Nusantara",
        image: "https://images.unsplash.com/photo-1576602976047-174e57a47881?w=1200&auto=format&fit=crop&q=60",
        banner: "https://images.unsplash.com/photo-1576602976047-174e57a47881?w=1920&auto=format&fit=crop&q=60",
        kategori: "Kesehatan",
        deskripsi_toko: "Apotek terpercaya dengan pelayanan farmasi profesional 24 jam. Menyediakan obat-obatan, vitamin, suplemen, alat kesehatan, dan produk kesehatan lainnya dengan harga terjangkau dan kualitas terjamin.",
        lokasi_toko: "Jl. Raya Pondok Gede No.27, Jatimakmur, Kec. Pondok Gede, Kota Bekasi, Jawa Barat 17413",
        no_telp: "+62 21 8456 7890",
        email: "support@apoteksehatnusantara.id",
        profileImage: "https://images.unsplash.com/photo-1576602976047-174e57a47881?w=400&auto=format&fit=crop&q=60",
        jam_operasional: "07:00 - 23:00",
        hari_operasional: "Senin - Minggu",
        rating_toko: 4.9,
        jumlah_review: 203,
        maps_link: "https://maps.app.goo.gl/2mK9vL3kP7bZfG8J7",
        fasilitas: ["Parkir", "Konsultasi Dokter", "Drive Thru", "Apotek 24 Jam"],
        metode_pembayaran: ["Cash", "Debit Card", "Credit Card", "E-Wallet", "QRIS", "Transfer Bank", "BPJS"],
        social: { whatsapp: "+622184567890" },
    },
    {
        nama_toko: "Tani Makmur Indonesia",
        image: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1200&auto=format&fit=crop&q=60",
        banner: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1920&auto=format&fit=crop&q=60",
        kategori: "Pertanian",
        deskripsi_toko: "Toko pertanian terlengkap yang menyediakan bibit unggul, pupuk organik dan anorganik, pestisida, alat pertanian modern, dan perlengkapan berkebun. Melayani petani dan penggemar urban farming dengan konsultasi gratis.",
        lokasi_toko: "Jl. Raya Tlogomas No.56, Lowokwaru, Kec. Lowokwaru, Kota Malang, Jawa Timur 65144",
        no_telp: "+62 341 5678 901",
        email: "support@tanimakmur.id",
        profileImage: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&auto=format&fit=crop&q=60",
        jam_operasional: "07:00 - 18:00",
        hari_operasional: "Senin - Sabtu",
        rating_toko: 4.9,
        jumlah_review: 97,
        maps_link: "https://maps.app.goo.gl/5vN9vL3kP9bZfG8J7",
        fasilitas: ["Parkir Luas", "Konsultasi Gratis", "Demo Alat", "Gudang Pupuk"],
        metode_pembayaran: ["Cash", "Transfer Bank", "E-Wallet", "QRIS", "Kredit Pertanian"],
        social: { instagram: "tanimakmur", facebook: "TaniMakmurIndonesia" },
    },
    {
        nama_toko: "Gadget Nusantara",
        image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1200&auto=format&fit=crop&q=60",
        banner: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1920&auto=format&fit=crop&q=60",
        kategori: "Elektronik",
        deskripsi_toko: "Official store gadget dan elektronik terlengkap. Menyediakan smartphone, laptop, tablet, smartwatch, accessories, dan berbagai produk teknologi terkini dari brand ternama dengan garansi resmi dan harga kompetitif.",
        lokasi_toko: "Jl. Pluit Karang Ayu No.B1, Pluit, Kec. Penjaringan, Kota Jakarta Utara, Daerah Khusus Ibukota Jakarta 14450",
        no_telp: "+62 21 6789 0123",
        email: "support@gadgetnusantara.id",
        profileImage: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&auto=format&fit=crop&q=60",
        jam_operasional: "07:00 - 22:00",
        hari_operasional: "Senin - Minggu",
        rating_toko: 4.9,
        jumlah_review: 312,
        maps_link: "https://maps.app.goo.gl/7kL9mP7vX2fZ9k8J6",
        fasilitas: ["Service Center", "Demo Produk", "Trade-in", "Cicilan 0%"],
        metode_pembayaran: ["Cash", "Debit Card", "Credit Card", "E-Wallet", "QRIS", "Transfer Bank", "Cicilan 0%"],
        social: { instagram: "gadgetnusantara", facebook: "GadgetNusantaraOfficial", whatsapp: "+622167890123" },
    },
    {
        nama_toko: "Mebel Nusantara",
        image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&auto=format&fit=crop&q=60",
        banner: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1920&auto=format&fit=crop&q=60",
        kategori: "Furniture",
        deskripsi_toko: "Produsen dan penjual furniture berkualitas tinggi khas Jepara. Mebel Nusantara menawarkan berbagai produk furniture kayu jati seperti kursi, meja, lemari, tempat tidur, dan custom furniture dengan ukiran detail dan finishing premium.",
        lokasi_toko: "Jl. Raya Tahunan Jepara No.88, Tahunan, Kec. Tahunan, Kabupaten Jepara, Jawa Tengah 59425",
        no_telp: "+62 291 3456 789",
        email: "support@mebelnusantara.id",
        profileImage: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&auto=format&fit=crop&q=60",
        jam_operasional: "07:00 - 19:00",
        hari_operasional: "Senin - Sabtu",
        rating_toko: 4.9,
        jumlah_review: 145,
        maps_link: "https://maps.app.goo.gl/4kL9mP7vX2fZ9k8J6",
        fasilitas: ["Showroom", "Custom Order", "Pengiriman", "Garansi Kayu"],
        metode_pembayaran: ["Cash", "Transfer Bank", "Credit Card", "Cicilan", "DP System"],
        social: { instagram: "mebelnusantara", whatsapp: "+622913456789" },
    },
    {
        nama_toko: "Cendekia Press",
        image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&auto=format&fit=crop&q=60",
        banner: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920&auto=format&fit=crop&q=60",
        kategori: "Buku & Percetakan",
        deskripsi_toko: "Penerbit dan toko buku terpercaya yang menyediakan berbagai koleksi buku pelajaran, buku referensi, novel, komik, dan alat tulis. Juga melayani jasa percetakan untuk buku, majalah, brosur, dan berbagai kebutuhan cetak lainnya.",
        lokasi_toko: "Jl. Kaliurang KM 5,2 No.27, Condongcatur, Kec. Depok, Kabupaten Sleman, Daerah Istimewa Yogyakarta 55281",
        no_telp: "+62 274 5678 123",
        email: "hello@cendekiapress.id",
        profileImage: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&auto=format&fit=crop&q=60",
        jam_operasional: "07:00 - 21:00",
        hari_operasional: "Senin - Minggu",
        rating_toko: 4.9,
        jumlah_review: 178,
        maps_link: "https://maps.app.goo.gl/6vX8kL3mP7vZfG8J7",
        fasilitas: ["Toko Buku", "Percetakan", "Fotokopi", "Café Baca"],
        metode_pembayaran: ["Cash", "Debit Card", "Credit Card", "E-Wallet", "QRIS", "Transfer Bank"],
        social: { instagram: "cendekiapress", facebook: "CendekiaPress" },
    },
];
// normalisasi nama
const normalize = (s) => s.trim().toLowerCase();
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
    const items = stores.map(s => ({ ...s }));
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
                results = await upsertStoresByName(stores.map(s => ({ ...s })));
            }
            else {
                console.log('[MODE] FULL SYNC (hapus + update + insert)');
                results = await syncAndSeed();
            }
            console.log(`\nSUCCESS: ${results.length} toko diproses!`);
            console.log('\n=== DATABASE SAAT INI (WIB) ===');
            await listStoresWithWIB();
        }
        catch (error) {
            console.error('GAGAL:', error.message);
            process.exit(1);
        }
        finally {
            process.exit(0);
        }
    })();
}
