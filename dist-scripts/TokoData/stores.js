import 'dotenv/config';
import { upsertStoresByName, deleteAllStores, listStoresWithWIB, listStores, deleteStoreByName, } from '../lib/stores.js';
// debug info
console.log('[SEED] Script seeding dijalankan!');
console.log('[SEED] Waktu sekarang (WIB):', new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }));
// Helper: generate random date in last 6 months
const randomDate = (daysAgo) => {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
    return date.toISOString();
};
// === DATA TOKO (8 TOKO + 3 ULASAN PER TOKO) ===
export const stores = [
    {
        nama_toko: "Nusantara Rasa",
        image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&auto=format&fit=crop&q=60",
        banner: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1920&auto=format&fit=crop&q=60",
        kategori: "Makanan & Minuman",
        deskripsi_toko: "Nusantara Rasa menyediakan berbagai produk makanan and minuman khas Nusantara dengan kualitas terbaik. Kami berkomitmen menghadirkan cita rasa autentik Indonesia untuk keluarga Indonesia.",
        lokasi_toko: "Jl. Raya Darmo Permai III No.17, Pradahkalindungan, Kec. Dukuhpakis, Kota Surabaya, Jawa Timur 60226",
        no_telp: "+62 31 5678 9012",
        email: "hello@nusantararasa.id",
        profileImage: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=60",
        jam_operasional: "07:00 - 22:00",
        hari_operasional: "Senin - Minggu",
        rating_toko: 5.0,
        jumlah_review: 203,
        maps_link: "https://maps.app.goo.gl/8vN9vL3kP9bZfG8J7",
        fasilitas: ["Parkir", "Toilet", "WiFi", "Ruang Tunggu", "Mushola"],
        metode_pembayaran: ["Cash", "Debit Card", "Credit Card", "E-Wallet", "QRIS", "Transfer Bank"],
        social: { instagram: "nusantararasa.id", whatsapp: "+623156789012" },
        reviews: [
            {
                nama: "Siti Nurhaliza",
                rating: 5,
                ulasan: "Rendangnya enak banget! Bumbunya pas, dagingnya empuk, dan porsinya banyak. Cocok buat oleh-oleh keluarga di Jakarta.",
                tanggal: randomDate(30),
                avatar: "https://i.pravatar.cc/150?img=1"
            },
            {
                nama: "Budi Santoso",
                rating: 5,
                ulasan: "Pelayanan ramah, kemasan rapi, dan pengiriman cepat. Sambal ijo-nya bikin nagih!",
                tanggal: randomDate(15),
                avatar: "https://i.pravatar.cc/150?img=2"
            },
            {
                nama: "Rina Wijaya",
                rating: 5,
                ulasan: "Sudah langganan 2 tahun. Kue kering lebarannya selalu habis duluan. Recomended!",
                tanggal: randomDate(60),
                avatar: "https://i.pravatar.cc/150?img=3"
            }
        ]
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
        jumlah_review: 92,
        maps_link: "https://maps.app.goo.gl/3kL9mP7vX2fZ9k8J6",
        fasilitas: ["Parkir", "Ruang Fitting", "Konsultasi Motif", "Workshop Batik"],
        metode_pembayaran: ["Cash", "Transfer Bank", "E-Wallet", "QRIS", "Credit Card"],
        social: { instagram: "kainnusantara", facebook: "KainNusantaraPekalongan" },
        reviews: [
            {
                nama: "Dewi Lestari",
                rating: 5,
                ulasan: "Batik tulis motif parang-nya detail banget! Warna tidak luntur setelah dicuci. Worth the price!",
                tanggal: randomDate(20),
                avatar: "https://i.pravatar.cc/150?img=4"
            },
            {
                nama: "Ahmad Fauzi",
                rating: 4,
                ulasan: "Pelayanan baik, tapi pengiriman agak lama karena antre. Kualitas kain oke!",
                tanggal: randomDate(45),
                avatar: "https://i.pravatar.cc/150?img=5"
            },
            {
                nama: "Laras Sari",
                rating: 5,
                ulasan: "Ikut workshop batik, seru! Pulang bawa kain cantik buatan sendiri. Recommended!",
                tanggal: randomDate(70),
                avatar: "https://i.pravatar.cc/150?img=6"
            }
        ]
    },
    {
        nama_toko: "Karya Nusantara",
        image: "https://klik-online.com/wp-content/uploads/2023/12/DUTA.jpg",
        banner: "https://klik-online.com/wp-content/uploads/2023/12/DUTA.jpg",
        kategori: "Kerajinan Tangan",
        deskripsi_toko: "Galeri dan toko kerajinan tangan Indonesia. Karya Nusantara menghadirkan berbagai produk kerajinan berkualitas seperti anyaman, ukiran kayu, keramik, dan suvenir khas Nusantara yang dibuat oleh pengrajin lokal terpilih.",
        lokasi_toko: "Jl. Imogiri Timur No.123, Giwangan, Kec. Umbulharjo, Kota Yogyakarta, Daerah Istimewa Yogyakarta 55163",
        no_telp: "+62 274 8901 234",
        email: "hello@karyanusantara.id",
        profileImage: "https://klik-online.com/wp-content/uploads/2023/12/DUTA.jpg",
        jam_operasional: "09:00 - 21:00",
        hari_operasional: "Senin - Minggu",
        rating_toko: 4.9,
        jumlah_review: 159,
        maps_link: "https://maps.app.goo.gl/9vX8kL3mP7vZfG8J7",
        fasilitas: ["Parkir", "Galeri Pameran", "Workshop", "Café"],
        metode_pembayaran: ["Cash", "Debit Card", "Credit Card", "E-Wallet", "QRIS", "Transfer Bank"],
        social: { instagram: "karyanusantara", whatsapp: "+622748901234" },
        reviews: [
            {
                nama: "Agus Pratama",
                rating: 5,
                ulasan: "Ukiran kayu wayang-nya indah banget! Cocok buat dekorasi rumah. Pengrajinnya ramah.",
                tanggal: randomDate(25),
                avatar: "https://i.pravatar.cc/150?img=7"
            },
            {
                nama: "Intan Permata",
                rating: 5,
                ulasan: "Beli tas anyaman rotan, ringan dan kuat. Sering dipuji temen kantor!",
                tanggal: randomDate(40),
                avatar: "https://i.pravatar.cc/150?img=8"
            },
            {
                nama: "Joko Widodo",
                rating: 4,
                ulasan: "Harga sedikit mahal, tapi worth it dengan kualitas dan keunikan produknya.",
                tanggal: randomDate(80),
                avatar: "https://i.pravatar.cc/150?img=9"
            }
        ]
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
        jumlah_review: 206,
        maps_link: "https://maps.app.goo.gl/2mK9vL3kP7bZfG8J7",
        fasilitas: ["Parkir", "Konsultasi Dokter", "Drive Thru", "Apotek 24 Jam"],
        metode_pembayaran: ["Cash", "Debit Card", "Credit Card", "E-Wallet", "QRIS", "Transfer Bank", "BPJS"],
        social: { whatsapp: "+622184567890" },
        reviews: [
            {
                nama: "dr. Maya Sari",
                rating: 5,
                ulasan: "Apoteker ramah dan jelasin obat dengan detail. Drive-thru sangat membantu saat hujan.",
                tanggal: randomDate(10),
                avatar: "https://i.pravatar.cc/150?img=10"
            },
            {
                nama: "Hendra Kusuma",
                rating: 5,
                ulasan: "Obat langka tersedia! Langsung dapat malam hari. Terima kasih pelayanannya.",
                tanggal: randomDate(35),
                avatar: "https://i.pravatar.cc/150?img=11"
            },
            {
                nama: "Siti Aisyah",
                rating: 4,
                ulasan: "Harga kompetitif, tapi antrean kadang panjang di akhir pekan.",
                tanggal: randomDate(55),
                avatar: "https://i.pravatar.cc/150?img=12"
            }
        ]
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
        jumlah_review: 100,
        maps_link: "https://maps.app.goo.gl/5vN9vL3kP9bZfG8J7",
        fasilitas: ["Parkir Luas", "Konsultasi Gratis", "Demo Alat", "Gudang Pupuk"],
        metode_pembayaran: ["Cash", "Transfer Bank", "E-Wallet", "QRIS", "Kredit Pertanian"],
        social: { instagram: "tanimakmur", facebook: "TaniMakmurIndonesia" },
        reviews: [
            {
                nama: "Pak Slamet",
                rating: 5,
                ulasan: "Bibit cabai unggul, hasil panen melimpah! Pupuk organiknya juga bagus buat tanah.",
                tanggal: randomDate(18),
                avatar: "https://i.pravatar.cc/150?img=13"
            },
            {
                nama: "Rudi Hartono",
                rating: 5,
                ulasan: "Karyawan ngerti banget soal urban farming. Beli pot dan media tanam, sekarang balkon hijau!",
                tanggal: randomDate(50),
                avatar: "https://i.pravatar.cc/150?img=14"
            },
            {
                nama: "Bu Tini",
                rating: 4,
                ulasan: "Harga pupuk naik sedikit, tapi kualitas tetap terjaga. Tetap langganan.",
                tanggal: randomDate(75),
                avatar: "https://i.pravatar.cc/150?img=15"
            }
        ]
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
        jumlah_review: 315,
        maps_link: "https://maps.app.goo.gl/7kL9mP7vX2fZ9k8J6",
        fasilitas: ["Service Center", "Demo Produk", "Trade-in", "Cicilan 0%"],
        metode_pembayaran: ["Cash", "Debit Card", "Credit Card", "E-Wallet", "QRIS", "Transfer Bank", "Cicilan 0%"],
        social: { instagram: "gadgetnusantara", facebook: "GadgetNusantaraOfficial", whatsapp: "+622167890123" },
        reviews: [
            {
                nama: "Fajar Nugroho",
                rating: 5,
                ulasan: "Beli iPhone 2nd, kondisi 99%, garansi resmi, cicilan 0%. Pelayanan top!",
                tanggal: randomDate(12),
                avatar: "https://i.pravatar.cc/150?img=16"
            },
            {
                nama: "Nadia Putri",
                rating: 5,
                ulasan: "Trade-in laptop lama, dapat potongan besar. Proses cepat, staf ramah.",
                tanggal: randomDate(38),
                avatar: "https://i.pravatar.cc/150?img=17"
            },
            {
                nama: "Dika Pratama",
                rating: 4,
                ulasan: "Antrean panjang saat promo, tapi worth it dengan diskonnya.",
                tanggal: randomDate(65),
                avatar: "https://i.pravatar.cc/150?img=18"
            }
        ]
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
        jumlah_review: 148,
        maps_link: "https://maps.app.goo.gl/4kL9mP7vX2OOM9k8J6",
        fasilitas: ["Showroom", "Custom Order", "Pengiriman", "Garansi Kayu"],
        metode_pembayaran: ["Cash", "Transfer Bank", "Credit Card", "Cicilan", "DP System"],
        social: { instagram: "mebelnusantara", whatsapp: "+622913456789" },
        reviews: [
            {
                nama: "Ibu Ratna",
                rating: 5,
                ulasan: "Meja makan jati ukir, kokoh dan indah. Pengiriman tepat waktu, pemasangan rapi.",
                tanggal: randomDate(22),
                avatar: "https://i.pravatar.cc/150?img=19"
            },
            {
                nama: "Bapak Hadi",
                rating: 5,
                ulasan: "Custom lemari 3 pintu, sesuai desain. Finishing halus, kayu solid.",
                tanggal: randomDate(48),
                avatar: "https://i.pravatar.cc/150?img=20"
            },
            {
                nama: "Siska",
                rating: 4,
                ulasan: "Harga premium, tapi kualitas sepadan. Proses DP dan cicilan jelas.",
                tanggal: randomDate(70),
                avatar: "https://i.pravatar.cc/150?img=21"
            }
        ]
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
        jumlah_review: 181,
        maps_link: "https://maps.app.goo.gl/6vX8kL3mP7vZfG8J7",
        fasilitas: ["Toko Buku", "Percetakan", "Fotokopi", "Café Baca"],
        metode_pembayaran: ["Cash", "Debit Card", "Credit Card", "E-Wallet", "QRIS", "Transfer Bank"],
        social: { instagram: "cendekiapress", facebook: "CendekiaPress" },
        reviews: [
            {
                nama: "Adi Saputra",
                rating: 5,
                ulasan: "Buku referensi skripsi lengkap, harga mahasiswa. Cetak tesis cepat dan rapi!",
                tanggal: randomDate(14),
                avatar: "https://i.pravatar.cc/150?img=22"
            },
            {
                nama: "Lina Marlina",
                rating: 5,
                ulasan: "Café baca nyaman, buku novel up to date. Sering nongkrong sambil baca.",
                tanggal: randomDate(42),
                avatar: "https://i.pravatar.cc/150?img=23"
            },
            {
                nama: "Rudi Hermawan",
                rating: 4,
                ulasan: "Fotokopi murah, tapi antre saat akhir semester. Tetap recommended.",
                tanggal: randomDate(68),
                avatar: "https://i.pravatar.cc/150?img=24"
            }
        ]
    },
];
// normalisasi nama
const normalize = (s) => s.trim().toLowerCase();
//hapus update insert
async function syncAndSeed() {
    console.log('[SYNC] Mulai sync penuh...');
    const dbStores = await listStores();
    const dbNames = new Set(dbStores.map(s => normalize(s.data.nama_toko)));
    const seedNames = new Set(stores.map(s => normalize(s.nama_toko)));
    for (const store of dbStores) {
        if (!seedNames.has(normalize(store.data.nama_toko))) {
            console.log(`[DELETE] Hapus: ${store.data.nama_toko}`);
            await deleteStoreByName(store.data.nama_toko);
        }
    }
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
