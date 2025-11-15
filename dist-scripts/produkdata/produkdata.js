import 'dotenv/config';
import { uploadProducts, getAllProducts, deleteAllProducts, } from "../lib/database.js";
export async function seedProduk() {
    console.log("🚀 Menjalankan seed produk penuh...");
    // Bersihin dulu semua data biar isi baru
    await deleteAllProducts();
    // Upload data produk baru
    const products = [
        // Kuliner
        {
            ASIN: "KULI-ID-001",
            nama_produk: "Sambal Cumi Asap Mak Rini",
            merek_produk: "Mak Rini",
            model_produk: "Sambal Rumahan 200g",
            kategori: "Kuliner",
            sub_kategori: "Sambal & Lauk Siap Saji",
            harga_asli: 45000,
            harga_produk: 35000,
            persentase_diskon: 22,
            mata_uang: "IDR",
            jumlah_unit: 500,
            unit_terjual: 430,
            status_produk: "Tersedia",
            minimum_pemesanan: 1,
            kondisi_produk: "Baru",
            berat_satuan: 200,
            bahan: "Cumi asap, cabai rawit, bawang merah, bawang putih, minyak kelapa",
            negara_asal: "Indonesia",
            deskripsi_produk: "Sambal cumi asap khas Jawa Timur dengan cita rasa pedas gurih dan aroma asap yang menggoda. Cocok disantap dengan nasi hangat atau lauk kering.",
            keyword: "sambal cumi pedas, kuliner nusantara",
            gambar_produk: "https://asset.kompas.com/crops/Xi5dv3Jxmh5HRC7RxOsflCPj5g4=/0x102:1000x769/1200x800/data/photo/2022/05/10/6279a89aa3520.jpeg",
            thumbnail_produk: "https://asset.kompas.com/crops/Xi5dv3Jxmh5HRC7RxOsflCPj5g4=/0x102:1000x769/1200x800/data/photo/2022/05/10/6279a89aa3520.jpeg",
            galeri_gambar: [
                "https://asset.kompas.com/crops/Xi5dv3Jxmh5HRC7RxOsflCPj5g4=/0x102:1000x769/1200x800/data/photo/2022/05/10/6279a89aa3520.jpeg",
                "https://asset.kompas.com/crops/Xi5dv3Jxmh5HRC7RxOsflCPj5g4=/0x102:1000x769/1200x800/data/photo/2022/05/10/6279a89aa3520.jpeg",
                "https://asset.kompas.com/crops/Xi5dv3Jxmh5HRC7RxOsflCPj5g4=/0x102:1000x769/1200x800/data/photo/2022/05/10/6279a89aa3520.jpeg"
            ],
            varian_produk: [
                "https://asset.kompas.com/crops/Xi5dv3Jxmh5HRC7RxOsflCPj5g4=/0x102:1000x769/1200x800/data/photo/2022/05/10/6279a89aa3520.jpeg",
                "https://asset.kompas.com/crops/Xi5dv3Jxmh5HRC7RxOsflCPj5g4=/0x102:1000x769/1200x800/data/photo/2022/05/10/6279a89aa3520.jpeg",
                "https://asset.kompas.com/crops/Xi5dv3Jxmh5HRC7RxOsflCPj5g4=/0x102:1000x769/1200x800/data/photo/2022/05/10/6279a89aa3520.jpeg"
            ],
            toko: "Nusantara Rasa",
            rating_toko: 4.9,
            status_toko: "Official Store",
            lokasi_toko: "Jl. Raya Darmo Permai III No.17, Pradahkalindungan, Kec. Dukuhpakis, Kota Surabaya, Jawa Timur 60226",
            maps_link: "https://maps.app.goo.gl/8vN9vL3kP9bZfG8J7",
            rating_bintang: 4.9,
            jumlah_ulasan: 320,
            hari_operasional: "Senin - Minggu",
            jam_operasional: "07:00 - 22:00",
            ulasan: [
                {
                    nama_pengulas: "Rina S.",
                    rating: 5,
                    tanggal: "2025-10-15",
                    isi: "Pedasnya pas banget, aroma asapnya bikin nagih! Cumi lembut, cocok buat temen nasi hangat."
                },
                {
                    nama_pengulas: "Budi K.",
                    rating: 4,
                    tanggal: "2025-09-22",
                    isi: "Enak, gurihnya terasa. Tapi kemasan agak bocor sedikit saat pengiriman."
                },
                {
                    nama_pengulas: "Siti A.",
                    rating: 5,
                    tanggal: "2025-08-30",
                    isi: "Sambal terenak yang pernah saya coba! Bikin makan jadi lahap, pasti repeat order."
                }
            ]
        },
        {
            ASIN: "KULI-ID-002",
            nama_produk: "Keripik Pisang Cokelat Lampung",
            merek_produk: "BananaJoy",
            model_produk: "Snack 250g",
            kategori: "Kuliner",
            sub_kategori: "Camilan Tradisional",
            harga_asli: 28000,
            harga_produk: 22000,
            persentase_diskon: 21,
            mata_uang: "IDR",
            jumlah_unit: 800,
            unit_terjual: 620,
            status_produk: "Tersedia",
            minimum_pemesanan: 2,
            kondisi_produk: "Baru",
            berat_satuan: 250,
            bahan: "Pisang kepok, cokelat bubuk, gula, minyak kelapa",
            negara_asal: "Indonesia",
            deskripsi_produk: "Keripik pisang khas Lampung yang renyah dengan balutan cokelat premium. Snack manis yang cocok untuk oleh-oleh.",
            keyword: "keripik pisang, oleh-oleh lampung",
            gambar_produk: "https://assets.promediateknologi.id/crop/0x0:0x0/750x500/webp/photo/2023/04/17/kripik-pisang-coklat-khas-Lampung-2882179002.jpg",
            thumbnail_produk: "https://assets.promediateknologi.id/crop/0x0:0x0/750x500/webp/photo/2023/04/17/kripik-pisang-coklat-khas-Lampung-2882179002.jpg",
            galeri_gambar: [
                "https://assets.promediateknologi.id/crop/0x0:0x0/750x500/webp/photo/2023/04/17/kripik-pisang-coklat-khas-Lampung-2882179002.jpg",
                "https://assets.promediateknologi.id/crop/0x0:0x0/750x500/webp/photo/2023/04/17/kripik-pisang-coklat-khas-Lampung-2882179002.jpg",
                "https://assets.promediateknologi.id/crop/0x0:0x0/750x500/webp/photo/2023/04/17/kripik-pisang-coklat-khas-Lampung-2882179002.jpg"
            ],
            varian_produk: [
                "https://assets.promediateknologi.id/crop/0x0:0x0/750x500/webp/photo/2023/04/17/kripik-pisang-coklat-khas-Lampung-2882179002.jpg",
                "https://assets.promediateknologi.id/crop/0x0:0x0/750x500/webp/photo/2023/04/17/kripik-pisang-coklat-khas-Lampung-2882179002.jpg",
                "https://assets.promediateknologi.id/crop/0x0:0x0/750x500/webp/photo/2023/04/17/kripik-pisang-coklat-khas-Lampung-2882179002.jpg"
            ],
            toko: "Nusantara Rasa",
            rating_toko: 4.9,
            status_toko: "Official Store",
            lokasi_toko: "Jl. Raya Darmo Permai III No.17, Pradahkalindungan, Kec. Dukuhpakis, Kota Surabaya, Jawa Timur 60226",
            maps_link: "https://maps.app.goo.gl/8vN9vL3kP9bZfG8J7",
            rating_bintang: 4.8,
            jumlah_ulasan: 250,
            hari_operasional: "Senin - Minggu",
            jam_operasional: "07:00 - 22:00",
            ulasan: [
                {
                    nama_pengulas: "Rina S.",
                    rating: 5,
                    tanggal: "2025-10-15",
                    isi: "Pedasnya pas banget, aroma asapnya bikin nagih! Cumi lembut, cocok buat temen nasi hangat."
                },
                {
                    nama_pengulas: "Budi K.",
                    rating: 4,
                    tanggal: "2025-09-22",
                    isi: "Enak, gurihnya terasa. Tapi kemasan agak bocor sedikit saat pengiriman."
                },
                {
                    nama_pengulas: "Siti A.",
                    rating: 5,
                    tanggal: "2025-08-30",
                    isi: "Sambal terenak yang pernah saya coba! Bikin makan jadi lahap, pasti repeat order."
                }
            ]
        },
        {
            ASIN: "KULI-ID-003",
            nama_produk: "Rendang Padang Asli Daging Sapi 250g",
            merek_produk: "MinangRasa",
            model_produk: "Rendang Frozen 250g",
            kategori: "Kuliner",
            sub_kategori: "Lauk Siap Saji",
            harga_asli: 85000,
            harga_produk: 69000,
            persentase_diskon: 18,
            mata_uang: "IDR",
            jumlah_unit: 400,
            unit_terjual: 350,
            status_produk: "Tersedia",
            minimum_pemesanan: 1,
            kondisi_produk: "Baru",
            berat_satuan: 250,
            bahan: "Daging sapi, santan, cabai, bawang merah, bawang putih, rempah padang",
            negara_asal: "Indonesia",
            deskripsi_produk: "Rendang autentik khas Padang dengan bumbu meresap dan tekstur daging lembut. Tahan hingga 6 bulan dalam freezer.",
            keyword: "rendang padang, makanan frozen indonesia",
            gambar_produk: "https://asset.kompas.com/crops/QsUYn6p5xK4DsivCrxa0_TXdjuk=/10x36:890x623/1200x800/data/photo/2023/03/25/641e5ef63dea4.jpg",
            thumbnail_produk: "https://asset.kompas.com/crops/QsUYn6p5xK4DsivCrxa0_TXdjuk=/10x36:890x623/1200x800/data/photo/2023/03/25/641e5ef63dea4.jpg",
            galeri_gambar: [
                "https://asset.kompas.com/crops/QsUYn6p5xK4DsivCrxa0_TXdjuk=/10x36:890x623/1200x800/data/photo/2023/03/25/641e5ef63dea4.jpg",
                "https://asset.kompas.com/crops/QsUYn6p5xK4DsivCrxa0_TXdjuk=/10x36:890x623/1200x800/data/photo/2023/03/25/641e5ef63dea4.jpg",
                "https://asset.kompas.com/crops/QsUYn6p5xK4DsivCrxa0_TXdjuk=/10x36:890x623/1200x800/data/photo/2023/03/25/641e5ef63dea4.jpg"
            ],
            varian_produk: [
                "https://asset.kompas.com/crops/QsUYn6p5xK4DsivCrxa0_TXdjuk=/10x36:890x623/1200x800/data/photo/2023/03/25/641e5ef63dea4.jpg",
                "https://asset.kompas.com/crops/QsUYn6p5xK4DsivCrxa0_TXdjuk=/10x36:890x623/1200x800/data/photo/2023/03/25/641e5ef63dea4.jpg",
                "https://asset.kompas.com/crops/QsUYn6p5xK4DsivCrxa0_TXdjuk=/10x36:890x623/1200x800/data/photo/2023/03/25/641e5ef63dea4.jpg"
            ],
            toko: "Nusantara Rasa",
            rating_toko: 4.9,
            status_toko: "Official Store",
            lokasi_toko: "Jl. Raya Darmo Permai III No.17, Pradahkalindungan, Kec. Dukuhpakis, Kota Surabaya, Jawa Timur 60226",
            maps_link: "https://maps.app.goo.gl/8vN9vL3kP9bZfG8J7",
            rating_bintang: 4.9,
            jumlah_ulasan: 410,
            hari_operasional: "Senin - Minggu",
            jam_operasional: "07:00 - 22:00",
            ulasan: [
                {
                    nama_pengulas: "Rina S.",
                    rating: 5,
                    tanggal: "2025-10-15",
                    isi: "Pedasnya pas banget, aroma asapnya bikin nagih! Cumi lembut, cocok buat temen nasi hangat."
                },
                {
                    nama_pengulas: "Budi K.",
                    rating: 4,
                    tanggal: "2025-09-22",
                    isi: "Enak, gurihnya terasa. Tapi kemasan agak bocor sedikit saat pengiriman."
                },
                {
                    nama_pengulas: "Siti A.",
                    rating: 5,
                    tanggal: "2025-08-30",
                    isi: "Sambal terenak yang pernah saya coba! Bikin makan jadi lahap, pasti repeat order."
                }
            ]
        },
        {
            ASIN: "KULI-ID-004",
            nama_produk: "Kopi Arabika Gayo 200g",
            merek_produk: "GayoMount",
            model_produk: "Roasted Beans Medium",
            kategori: "Kuliner",
            sub_kategori: "Kopi & Minuman",
            harga_asli: 95000,
            harga_produk: 78000,
            persentase_diskon: 18,
            mata_uang: "IDR",
            jumlah_unit: 600,
            unit_terjual: 520,
            status_produk: "Tersedia",
            minimum_pemesanan: 1,
            kondisi_produk: "Baru",
            berat_satuan: 200,
            bahan: "Biji kopi arabika gayo 100%",
            negara_asal: "Indonesia",
            deskripsi_produk: "Kopi arabika premium dari dataran tinggi Gayo dengan cita rasa floral dan aftertaste cokelat lembut. Disangrai segar setiap minggu.",
            keyword: "kopi gayo arabika, kopi aceh",
            gambar_produk: "https://img.lazcdn.com/g/p/5d024f9972fc9a1052dae93c14d03350.jpg_720x720q80.jpg",
            thumbnail_produk: "https://img.lazcdn.com/g/p/5d024f9972fc9a1052dae93c14d03350.jpg_720x720q80.jpg",
            galeri_gambar: [
                "https://img.lazcdn.com/g/p/5d024f9972fc9a1052dae93c14d03350.jpg_720x720q80.jpg",
                "https://img.lazcdn.com/g/p/5d024f9972fc9a1052dae93c14d03350.jpg_720x720q80.jpg",
                "https://img.lazcdn.com/g/p/5d024f9972fc9a1052dae93c14d03350.jpg_720x720q80.jpg"
            ],
            varian_produk: [
                "https://img.lazcdn.com/g/p/5d024f9972fc9a1052dae93c14d03350.jpg_720x720q80.jpg",
                "https://img.lazcdn.com/g/p/5d024f9972fc9a1052dae93c14d03350.jpg_720x720q80.jpg",
                "https://img.lazcdn.com/g/p/5d024f9972fc9a1052dae93c14d03350.jpg_720x720q80.jpg"
            ],
            toko: "Nusantara Rasa",
            rating_toko: 4.9,
            status_toko: "Official Store",
            lokasi_toko: "Jl. Raya Darmo Permai III No.17, Pradahkalindungan, Kec. Dukuhpakis, Kota Surabaya, Jawa Timur 60226",
            maps_link: "https://maps.app.goo.gl/8vN9vL3kP9bZfG8J7",
            rating_bintang: 4.8,
            jumlah_ulasan: 260,
            hari_operasional: "Senin - Minggu",
            jam_operasional: "07:00 - 22:00",
            ulasan: [
                {
                    nama_pengulas: "Rina S.",
                    rating: 5,
                    tanggal: "2025-10-15",
                    isi: "Pedasnya pas banget, aroma asapnya bikin nagih! Cumi lembut, cocok buat temen nasi hangat."
                },
                {
                    nama_pengulas: "Budi K.",
                    rating: 4,
                    tanggal: "2025-09-22",
                    isi: "Enak, gurihnya terasa. Tapi kemasan agak bocor sedikit saat pengiriman."
                },
                {
                    nama_pengulas: "Siti A.",
                    rating: 5,
                    tanggal: "2025-08-30",
                    isi: "Sambal terenak yang pernah saya coba! Bikin makan jadi lahap, pasti repeat order."
                }
            ]
        },
        {
            ASIN: "KULI-ID-005",
            nama_produk: "Dodol Garut Premium Rasa Susu",
            merek_produk: "DodolKita",
            model_produk: "Paket 500g",
            kategori: "Kuliner",
            sub_kategori: "Manisan & Oleh-oleh",
            harga_asli: 55000,
            harga_produk: 45000,
            persentase_diskon: 18,
            mata_uang: "IDR",
            jumlah_unit: 700,
            unit_terjual: 640,
            status_produk: "Tersedia",
            minimum_pemesanan: 1,
            kondisi_produk: "Baru",
            berat_satuan: 500,
            bahan: "Beras ketan, gula merah, santan, susu",
            negara_asal: "Indonesia",
            deskripsi_produk: "Dodol khas Garut dengan rasa susu lembut dan manis. Tekstur kenyal, tidak lengket di gigi.",
            keyword: "dodol garut, oleh oleh jawa barat",
            gambar_produk: "https://id-live-01.slatic.net/p/25bfa6d1256b3b64f2dd97fa2b650e3e.png",
            thumbnail_produk: "https://id-live-01.slatic.net/p/25bfa6d1256b3b64f2dd97fa2b650e3e.png",
            galeri_gambar: [
                "https://id-live-01.slatic.net/p/25bfa6d1256b3b64f2dd97fa2b650e3e.png",
                "https://id-live-01.slatic.net/p/25bfa6d1256b3b64f2dd97fa2b650e3e.png",
                "https://id-live-01.slatic.net/p/25bfa6d1256b3b64f2dd97fa2b650e3e.png"
            ],
            varian_produk: [
                "https://id-live-01.slatic.net/p/25bfa6d1256b3b64f2dd97fa2b650e3e.png",
                "https://id-live-01.slatic.net/p/25bfa6d1256b3b64f2dd97fa2b650e3e.png",
                "https://id-live-01.slatic.net/p/25bfa6d1256b3b64f2dd97fa2b650e3e.png"
            ],
            toko: "Nusantara Rasa",
            rating_toko: 4.9,
            status_toko: "Official Store",
            lokasi_toko: "Jl. Raya Darmo Permai III No.17, Pradahkalindungan, Kec. Dukuhpakis, Kota Surabaya, Jawa Timur 60226",
            maps_link: "https://maps.app.goo.gl/8vN9vL3kP9bZfG8J7",
            rating_bintang: 4.8,
            jumlah_ulasan: 188,
            hari_operasional: "Senin - Minggu",
            jam_operasional: "07:00 - 22:00",
            ulasan: [
                {
                    nama_pengulas: "Rina S.",
                    rating: 5,
                    tanggal: "2025-10-15",
                    isi: "Pedasnya pas banget, aroma asapnya bikin nagih! Cumi lembut, cocok buat temen nasi hangat."
                },
                {
                    nama_pengulas: "Budi K.",
                    rating: 4,
                    tanggal: "2025-09-22",
                    isi: "Enak, gurihnya terasa. Tapi kemasan agak bocor sedikit saat pengiriman."
                },
                {
                    nama_pengulas: "Siti A.",
                    rating: 5,
                    tanggal: "2025-08-30",
                    isi: "Sambal terenak yang pernah saya coba! Bikin makan jadi lahap, pasti repeat order."
                }
            ]
        },
        // Fashion
        {
            ASIN: "FASH-001",
            nama_produk: "Batik Tulis Pekalongan Pria Lengan Panjang",
            merek_produk: "Batik Nusantara",
            model_produk: "Kemeja Batik Pria Formal",
            kategori: "Fashion",
            sub_kategori: "Batik",
            harga_asli: 450000,
            harga_produk: 299000,
            persentase_diskon: 33,
            mata_uang: "IDR",
            jumlah_unit: 50,
            unit_terjual: 120,
            status_produk: "Tersedia",
            minimum_pemesanan: 1,
            kondisi_produk: "Baru",
            berat_satuan: 0.5,
            bahan: "Katun Primisima",
            warna: "Coklat Motif Klasik",
            negara_asal: "Indonesia",
            spesifikasi: "Batik tulis asli Pekalongan dengan pewarna alami.",
            deskripsi_produk: "Kemeja batik tulis khas Pekalongan ini dibuat secara manual oleh pengrajin berpengalaman. Nyaman dipakai dan cocok untuk acara formal maupun santai.",
            keyword: "batik pekalongan, kemeja batik pria",
            gambar_produk: "https://images.tokopedia.net/img/cache/700/hDjmkQ/2023/12/1/a0925820-f2f8-46ab-8dde-ea1403f9997b.jpg",
            thumbnail_produk: "https://images.tokopedia.net/img/cache/700/hDjmkQ/2023/12/1/a0925820-f2f8-46ab-8dde-ea1403f9997b.jpg",
            galeri_gambar: [
                "https://images.tokopedia.net/img/cache/700/hDjmkQ/2023/12/1/a0925820-f2f8-46ab-8dde-ea1403f9997b.jpg",
                "https://images.tokopedia.net/img/cache/700/hDjmkQ/2023/12/1/a0925820-f2f8-46ab-8dde-ea1403f9997b.jpg",
                "https://images.tokopedia.net/img/cache/700/hDjmkQ/2023/12/1/a0925820-f2f8-46ab-8dde-ea1403f9997b.jpg"
            ],
            varian_produk: [
                "https://images.tokopedia.net/img/cache/700/hDjmkQ/2023/12/1/a0925820-f2f8-46ab-8dde-ea1403f9997b.jpg",
                "https://images.tokopedia.net/img/cache/700/hDjmkQ/2023/12/1/a0925820-f2f8-46ab-8dde-ea1403f9997b.jpg",
                "https://images.tokopedia.net/img/cache/700/hDjmkQ/2023/12/1/a0925820-f2f8-46ab-8dde-ea1403f9997b.jpg"
            ],
            toko: "Kain Nusantara",
            rating_toko: 4.9,
            status_toko: "Official Store",
            lokasi_toko: "Jl. Kauman No.25, Kauman, Kec. Pekalongan Timur, Kota Pekalongan, Jawa Tengah 51122",
            maps_link: "https://maps.app.goo.gl/3kL9mP7vX2fZ9k8J6",
            rating_bintang: 4.8,
            jumlah_ulasan: 324,
            hari_operasional: "Senin - Sabtu",
            jam_operasional: "08:00 - 17:00",
            ulasan: [
                {
                    nama_pengulas: "Rina S.",
                    rating: 5,
                    tanggal: "2025-10-15",
                    isi: "Pedasnya pas banget, aroma asapnya bikin nagih! Cumi lembut, cocok buat temen nasi hangat."
                },
                {
                    nama_pengulas: "Budi K.",
                    rating: 4,
                    tanggal: "2025-09-22",
                    isi: "Enak, gurihnya terasa. Tapi kemasan agak bocor sedikit saat pengiriman."
                },
                {
                    nama_pengulas: "Siti A.",
                    rating: 5,
                    tanggal: "2025-08-30",
                    isi: "Sambal terenak yang pernah saya coba! Bikin makan jadi lahap, pasti repeat order."
                }
            ]
        },
        {
            ASIN: "FASH-002",
            nama_produk: "Kebaya Encim Modern",
            merek_produk: "Pesona Kartini",
            model_produk: "Kebaya Bordir",
            kategori: "Fashion",
            sub_kategori: "Kebaya",
            harga_asli: 600000,
            harga_produk: 450000,
            persentase_diskon: 25,
            mata_uang: "IDR",
            jumlah_unit: 30,
            unit_terjual: 85,
            status_produk: "Tersedia",
            minimum_pemesanan: 1,
            kondisi_produk: "Baru",
            berat_satuan: 0.7,
            bahan: "Brokat Halus",
            warna: "Merah Marun",
            negara_asal: "Indonesia",
            spesifikasi: "Kebaya encim dengan sentuhan modern dan bordir halus.",
            deskripsi_produk: "Kebaya modern dengan desain klasik khas Betawi. Cocok untuk acara resmi, wisuda, atau pernikahan.",
            keyword: "kebaya encim, kebaya modern",
            gambar_produk: "https://img.lazcdn.com/g/p/2cdf23b79aff464195a7010cb3b3e58e.jpg_720x720q80.jpg",
            thumbnail_produk: "https://img.lazcdn.com/g/p/2cdf23b79aff464195a7010cb3b3e58e.jpg_720x720q80.jpg",
            galeri_gambar: [
                "https://img.lazcdn.com/g/p/2cdf23b79aff464195a7010cb3b3e58e.jpg_720x720q80.jpg",
                "https://img.lazcdn.com/g/p/2cdf23b79aff464195a7010cb3b3e58e.jpg_720x720q80.jpg",
                "https://img.lazcdn.com/g/p/2cdf23b79aff464195a7010cb3b3e58e.jpg_720x720q80.jpg"
            ],
            varian_produk: [
                "https://img.lazcdn.com/g/p/2cdf23b79aff464195a7010cb3b3e58e.jpg_720x720q80.jpg",
                "https://img.lazcdn.com/g/p/2cdf23b79aff464195a7010cb3b3e58e.jpg_720x720q80.jpg",
                "https://img.lazcdn.com/g/p/2cdf23b79aff464195a7010cb3b3e58e.jpg_720x720q80.jpg"
            ],
            toko: "Kain Nusantara",
            rating_toko: 4.9,
            status_toko: "Official Store",
            lokasi_toko: "Jl. Kauman No.25, Kauman, Kec. Pekalongan Timur, Kota Pekalongan, Jawa Tengah 51122",
            maps_link: "https://maps.app.goo.gl/3kL9mP7vX2fZ9k8J6",
            rating_bintang: 4.6,
            jumlah_ulasan: 215,
            hari_operasional: "Senin - Sabtu",
            jam_operasional: "08:00 - 17:00",
            ulasan: [
                {
                    nama_pengulas: "Rina S.",
                    rating: 5,
                    tanggal: "2025-10-15",
                    isi: "Pedasnya pas banget, aroma asapnya bikin nagih! Cumi lembut, cocok buat temen nasi hangat."
                },
                {
                    nama_pengulas: "Budi K.",
                    rating: 4,
                    tanggal: "2025-09-22",
                    isi: "Enak, gurihnya terasa. Tapi kemasan agak bocor sedikit saat pengiriman."
                },
                {
                    nama_pengulas: "Siti A.",
                    rating: 5,
                    tanggal: "2025-08-30",
                    isi: "Sambal terenak yang pernah saya coba! Bikin makan jadi lahap, pasti repeat order."
                }
            ]
        },
        {
            ASIN: "FASH-003",
            nama_produk: "Sepatu Kulit Asli Handmade Bandung",
            merek_produk: "D'Leather",
            model_produk: "Oxford Shoes",
            kategori: "Fashion",
            sub_kategori: "Sepatu",
            harga_asli: 850000,
            harga_produk: 599000,
            persentase_diskon: 30,
            mata_uang: "IDR",
            jumlah_unit: 40,
            unit_terjual: 210,
            status_produk: "Tersedia",
            minimum_pemesanan: 1,
            kondisi_produk: "Baru",
            berat_satuan: 1.2,
            bahan: "Kulit Sapi Premium",
            warna: "Coklat Tua",
            negara_asal: "Indonesia",
            spesifikasi: "Jahitan rapi, sol kuat, dan tahan lama.",
            deskripsi_produk: "Sepatu kulit handmade buatan Bandung, cocok untuk kegiatan formal maupun kasual. Nyaman dipakai seharian.",
            keyword: "sepatu kulit bandung, handmade shoes",
            gambar_produk: "https://img.lazcdn.com/g/p/ca803f77d0b0e6645ace4500e30f7fd3.jpg_720x720q80.jpg",
            thumbnail_produk: "https://img.lazcdn.com/g/p/ca803f77d0b0e6645ace4500e30f7fd3.jpg_720x720q80.jpg",
            galeri_gambar: [
                "https://img.lazcdn.com/g/p/ca803f77d0b0e6645ace4500e30f7fd3.jpg_720x720q80.jpg",
                "https://img.lazcdn.com/g/p/ca803f77d0b0e6645ace4500e30f7fd3.jpg_720x720q80.jpg",
                "https://img.lazcdn.com/g/p/ca803f77d0b0e6645ace4500e30f7fd3.jpg_720x720q80.jpg"
            ],
            varian_produk: [
                "https://img.lazcdn.com/g/p/ca803f77d0b0e6645ace4500e30f7fd3.jpg_720x720q80.jpg",
                "https://img.lazcdn.com/g/p/ca803f77d0b0e6645ace4500e30f7fd3.jpg_720x720q80.jpg",
                "https://img.lazcdn.com/g/p/ca803f77d0b0e6645ace4500e30f7fd3.jpg_720x720q80.jpg"
            ],
            toko: "Kain Nusantara",
            rating_toko: 4.9,
            status_toko: "Official Store",
            lokasi_toko: "Jl. Kauman No.25, Kauman, Kec. Pekalongan Timur, Kota Pekalongan, Jawa Tengah 51122",
            maps_link: "https://maps.app.goo.gl/3kL9mP7vX2fZ9k8J6",
            rating_bintang: 4.7,
            jumlah_ulasan: 432,
            hari_operasional: "Senin - Sabtu",
            jam_operasional: "08:00 - 17:00",
            ulasan: [
                {
                    nama_pengulas: "Rina S.",
                    rating: 5,
                    tanggal: "2025-10-15",
                    isi: "Pedasnya pas banget, aroma asapnya bikin nagih! Cumi lembut, cocok buat temen nasi hangat."
                },
                {
                    nama_pengulas: "Budi K.",
                    rating: 4,
                    tanggal: "2025-09-22",
                    isi: "Enak, gurihnya terasa. Tapi kemasan agak bocor sedikit saat pengiriman."
                },
                {
                    nama_pengulas: "Siti A.",
                    rating: 5,
                    tanggal: "2025-08-30",
                    isi: "Sambal terenak yang pernah saya coba! Bikin makan jadi lahap, pasti repeat order."
                }
            ]
        },
        {
            ASIN: "FASH-004",
            nama_produk: "Tas Anyaman Pandan Khas Bali",
            merek_produk: "TropicaBag",
            model_produk: "Tas Selempang Wanita",
            kategori: "Fashion",
            sub_kategori: "Aksesoris",
            harga_asli: 250000,
            harga_produk: 175000,
            persentase_diskon: 30,
            mata_uang: "IDR",
            jumlah_unit: 60,
            unit_terjual: 300,
            status_produk: "Tersedia",
            minimum_pemesanan: 1,
            kondisi_produk: "Baru",
            berat_satuan: 0.4,
            bahan: "Daun Pandan Kering",
            warna: "Natural Cream",
            negara_asal: "Indonesia",
            spesifikasi: "Produk handmade ramah lingkungan dari Bali.",
            deskripsi_produk: "Tas anyaman pandan dibuat oleh pengrajin lokal Bali. Ringan, kuat, dan cocok untuk gaya kasual atau pantai.",
            keyword: "tas pandan bali, tas anyaman alami",
            gambar_produk: "https://images.tokopedia.net/img/cache/700/o3syd0/1997/1/1/a251b523fe4d4813aaeafc1a25c6d8f8~.jpeg",
            thumbnail_produk: "https://images.tokopedia.net/img/cache/700/o3syd0/1997/1/1/a251b523fe4d4813aaeafc1a25c6d8f8~.jpeg",
            galeri_gambar: [
                "https://images.tokopedia.net/img/cache/700/o3syd0/1997/1/1/a251b523fe4d4813aaeafc1a25c6d8f8~.jpeg",
                "https://images.tokopedia.net/img/cache/700/o3syd0/1997/1/1/a251b523fe4d4813aaeafc1a25c6d8f8~.jpeg",
                "https://images.tokopedia.net/img/cache/700/o3syd0/1997/1/1/a251b523fe4d4813aaeafc1a25c6d8f8~.jpeg"
            ],
            varian_produk: [
                "https://images.tokopedia.net/img/cache/700/o3syd0/1997/1/1/a251b523fe4d4813aaeafc1a25c6d8f8~.jpeg",
                "https://images.tokopedia.net/img/cache/700/o3syd0/1997/1/1/a251b523fe4d4813aaeafc1a25c6d8f8~.jpeg",
                "https://images.tokopedia.net/img/cache/700/o3syd0/1997/1/1/a251b523fe4d4813aaeafc1a25c6d8f8~.jpeg"
            ],
            toko: "Kain Nusantara",
            rating_toko: 4.9,
            status_toko: "Official Store",
            lokasi_toko: "Jl. Kauman No.25, Kauman, Kec. Pekalongan Timur, Kota Pekalongan, Jawa Tengah 51122",
            maps_link: "https://maps.app.goo.gl/3kL9mP7vX2fZ9k8J6",
            rating_bintang: 4.8,
            jumlah_ulasan: 368,
            hari_operasional: "Senin - Sabtu",
            jam_operasional: "08:00 - 17:00",
            ulasan: [
                {
                    nama_pengulas: "Rina S.",
                    rating: 5,
                    tanggal: "2025-10-15",
                    isi: "Pedasnya pas banget, aroma asapnya bikin nagih! Cumi lembut, cocok buat temen nasi hangat."
                },
                {
                    nama_pengulas: "Budi K.",
                    rating: 4,
                    tanggal: "2025-09-22",
                    isi: "Enak, gurihnya terasa. Tapi kemasan agak bocor sedikit saat pengiriman."
                },
                {
                    nama_pengulas: "Siti A.",
                    rating: 5,
                    tanggal: "2025-08-30",
                    isi: "Sambal terenak yang pernah saya coba! Bikin makan jadi lahap, pasti repeat order."
                }
            ]
        },
        {
            ASIN: "FASH-005",
            nama_produk: "Sandal Kulit Etnik Lombok",
            merek_produk: "SasakWalk",
            model_produk: "Sandal Pria",
            kategori: "Fashion",
            sub_kategori: "Sandal",
            harga_asli: 230000,
            harga_produk: 165000,
            persentase_diskon: 28,
            mata_uang: "IDR",
            jumlah_unit: 70,
            unit_terjual: 220,
            status_produk: "Tersedia",
            minimum_pemesanan: 1,
            kondisi_produk: "Baru",
            berat_satuan: 0.8,
            bahan: "Kulit Domba",
            warna: "Coklat Alam",
            negara_asal: "Indonesia",
            spesifikasi: "Tali anyaman khas Lombok, sol empuk.",
            deskripsi_produk: "Sandal etnik buatan tangan dari Lombok dengan bahan kulit berkualitas dan desain khas budaya Sasak.",
            keyword: "sandal etnik lombok, sandal kulit",
            gambar_produk: "https://webicdn.com/sdirmember/13/12569/produk/12569_product_1582278401.jpg",
            thumbnail_produk: "https://webicdn.com/sdirmember/13/12569/produk/12569_product_1582278401.jpg",
            galeri_gambar: [
                "https://webicdn.com/sdirmember/13/12569/produk/12569_product_1582278401.jpg",
                "https://webicdn.com/sdirmember/13/12569/produk/12569_product_1582278401.jpg",
                "https://webicdn.com/sdirmember/13/12569/produk/12569_product_1582278401.jpg"
            ],
            varian_produk: [
                "https://webicdn.com/sdirmember/13/12569/produk/12569_product_1582278401.jpg",
                "https://webicdn.com/sdirmember/13/12569/produk/12569_product_1582278401.jpg",
                "https://webicdn.com/sdirmember/13/12569/produk/12569_product_1582278401.jpg"
            ],
            toko: "Kain Nusantara",
            rating_toko: 4.9,
            status_toko: "Official Store",
            lokasi_toko: "Jl. Kauman No.25, Kauman, Kec. Pekalongan Timur, Kota Pekalongan, Jawa Tengah 51122",
            maps_link: "https://maps.app.goo.gl/3kL9mP7vX2fZ9k8J6",
            rating_bintang: 4.6,
            jumlah_ulasan: 196,
            hari_operasional: "Senin - Sabtu",
            jam_operasional: "08:00 - 17:00",
            ulasan: [
                {
                    nama_pengulas: "Rina S.",
                    rating: 5,
                    tanggal: "2025-10-15",
                    isi: "Pedasnya pas banget, aroma asapnya bikin nagih! Cumi lembut, cocok buat temen nasi hangat."
                },
                {
                    nama_pengulas: "Budi K.",
                    rating: 4,
                    tanggal: "2025-09-22",
                    isi: "Enak, gurihnya terasa. Tapi kemasan agak bocor sedikit saat pengiriman."
                },
                {
                    nama_pengulas: "Siti A.",
                    rating: 5,
                    tanggal: "2025-08-30",
                    isi: "Sambal terenak yang pernah saya coba! Bikin makan jadi lahap, pasti repeat order."
                }
            ]
        },
        // Kerajinan
        {
            ASIN: "KERAJI-ID-001",
            nama_produk: "Lampu Hias Bambu Minimalis",
            merek_produk: "Bamboo Art",
            model_produk: "BA-LH01",
            kategori: "Kerajinan",
            sub_kategori: "Bambu",
            harga_asli: 450000,
            harga_produk: 389000,
            persentase_diskon: 14,
            mata_uang: "IDR",
            jumlah_unit: 60,
            unit_terjual: 52,
            status_produk: "Tersedia",
            minimum_pemesanan: 1,
            kondisi_produk: "Baru",
            berat_satuan: 1.2,
            bahan: "Bambu petung, kabel listrik",
            warna: "Natural Bambu",
            negara_asal: "Indonesia",
            deskripsi_produk: "Lampu hias bambu anyaman tangan, desain minimalis modern. Cahaya hangat, cocok untuk ruang tamu, kafe, atau kamar tidur.",
            keyword: "lampu bambu, hiasan bambu, kerajinan bambu",
            gambar_produk: "https://down-id.img.susercontent.com/file/id-11134207-7r98u-lw60c4i6d9uycc",
            thumbnail_produk: "https://down-id.img.susercontent.com/file/id-11134207-7r98u-lw60c4i6d9uycc",
            galeri_gambar: [
                "https://down-id.img.susercontent.com/file/id-11134207-7r98u-lw60c4i6d9uycc",
                "https://down-id.img.susercontent.com/file/id-11134207-7r98u-lw60c4i6d9uycc",
                "https://down-id.img.susercontent.com/file/id-11134207-7r98u-lw60c4i6d9uycc"
            ],
            varian_produk: [
                "https://down-id.img.susercontent.com/file/id-11134207-7r98u-lw60c4i6d9uycc",
                "https://down-id.img.susercontent.com/file/id-11134207-7r98u-lw60c4i6d9uycc",
                "https://down-id.img.susercontent.com/file/id-11134207-7r98u-lw60c4i6d9uycc"
            ],
            toko: "Karya Nusantara",
            rating_toko: 4.9,
            status_toko: "Official Store",
            lokasi_toko: "Jl. Imogiri Timur No.123, Giwangan, Kec. Umbulharjo, Kota Yogyakarta, Daerah Istimewa Yogyakarta 55163",
            maps_link: "https://maps.app.goo.gl/9vX8kL3mP7vZfG8J7",
            rating_bintang: 4.8,
            jumlah_ulasan: 480,
            hari_operasional: "Senin - Minggu",
            jam_operasional: "09:00 - 21:00",
            ulasan: [
                {
                    nama_pengulas: "Rina S.",
                    rating: 5,
                    tanggal: "2025-10-15",
                    isi: "Pedasnya pas banget, aroma asapnya bikin nagih! Cumi lembut, cocok buat temen nasi hangat."
                },
                {
                    nama_pengulas: "Budi K.",
                    rating: 4,
                    tanggal: "2025-09-22",
                    isi: "Enak, gurihnya terasa. Tapi kemasan agak bocor sedikit saat pengiriman."
                },
                {
                    nama_pengulas: "Siti A.",
                    rating: 5,
                    tanggal: "2025-08-30",
                    isi: "Sambal terenak yang pernah saya coba! Bikin makan jadi lahap, pasti repeat order."
                }
            ]
        },
        {
            ASIN: "KERAJI-ID-002",
            nama_produk: "Gerabah Tanah Liat Kasongan",
            merek_produk: "Kasongan Pottery",
            model_produk: "KP-GL01",
            kategori: "Kerajinan",
            sub_kategori: "Gerabah",
            harga_asli: 250000,
            harga_produk: 199000,
            persentase_diskon: 20,
            mata_uang: "IDR",
            jumlah_unit: 100,
            unit_terjual: 88,
            status_produk: "Tersedia",
            minimum_pemesanan: 1,
            kondisi_produk: "Baru",
            berat_satuan: 3.0,
            bahan: "Tanah liat kasongan, glasir alami",
            warna: "Terracotta",
            negara_asal: "Indonesia",
            deskripsi_produk: "Guci gerabah Kasongan motif etnik, dibakar suhu tinggi. Cocok untuk vas bunga, hiasan taman, atau interior rustic.",
            keyword: "gerabah kasongan, pottery yogyakarta, guci tanah liat",
            gambar_produk: "https://www.alvarotrans.com/images/news/alvaro-transport-jogja-gerabah-kerajinan-tanah-liat-yang-ada-di-kasongan-bantul-46.jpeg",
            thumbnail_produk: "https://www.alvarotrans.com/images/news/alvaro-transport-jogja-gerabah-kerajinan-tanah-liat-yang-ada-di-kasongan-bantul-46.jpeg",
            galeri_gambar: [
                "https://www.alvarotrans.com/images/news/alvaro-transport-jogja-gerabah-kerajinan-tanah-liat-yang-ada-di-kasongan-bantul-46.jpeg",
                "https://www.alvarotrans.com/images/news/alvaro-transport-jogja-gerabah-kerajinan-tanah-liat-yang-ada-di-kasongan-bantul-46.jpeg",
                "https://www.alvarotrans.com/images/news/alvaro-transport-jogja-gerabah-kerajinan-tanah-liat-yang-ada-di-kasongan-bantul-46.jpeg"
            ],
            varian_produk: [
                "https://www.alvarotrans.com/images/news/alvaro-transport-jogja-gerabah-kerajinan-tanah-liat-yang-ada-di-kasongan-bantul-46.jpeg",
                "https://www.alvarotrans.com/images/news/alvaro-transport-jogja-gerabah-kerajinan-tanah-liat-yang-ada-di-kasongan-bantul-46.jpeg",
                "https://www.alvarotrans.com/images/news/alvaro-transport-jogja-gerabah-kerajinan-tanah-liat-yang-ada-di-kasongan-bantul-46.jpeg"
            ],
            toko: "Karya Nusantara",
            rating_toko: 4.9,
            status_toko: "Official Store",
            lokasi_toko: "Jl. Imogiri Timur No.123, Giwangan, Kec. Umbulharjo, Kota Yogyakarta, Daerah Istimewa Yogyakarta 55163",
            maps_link: "https://maps.app.goo.gl/9vX8kL3mP7vZfG8J7",
            rating_bintang: 4.7,
            jumlah_ulasan: 560,
            hari_operasional: "Senin - Minggu",
            jam_operasional: "09:00 - 21:00",
            ulasan: [
                {
                    nama_pengulas: "Rina S.",
                    rating: 5,
                    tanggal: "2025-10-15",
                    isi: "Pedasnya pas banget, aroma asapnya bikin nagih! Cumi lembut, cocok buat temen nasi hangat."
                },
                {
                    nama_pengulas: "Budi K.",
                    rating: 4,
                    tanggal: "2025-09-22",
                    isi: "Enak, gurihnya terasa. Tapi kemasan agak bocor sedikit saat pengiriman."
                },
                {
                    nama_pengulas: "Siti A.",
                    rating: 5,
                    tanggal: "2025-08-30",
                    isi: "Sambal terenak yang pernah saya coba! Bikin makan jadi lahap, pasti repeat order."
                }
            ]
        },
        {
            ASIN: "KERAJI-ID-003",
            nama_produk: "Songket Palembang Asli",
            merek_produk: "Songket Sriwijaya",
            model_produk: "SS-SK01",
            kategori: "Kerajinan",
            sub_kategori: "Songket",
            harga_asli: 950000,
            harga_produk: 820000,
            persentase_diskon: 14,
            mata_uang: "IDR",
            jumlah_unit: 25,
            unit_terjual: 20,
            status_produk: "Tersedia",
            minimum_pemesanan: 1,
            kondisi_produk: "Baru",
            berat_satuan: 0.5,
            bahan: "Benang sutra, benang emas",
            warna: "Merah Maroon & Emas",
            negara_asal: "Indonesia",
            deskripsi_produk: "Songket Palembang motif lepus beras wangi, tenun tangan 2 bulan. Mewah untuk kebaya, selendang, atau koleksi budaya.",
            keyword: "songket palembang, songket asli, kain tradisional",
            gambar_produk: "https://www.static-src.com/wcsstore/Indraprastha/images/catalog/full/catalog-image/108/MTA-165392838/brd-44261_songket-pash-kain-songket-tenun-asli-khas-palembang-berbagai-macam-motif-warna_full04-09934432.jpg",
            thumbnail_produk: "https://www.static-src.com/wcsstore/Indraprastha/images/catalog/full/catalog-image/108/MTA-165392838/brd-44261_songket-pash-kain-songket-tenun-asli-khas-palembang-berbagai-macam-motif-warna_full04-09934432.jpg",
            galeri_gambar: [
                "https://www.static-src.com/wcsstore/Indraprastha/images/catalog/full/catalog-image/108/MTA-165392838/brd-44261_songket-pash-kain-songket-tenun-asli-khas-palembang-berbagai-macam-motif-warna_full04-09934432.jpg",
                "https://www.static-src.com/wcsstore/Indraprastha/images/catalog/full/catalog-image/108/MTA-165392838/brd-44261_songket-pash-kain-songket-tenun-asli-khas-palembang-berbagai-macam-motif-warna_full04-09934432.jpg",
                "https://www.static-src.com/wcsstore/Indraprastha/images/catalog/full/catalog-image/108/MTA-165392838/brd-44261_songket-pash-kain-songket-tenun-asli-khas-palembang-berbagai-macam-motif-warna_full04-09934432.jpg"
            ],
            varian_produk: [
                "https://www.static-src.com/wcsstore/Indraprastha/images/catalog/full/catalog-image/108/MTA-165392838/brd-44261_songket-pash-kain-songket-tenun-asli-khas-palembang-berbagai-macam-motif-warna_full04-09934432.jpg",
                "https://www.static-src.com/wcsstore/Indraprastha/images/catalog/full/catalog-image/108/MTA-165392838/brd-44261_songket-pash-kain-songket-tenun-asli-khas-palembang-berbagai-macam-motif-warna_full04-09934432.jpg",
                "https://www.static-src.com/wcsstore/Indraprastha/images/catalog/full/catalog-image/108/MTA-165392838/brd-44261_songket-pash-kain-songket-tenun-asli-khas-palembang-berbagai-macam-motif-warna_full04-09934432.jpg"
            ],
            toko: "Karya Nusantara",
            rating_toko: 4.9,
            status_toko: "Official Store",
            lokasi_toko: "Jl. Imogiri Timur No.123, Giwangan, Kec. Umbulharjo, Kota Yogyakarta, Daerah Istimewa Yogyakarta 55163",
            maps_link: "https://maps.app.goo.gl/9vX8kL3mP7vZfG8J7",
            rating_bintang: 4.8,
            jumlah_ulasan: 340,
            hari_operasional: "Senin - Minggu",
            jam_operasional: "09:00 - 21:00",
            ulasan: [
                {
                    nama_pengulas: "Rina S.",
                    rating: 5,
                    tanggal: "2025-10-15",
                    isi: "Pedasnya pas banget, aroma asapnya bikin nagih! Cumi lembut, cocok buat temen nasi hangat."
                },
                {
                    nama_pengulas: "Budi K.",
                    rating: 4,
                    tanggal: "2025-09-22",
                    isi: "Enak, gurihnya terasa. Tapi kemasan agak bocor sedikit saat pengiriman."
                },
                {
                    nama_pengulas: "Siti A.",
                    rating: 5,
                    tanggal: "2025-08-30",
                    isi: "Sambal terenak yang pernah saya coba! Bikin makan jadi lahap, pasti repeat order."
                }
            ]
        },
        {
            ASIN: "KERAJI-ID-004",
            nama_produk: "Topeng Kayu Cirebon",
            merek_produk: "Cirebon Mask",
            model_produk: "CM-TK01",
            kategori: "Kerajinan",
            sub_kategori: "Ukiran Topeng",
            harga_asli: 550000,
            harga_produk: 469000,
            persentase_diskon: 15,
            mata_uang: "IDR",
            jumlah_unit: 50,
            unit_terjual: 42,
            status_produk: "Tersedia",
            minimum_pemesanan: 1,
            kondisi_produk: "Baru",
            berat_satuan: 1.0,
            bahan: "Kayu mahoni, cat alami",
            warna: "Multicolor",
            negara_asal: "Indonesia",
            deskripsi_produk: "Topeng Cirebon karakter Panji, ukir tangan halus. Cocok untuk dekorasi, koleksi seni, atau aksesoris teater tradisional.",
            keyword: "topeng cirebon, topeng kayu, kerajinan cirebon",
            gambar_produk: "https://static.promediateknologi.id/crop/0x0:0x0/750x500/webp/photo/p2/251/2024/11/18/IMG_5334-1797601408.jpeg",
            thumbnail_produk: "https://static.promediateknologi.id/crop/0x0:0x0/750x500/webp/photo/p2/251/2024/11/18/IMG_5334-1797601408.jpeg",
            galeri_gambar: [
                "https://static.promediateknologi.id/crop/0x0:0x0/750x500/webp/photo/p2/251/2024/11/18/IMG_5334-1797601408.jpeg",
                "https://static.promediateknologi.id/crop/0x0:0x0/750x500/webp/photo/p2/251/2024/11/18/IMG_5334-1797601408.jpeg",
                "https://static.promediateknologi.id/crop/0x0:0x0/750x500/webp/photo/p2/251/2024/11/18/IMG_5334-1797601408.jpeg"
            ],
            varian_produk: [
                "https://static.promediateknologi.id/crop/0x0:0x0/750x500/webp/photo/p2/251/2024/11/18/IMG_5334-1797601408.jpeg",
                "https://static.promediateknologi.id/crop/0x0:0x0/750x500/webp/photo/p2/251/2024/11/18/IMG_5334-1797601408.jpeg",
                "https://static.promediateknologi.id/crop/0x0:0x0/750x500/webp/photo/p2/251/2024/11/18/IMG_5334-1797601408.jpeg"
            ],
            toko: "Karya Nusantara",
            rating_toko: 4.9,
            status_toko: "Official Store",
            lokasi_toko: "Jl. Imogiri Timur No.123, Giwangan, Kec. Umbulharjo, Kota Yogyakarta, Daerah Istimewa Yogyakarta 55163",
            maps_link: "https://maps.app.goo.gl/9vX8kL3mP7vZfG8J7",
            rating_bintang: 4.7,
            jumlah_ulasan: 410,
            hari_operasional: "Senin - Minggu",
            jam_operasional: "09:00 - 21:00",
            ulasan: [
                {
                    nama_pengulas: "Rina S.",
                    rating: 5,
                    tanggal: "2025-10-15",
                    isi: "Pedasnya pas banget, aroma asapnya bikin nagih! Cumi lembut, cocok buat temen nasi hangat."
                },
                {
                    nama_pengulas: "Budi K.",
                    rating: 4,
                    tanggal: "2025-09-22",
                    isi: "Enak, gurihnya terasa. Tapi kemasan agak bocor sedikit saat pengiriman."
                },
                {
                    nama_pengulas: "Siti A.",
                    rating: 5,
                    tanggal: "2025-08-30",
                    isi: "Sambal terenak yang pernah saya coba! Bikin makan jadi lahap, pasti repeat order."
                }
            ]
        },
        {
            ASIN: "KERAJI-ID-005",
            nama_produk: "Keranjang Anyaman Pandan",
            merek_produk: "Pandan Craft",
            model_produk: "PC-KP01",
            kategori: "Kerajinan",
            sub_kategori: "Anyaman Pandan",
            harga_asli: 175000,
            harga_produk: 149000,
            persentase_diskon: 15,
            mata_uang: "IDR",
            jumlah_unit: 120,
            unit_terjual: 108,
            status_produk: "Tersedia",
            minimum_pemesanan: 1,
            kondisi_produk: "Baru",
            berat_satuan: 0.6,
            bahan: "Daun pandan kering, tali rotan",
            warna: "Natural Pandan",
            negara_asal: "Indonesia",
            deskripsi_produk: "Keranjang anyaman pandan untuk tempat buah, multifungsi: tempat buah, baju kotor, atau hiasan dapur. Aroma alami, tahan lama.",
            keyword: "keranjang pandan, anyaman pandan, kerajinan pandan",
            gambar_produk: "https://smexpo.pertamina.com/data-smexpo/images/products/4416/id-11134207-7rasd-m1md1w3yvja7c1_1731047489.jpeg",
            thumbnail_produk: "https://smexpo.pertamina.com/data-smexpo/images/products/4416/id-11134207-7rasd-m1md1w3yvja7c1_1731047489.jpeg",
            galeri_gambar: [
                "https://smexpo.pertamina.com/data-smexpo/images/products/4416/id-11134207-7rasd-m1md1w3yvja7c1_1731047489.jpeg",
                "https://smexpo.pertamina.com/data-smexpo/images/products/4416/id-11134207-7rasd-m1md1w3yvja7c1_1731047489.jpeg",
                "https://smexpo.pertamina.com/data-smexpo/images/products/4416/id-11134207-7rasd-m1md1w3yvja7c1_1731047489.jpeg"
            ],
            varian_produk: [
                "https://smexpo.pertamina.com/data-smexpo/images/products/4416/id-11134207-7rasd-m1md1w3yvja7c1_1731047489.jpeg",
                "https://smexpo.pertamina.com/data-smexpo/images/products/4416/id-11134207-7rasd-m1md1w3yvja7c1_1731047489.jpeg",
                "https://smexpo.pertamina.com/data-smexpo/images/products/4416/id-11134207-7rasd-m1md1w3yvja7c1_1731047489.jpeg"
            ],
            toko: "Karya Nusantara",
            rating_toko: 4.9,
            status_toko: "Official Store",
            lokasi_toko: "Jl. Imogiri Timur No.123, Giwangan, Kec. Umbulharjo, Kota Yogyakarta, Daerah Istimewa Yogyakarta 55163",
            maps_link: "https://maps.app.goo.gl/9vX8kL3mP7vZfG8J7",
            rating_bintang: 4.6,
            jumlah_ulasan: 620,
            hari_operasional: "Senin - Minggu",
            jam_operasional: "09:00 - 21:00",
            ulasan: [
                {
                    nama_pengulas: "Rina S.",
                    rating: 5,
                    tanggal: "2025-10-15",
                    isi: "Pedasnya pas banget, aroma asapnya bikin nagih! Cumi lembut, cocok buat temen nasi hangat."
                },
                {
                    nama_pengulas: "Budi K.",
                    rating: 4,
                    tanggal: "2025-09-22",
                    isi: "Enak, gurihnya terasa. Tapi kemasan agak bocor sedikit saat pengiriman."
                },
                {
                    nama_pengulas: "Siti A.",
                    rating: 5,
                    tanggal: "2025-08-30",
                    isi: "Sambal terenak yang pernah saya coba! Bikin makan jadi lahap, pasti repeat order."
                }
            ]
        },
        // Kesehatan
        {
            ASIN: "KESEH-ID-001",
            nama_produk: "Salep Kulit Antiseptik Betadine Ointment 20g",
            merek_produk: "Betadine",
            model_produk: "BTD-20G",
            kategori: "Kesehatan",
            sub_kategori: "Perawatan Luka & Antiseptik",
            harga_asli: 45000,
            harga_produk: 36500,
            persentase_diskon: 19,
            mata_uang: "IDR",
            jumlah_unit: 2800,
            unit_terjual: 2100,
            status_produk: "Tersedia",
            minimum_pemesanan: 1,
            kondisi_produk: "Baru",
            berat_satuan: 20,
            bahan: "Povidone-Iodine 10%, Basis salep hidrofilik",
            deskripsi_produk: "Betadine Ointment adalah salep antiseptik yang mengandung povidone-iodine 10% untuk membantu mencegah infeksi pada luka kecil, goresan, dan luka bakar ringan.",
            keyword: "salep antiseptik, betadine, perawatan luka, povidone iodine",
            gambar_produk: "https://down-id.img.susercontent.com/file/id-11134207-81zto-mdydzuh0wzk012",
            thumbnail_produk: "https://down-id.img.susercontent.com/file/id-11134207-81zto-mdydzuh0wzk012",
            galeri_gambar: [
                "https://down-id.img.susercontent.com/file/id-11134207-81zto-mdydzuh0wzk012",
                "https://down-id.img.susercontent.com/file/id-11134207-81zto-mdydzuh0wzk012",
                "https://down-id.img.susercontent.com/file/id-11134207-81zto-mdydzuh0wzk012"
            ],
            varian_produk: [
                "https://down-id.img.susercontent.com/file/id-11134207-81zto-mdydzuh0wzk012",
                "https://down-id.img.susercontent.com/file/id-11134207-81zto-mdydzuh0wzk012",
                "https://down-id.img.susercontent.com/file/id-11134207-81zto-mdydzuh0wzk012"
            ],
            toko: "Apotek Sehat Nusantara",
            rating_toko: 4.9,
            status_toko: "Official Store",
            lokasi_toko: "Jl. Raya Pondok Gede No.27, Jatimakmur, Kec. Pondok Gede, Kota Bekasi, Jawa Barat 17413",
            maps_link: "https://maps.app.goo.gl/2mK9vL3kP7bZfG8J7",
            rating_bintang: 4.9,
            jumlah_ulasan: 940,
            hari_operasional: "Senin - Minggu",
            jam_operasional: "07:00 - 23:00",
            ulasan: [
                {
                    nama_pengulas: "Rina S.",
                    rating: 5,
                    tanggal: "2025-10-15",
                    isi: "Pedasnya pas banget, aroma asapnya bikin nagih! Cumi lembut, cocok buat temen nasi hangat."
                },
                {
                    nama_pengulas: "Budi K.",
                    rating: 4,
                    tanggal: "2025-09-22",
                    isi: "Enak, gurihnya terasa. Tapi kemasan agak bocor sedikit saat pengiriman."
                },
                {
                    nama_pengulas: "Siti A.",
                    rating: 5,
                    tanggal: "2025-08-30",
                    isi: "Sambal terenak yang pernah saya coba! Bikin makan jadi lahap, pasti repeat order."
                }
            ]
        },
        {
            ASIN: "KESEH-ID-002",
            nama_produk: "Vitamin C 1000mg - Suplemen Daya Tahan Tubuh",
            merek_produk: "Wellness ID",
            model_produk: "Botol 30 Tablet",
            kategori: "Kesehatan",
            sub_kategori: "Suplemen & Vitamin",
            harga_asli: 95000,
            harga_produk: 75000,
            persentase_diskon: 21,
            mata_uang: "IDR",
            jumlah_unit: 500,
            unit_terjual: 410,
            status_produk: "Tersedia",
            minimum_pemesanan: 1,
            kondisi_produk: "Baru",
            berat_satuan: 200,
            bahan: "Vitamin C, Zinc, Citrus Extract",
            deskripsi_produk: "Suplemen Vitamin C 1000mg untuk menjaga daya tahan tubuh, membantu pembentukan kolagen, dan meningkatkan energi harian.",
            keyword: "vitamin c, daya tahan tubuh, suplemen kesehatan",
            gambar_produk: "https://down-id.img.susercontent.com/file/id-11134207-7r98s-lqsqjcxm0qx1db",
            thumbnail_produk: "https://down-id.img.susercontent.com/file/id-11134207-7r98s-lqsqjcxm0qx1db",
            galeri_gambar: [
                "https://down-id.img.susercontent.com/file/id-11134207-7r98s-lqsqjcxm0qx1db",
                "https://down-id.img.susercontent.com/file/id-11134207-7r98s-lqsqjcxm0qx1db",
                "https://down-id.img.susercontent.com/file/id-11134207-7r98s-lqsqjcxm0qx1db"
            ],
            varian_produk: [
                "https://down-id.img.susercontent.com/file/id-11134207-7r98s-lqsqjcxm0qx1db",
                "https://down-id.img.susercontent.com/file/id-11134207-7r98s-lqsqjcxm0qx1db",
                "https://down-id.img.susercontent.com/file/id-11134207-7r98s-lqsqjcxm0qx1db"
            ],
            toko: "Apotek Sehat Nusantara",
            rating_toko: 4.9,
            status_toko: "Official Store",
            lokasi_toko: "Jl. Raya Pondok Gede No.27, Jatimakmur, Kec. Pondok Gede, Kota Bekasi, Jawa Barat 17413",
            maps_link: "https://maps.app.goo.gl/2mK9vL3kP7bZfG8J7",
            rating_bintang: 4.9,
            jumlah_ulasan: 230,
            hari_operasional: "Senin - Minggu",
            jam_operasional: "07:00 - 23:00",
            ulasan: [
                {
                    nama_pengulas: "Rina S.",
                    rating: 5,
                    tanggal: "2025-10-15",
                    isi: "Pedasnya pas banget, aroma asapnya bikin nagih! Cumi lembut, cocok buat temen nasi hangat."
                },
                {
                    nama_pengulas: "Budi K.",
                    rating: 4,
                    tanggal: "2025-09-22",
                    isi: "Enak, gurihnya terasa. Tapi kemasan agak bocor sedikit saat pengiriman."
                },
                {
                    nama_pengulas: "Siti A.",
                    rating: 5,
                    tanggal: "2025-08-30",
                    isi: "Sambal terenak yang pernah saya coba! Bikin makan jadi lahap, pasti repeat order."
                }
            ]
        },
        {
            ASIN: "KESEH-ID-003",
            nama_produk: "Masker Medis 3 Ply - Isi 50 Pcs",
            merek_produk: "OneMed",
            model_produk: "Masker 3 Ply",
            kategori: "Kesehatan",
            sub_kategori: "Alat Pelindung Diri",
            harga_asli: 35000,
            harga_produk: 28000,
            persentase_diskon: 20,
            mata_uang: "IDR",
            jumlah_unit: 2000,
            unit_terjual: 1800,
            status_produk: "Tersedia",
            minimum_pemesanan: 1,
            kondisi_produk: "Baru",
            berat_satuan: 200,
            bahan: "Non-woven, meltblown filter",
            deskripsi_produk: "Masker medis 3 lapis dengan filter meltblown, nyaman digunakan, bersertifikat Kemenkes.",
            keyword: "masker medis, masker 3 ply, alat pelindung diri",
            gambar_produk: "https://img.lazcdn.com/g/p/dc07fae0cfc740f0aeabe7e63486e3fd.jpg_720x720q80.jpg",
            thumbnail_produk: "https://img.lazcdn.com/g/p/dc07fae0cfc740f0aeabe7e63486e3fd.jpg_720x720q80.jpg",
            galeri_gambar: [
                "https://img.lazcdn.com/g/p/dc07fae0cfc740f0aeabe7e63486e3fd.jpg_720x720q80.jpg",
                "https://img.lazcdn.com/g/p/dc07fae0cfc740f0aeabe7e63486e3fd.jpg_720x720q80.jpg",
                "https://img.lazcdn.com/g/p/dc07fae0cfc740f0aeabe7e63486e3fd.jpg_720x720q80.jpg"
            ],
            varian_produk: [
                "https://img.lazcdn.com/g/p/dc07fae0cfc740f0aeabe7e63486e3fd.jpg_720x720q80.jpg",
                "https://img.lazcdn.com/g/p/dc07fae0cfc740f0aeabe7e63486e3fd.jpg_720x720q80.jpg",
                "https://img.lazcdn.com/g/p/dc07fae0cfc740f0aeabe7e63486e3fd.jpg_720x720q80.jpg"
            ],
            toko: "Apotek Sehat Nusantara",
            rating_toko: 4.9,
            status_toko: "Official Store",
            lokasi_toko: "Jl. Raya Pondok Gede No.27, Jatimakmur, Kec. Pondok Gede, Kota Bekasi, Jawa Barat 17413",
            maps_link: "https://maps.app.goo.gl/2mK9vL3kP7bZfG8J7",
            rating_bintang: 4.8,
            jumlah_ulasan: 1200,
            hari_operasional: "Senin - Minggu",
            jam_operasional: "07:00 - 23:00",
            ulasan: [
                {
                    nama_pengulas: "Rina S.",
                    rating: 5,
                    tanggal: "2025-10-15",
                    isi: "Pedasnya pas banget, aroma asapnya bikin nagih! Cumi lembut, cocok buat temen nasi hangat."
                },
                {
                    nama_pengulas: "Budi K.",
                    rating: 4,
                    tanggal: "2025-09-22",
                    isi: "Enak, gurihnya terasa. Tapi kemasan agak bocor sedikit saat pengiriman."
                },
                {
                    nama_pengulas: "Siti A.",
                    rating: 5,
                    tanggal: "2025-08-30",
                    isi: "Sambal terenak yang pernah saya coba! Bikin makan jadi lahap, pasti repeat order."
                }
            ]
        },
        {
            ASIN: "KESEH-ID-004",
            nama_produk: "Termometer Digital Inframerah",
            merek_produk: "Omron",
            model_produk: "MC-720",
            kategori: "Kesehatan",
            sub_kategori: "Alat Ukur Kesehatan",
            harga_asli: 650000,
            harga_produk: 499000,
            persentase_diskon: 23,
            mata_uang: "IDR",
            jumlah_unit: 150,
            unit_terjual: 120,
            status_produk: "Tersedia",
            minimum_pemesanan: 1,
            kondisi_produk: "Baru",
            berat_satuan: 300,
            bahan: "Plastik ABS, sensor inframerah",
            deskripsi_produk: "Termometer digital tanpa sentuh, akurat, cepat, dan higienis. Cocok untuk keluarga dan klinik.",
            keyword: "termometer digital, omron, alat ukur suhu",
            gambar_produk: "https://img.lazcdn.com/g/p/dc07fae0cfc740f0aeabe7e63486e3fd.jpg_720x720q80.jpg",
            thumbnail_produk: "https://img.lazcdn.com/g/p/dc07fae0cfc740f0aeabe7e63486e3fd.jpg_720x720q80.jpg",
            galeri_gambar: [
                "https://img.lazcdn.com/g/p/dc07fae0cfc740f0aeabe7e63486e3fd.jpg_720x720q80.jpg",
                "https://img.lazcdn.com/g/p/dc07fae0cfc740f0aeabe7e63486e3fd.jpg_720x720q80.jpg",
                "https://img.lazcdn.com/g/p/dc07fae0cfc740f0aeabe7e63486e3fd.jpg_720x720q80.jpg"
            ],
            varian_produk: [
                "https://img.lazcdn.com/g/p/dc07fae0cfc740f0aeabe7e63486e3fd.jpg_720x720q80.jpg",
                "https://img.lazcdn.com/g/p/dc07fae0cfc740f0aeabe7e63486e3fd.jpg_720x720q80.jpg",
                "https://img.lazcdn.com/g/p/dc07fae0cfc740f0aeabe7e63486e3fd.jpg_720x720q80.jpg"
            ],
            toko: "Apotek Sehat Nusantara",
            rating_toko: 4.9,
            status_toko: "Official Store",
            lokasi_toko: "Jl. Raya Pondok Gede No.27, Jatimakmur, Kec. Pondok Gede, Kota Bekasi, Jawa Barat 17413",
            maps_link: "https://maps.app.goo.gl/2mK9vL3kP7bZfG8J7",
            rating_bintang: 4.9,
            jumlah_ulasan: 380,
            hari_operasional: "Senin - Minggu",
            jam_operasional: "07:00 - 23:00",
            ulasan: [
                {
                    nama_pengulas: "Rina S.",
                    rating: 5,
                    tanggal: "2025-10-15",
                    isi: "Pedasnya pas banget, aroma asapnya bikin nagih! Cumi lembut, cocok buat temen nasi hangat."
                },
                {
                    nama_pengulas: "Budi K.",
                    rating: 4,
                    tanggal: "2025-09-22",
                    isi: "Enak, gurihnya terasa. Tapi kemasan agak bocor sedikit saat pengiriman."
                },
                {
                    nama_pengulas: "Siti A.",
                    rating: 5,
                    tanggal: "2025-08-30",
                    isi: "Sambal terenak yang pernah saya coba! Bikin makan jadi lahap, pasti repeat order."
                }
            ]
        },
        {
            ASIN: "KESEH-ID-005",
            nama_produk: "Hand Sanitizer 500ml - Alkohol 70%",
            merek_produk: "Antis",
            model_produk: "Pump Bottle",
            kategori: "Kesehatan",
            sub_kategori: "Kebersihan Tangan",
            harga_asli: 45000,
            harga_produk: 35000,
            persentase_diskon: 22,
            mata_uang: "IDR",
            jumlah_unit: 1000,
            unit_terjual: 890,
            status_produk: "Tersedia",
            minimum_pemesanan: 1,
            kondisi_produk: "Baru",
            berat_satuan: 550,
            bahan: "Etanol 70%, gliserin, aloe vera",
            deskripsi_produk: "Hand sanitizer dengan alkohol 70% membunuh 99.9% kuman. Wangi segar, tidak lengket.",
            keyword: "hand sanitizer, antis, pembersih tangan",
            gambar_produk: "https://cdn.ralali.id/assets/img/Libraries/JCL-Hand-Sanitizer-Gel-500ml-(70-Persen-Alkohol-Extra-Moisturizer)_Apboss6JdTo80KMU_1627646426.png",
            thumbnail_produk: "https://cdn.ralali.id/assets/img/Libraries/JCL-Hand-Sanitizer-Gel-500ml-(70-Persen-Alkohol-Extra-Moisturizer)_Apboss6JdTo80KMU_1627646426.png",
            galeri_gambar: [
                "https://cdn.ralali.id/assets/img/Libraries/JCL-Hand-Sanitizer-Gel-500ml-(70-Persen-Alkohol-Extra-Moisturizer)_Apboss6JdTo80KMU_1627646426.png",
                "https://cdn.ralali.id/assets/img/Libraries/JCL-Hand-Sanitizer-Gel-500ml-(70-Persen-Alkohol-Extra-Moisturizer)_Apboss6JdTo80KMU_1627646426.png",
                "https://cdn.ralali.id/assets/img/Libraries/JCL-Hand-Sanitizer-Gel-500ml-(70-Persen-Alkohol-Extra-Moisturizer)_Apboss6JdTo80KMU_1627646426.png"
            ],
            varian_produk: [
                "https://cdn.ralali.id/assets/img/Libraries/JCL-Hand-Sanitizer-Gel-500ml-(70-Persen-Alkohol-Extra-Moisturizer)_Apboss6JdTo80KMU_1627646426.png",
                "https://cdn.ralali.id/assets/img/Libraries/JCL-Hand-Sanitizer-Gel-500ml-(70-Persen-Alkohol-Extra-Moisturizer)_Apboss6JdTo80KMU_1627646426.png",
                "https://cdn.ralali.id/assets/img/Libraries/JCL-Hand-Sanitizer-Gel-500ml-(70-Persen-Alkohol-Extra-Moisturizer)_Apboss6JdTo80KMU_1627646426.png"
            ],
            toko: "Apotek Sehat Nusantara",
            rating_toko: 4.9,
            status_toko: "Official Store",
            lokasi_toko: "Jl. Raya Pondok Gede No.27, Jatimakmur, Kec. Pondok Gede, Kota Bekasi, Jawa Barat 17413",
            maps_link: "https://maps.app.goo.gl/2mK9vL3kP7bZfG8J7",
            rating_bintang: 4.8,
            jumlah_ulasan: 720,
            hari_operasional: "Senin - Minggu",
            jam_operasional: "07:00 - 23:00",
            ulasan: [
                {
                    nama_pengulas: "Rina S.",
                    rating: 5,
                    tanggal: "2025-10-15",
                    isi: "Pedasnya pas banget, aroma asapnya bikin nagih! Cumi lembut, cocok buat temen nasi hangat."
                },
                {
                    nama_pengulas: "Budi K.",
                    rating: 4,
                    tanggal: "2025-09-22",
                    isi: "Enak, gurihnya terasa. Tapi kemasan agak bocor sedikit saat pengiriman."
                },
                {
                    nama_pengulas: "Siti A.",
                    rating: 5,
                    tanggal: "2025-08-30",
                    isi: "Sambal terenak yang pernah saya coba! Bikin makan jadi lahap, pasti repeat order."
                }
            ]
        },
        // Pertanian
        {
            ASIN: "PERTA-ID-001",
            nama_produk: "Benih Padi Ciherang 1kg",
            merek_produk: "BISI International",
            model_produk: "Ciherang",
            kategori: "Pertanian",
            sub_kategori: "Benih Padi",
            harga_asli: 75000,
            harga_produk: 65000,
            persentase_diskon: 13,
            mata_uang: "IDR",
            jumlah_unit: 1500,
            unit_terjual: 1320,
            status_produk: "Tersedia",
            minimum_pemesanan: 1,
            kondisi_produk: "Baru",
            berat_satuan: 1.0,
            bahan: "Benih padi varietas Ciherang bersertifikat",
            negara_asal: "Indonesia",
            deskripsi_produk: "Benih padi Ciherang unggul, tahan hama wereng coklat, umur panen 115-120 hari, potensi hasil 8-10 ton/ha.",
            keyword: "benih padi ciherang, bibit padi unggul",
            gambar_produk: "https://cf.shopee.co.id/file/id-11134207-81ztp-mfc5ugoi3zf01d",
            thumbnail_produk: "https://cf.shopee.co.id/file/id-11134207-81ztp-mfc5ugoi3zf01d",
            galeri_gambar: [
                "https://cf.shopee.co.id/file/id-11134207-81ztp-mfc5ugoi3zf01d",
                "https://cf.shopee.co.id/file/id-11134207-81ztp-mfc5ugoi3zf01d",
                "https://cf.shopee.co.id/file/id-11134207-81ztp-mfc5ugoi3zf01d"
            ],
            varian_produk: [
                "https://cf.shopee.co.id/file/id-11134207-81ztp-mfc5ugoi3zf01d",
                "https://cf.shopee.co.id/file/id-11134207-81ztp-mfc5ugoi3zf01d",
                "https://cf.shopee.co.id/file/id-11134207-81ztp-mfc5ugoi3zf01d"
            ],
            toko: "Tani Makmur Indonesia",
            rating_toko: 4.9,
            status_toko: "Official Store",
            lokasi_toko: "Jl. Raya Tlogomas No.56, Lowokwaru, Kec. Lowokwaru, Kota Malang, Jawa Timur 65144",
            maps_link: "https://maps.app.goo.gl/5vN9vL3kP9bZfG8J7",
            rating_bintang: 4.8,
            jumlah_ulasan: 890,
            hari_operasional: "Senin - Sabtu",
            jam_operasional: "07:00 - 18:00",
            ulasan: [
                {
                    nama_pengulas: "Rina S.",
                    rating: 5,
                    tanggal: "2025-10-15",
                    isi: "Pedasnya pas banget, aroma asapnya bikin nagih! Cumi lembut, cocok buat temen nasi hangat."
                },
                {
                    nama_pengulas: "Budi K.",
                    rating: 4,
                    tanggal: "2025-09-22",
                    isi: "Enak, gurihnya terasa. Tapi kemasan agak bocor sedikit saat pengiriman."
                },
                {
                    nama_pengulas: "Siti A.",
                    rating: 5,
                    tanggal: "2025-08-30",
                    isi: "Sambal terenak yang pernah saya coba! Bikin makan jadi lahap, pasti repeat order."
                }
            ]
        },
        {
            ASIN: "PERTA-ID-002",
            nama_produk: "Pupuk NPK Mutiara 16-16-16 1kg",
            merek_produk: "Merdeka Tani",
            model_produk: "NPK 1kg",
            kategori: "Pertanian",
            sub_kategori: "Pupuk",
            harga_asli: 35000,
            harga_produk: 28000,
            persentase_diskon: 20,
            mata_uang: "IDR",
            jumlah_unit: 3000,
            unit_terjual: 2650,
            status_produk: "Tersedia",
            minimum_pemesanan: 1,
            kondisi_produk: "Baru",
            berat_satuan: 1.0,
            bahan: "Nitrogen, Fosfor, Kalium",
            negara_asal: "Indonesia",
            deskripsi_produk: "Pupuk NPK seimbang untuk semua tanaman, meningkatkan pertumbuhan dan hasil panen.",
            keyword: "pupuk npk, pupuk tanaman, pupuk merdeka",
            gambar_produk: "https://down-id.img.susercontent.com/file/id-11134207-7qul3-lkeypah4qam8ca",
            thumbnail_produk: "https://down-id.img.susercontent.com/file/id-11134207-7qul3-lkeypah4qam8ca",
            galeri_gambar: [
                "https://down-id.img.susercontent.com/file/id-11134207-7qul3-lkeypah4qam8ca",
                "https://down-id.img.susercontent.com/file/id-11134207-7qul3-lkeypah4qam8ca",
                "https://down-id.img.susercontent.com/file/id-11134207-7qul3-lkeypah4qam8ca"
            ],
            varian_produk: [
                "https://down-id.img.susercontent.com/file/id-11134207-7qul3-lkeypah4qam8ca",
                "https://down-id.img.susercontent.com/file/id-11134207-7qul3-lkeypah4qam8ca",
                "https://down-id.img.susercontent.com/file/id-11134207-7qul3-lkeypah4qam8ca"
            ],
            toko: "Tani Makmur Indonesia",
            rating_toko: 4.9,
            status_toko: "Official Store",
            lokasi_toko: "Jl. Raya Tlogomas No.56, Lowokwaru, Kec. Lowokwaru, Kota Malang, Jawa Timur 65144",
            maps_link: "https://maps.app.goo.gl/5vN9vL3kP9bZfG8J7",
            rating_bintang: 4.9,
            jumlah_ulasan: 1100,
            hari_operasional: "Senin - Sabtu",
            jam_operasional: "07:00 - 18:00",
            ulasan: [
                {
                    nama_pengulas: "Rina S.",
                    rating: 5,
                    tanggal: "2025-10-15",
                    isi: "Pedasnya pas banget, aroma asapnya bikin nagih! Cumi lembut, cocok buat temen nasi hangat."
                },
                {
                    nama_pengulas: "Budi K.",
                    rating: 4,
                    tanggal: "2025-09-22",
                    isi: "Enak, gurihnya terasa. Tapi kemasan agak bocor sedikit saat pengiriman."
                },
                {
                    nama_pengulas: "Siti A.",
                    rating: 5,
                    tanggal: "2025-08-30",
                    isi: "Sambal terenak yang pernah saya coba! Bikin makan jadi lahap, pasti repeat order."
                }
            ]
        },
        {
            ASIN: "PERTA-ID-003",
            nama_produk: "Bibit Cabai Rawit Merah 100 Butir",
            merek_produk: "Cap Panah Merah",
            model_produk: "Cabai Rawit",
            kategori: "Pertanian",
            sub_kategori: "Benih Sayuran",
            harga_asli: 25000,
            harga_produk: 19000,
            persentase_diskon: 24,
            mata_uang: "IDR",
            jumlah_unit: 5000,
            unit_terjual: 4300,
            status_produk: "Tersedia",
            minimum_pemesanan: 1,
            kondisi_produk: "Baru",
            berat_satuan: 0.1,
            bahan: "Benih cabai rawit unggul",
            negara_asal: "Indonesia",
            deskripsi_produk: "Bibit cabai rawit merah tahan virus, produktivitas tinggi, cocok untuk dataran rendah hingga tinggi.",
            keyword: "bibit cabai, benih cabai rawit, panah merah",
            gambar_produk: "https://www.static-src.com/wcsstore/Indraprastha/images/catalog/full/catalog-image/97/MTA-181736251/brd-119704_bibit-cabe-rawit-merah-peak-cha-benih-bibit-cabe-rawit-benih-cabe-rawit-bibit-cabai-rawit-benih-cabai-rawit-benih-cabe-rawit-merah_full01-98c08398.jpg",
            thumbnail_produk: "https://www.static-src.com/wcsstore/Indraprastha/images/catalog/full/catalog-image/97/MTA-181736251/brd-119704_bibit-cabe-rawit-merah-peak-cha-benih-bibit-cabe-rawit-benih-cabe-rawit-bibit-cabai-rawit-benih-cabai-rawit-benih-cabe-rawit-merah_full01-98c08398.jpg",
            galeri_gambar: [
                "https://www.static-src.com/wcsstore/Indraprastha/images/catalog/full/catalog-image/97/MTA-181736251/brd-119704_bibit-cabe-rawit-merah-peak-cha-benih-bibit-cabe-rawit-benih-cabe-rawit-bibit-cabai-rawit-benih-cabai-rawit-benih-cabe-rawit-merah_full01-98c08398.jpg",
                "https://www.static-src.com/wcsstore/Indraprastha/images/catalog/full/catalog-image/97/MTA-181736251/brd-119704_bibit-cabe-rawit-merah-peak-cha-benih-bibit-cabe-rawit-benih-cabe-rawit-bibit-cabai-rawit-benih-cabai-rawit-benih-cabe-rawit-merah_full01-98c08398.jpg",
                "https://www.static-src.com/wcsstore/Indraprastha/images/catalog/full/catalog-image/97/MTA-181736251/brd-119704_bibit-cabe-rawit-merah-peak-cha-benih-bibit-cabe-rawit-benih-cabe-rawit-bibit-cabai-rawit-benih-cabai-rawit-benih-cabe-rawit-merah_full01-98c08398.jpg"
            ],
            varian_produk: [
                "https://www.static-src.com/wcsstore/Indraprastha/images/catalog/full/catalog-image/97/MTA-181736251/brd-119704_bibit-cabe-rawit-merah-peak-cha-benih-bibit-cabe-rawit-benih-cabe-rawit-bibit-cabai-rawit-benih-cabai-rawit-benih-cabe-rawit-merah_full01-98c08398.jpg",
                "https://www.static-src.com/wcsstore/Indraprastha/images/catalog/full/catalog-image/97/MTA-181736251/brd-119704_bibit-cabe-rawit-merah-peak-cha-benih-bibit-cabe-rawit-benih-cabe-rawit-bibit-cabai-rawit-benih-cabai-rawit-benih-cabe-rawit-merah_full01-98c08398.jpg",
                "https://www.static-src.com/wcsstore/Indraprastha/images/catalog/full/catalog-image/97/MTA-181736251/brd-119704_bibit-cabe-rawit-merah-peak-cha-benih-bibit-cabe-rawit-benih-cabe-rawit-bibit-cabai-rawit-benih-cabai-rawit-benih-cabe-rawit-merah_full01-98c08398.jpg"
            ],
            toko: "Tani Makmur Indonesia",
            rating_toko: 4.9,
            status_toko: "Official Store",
            lokasi_toko: "Jl. Raya Tlogomas No.56, Lowokwaru, Kec. Lowokwaru, Kota Malang, Jawa Timur 65144",
            maps_link: "https://maps.app.goo.gl/5vN9vL3kP9bZfG8J7",
            rating_bintang: 4.8,
            jumlah_ulasan: 980,
            hari_operasional: "Senin - Sabtu",
            jam_operasional: "07:00 - 18:00",
            ulasan: [
                {
                    nama_pengulas: "Rina S.",
                    rating: 5,
                    tanggal: "2025-10-15",
                    isi: "Pedasnya pas banget, aroma asapnya bikin nagih! Cumi lembut, cocok buat temen nasi hangat."
                },
                {
                    nama_pengulas: "Budi K.",
                    rating: 4,
                    tanggal: "2025-09-22",
                    isi: "Enak, gurihnya terasa. Tapi kemasan agak bocor sedikit saat pengiriman."
                },
                {
                    nama_pengulas: "Siti A.",
                    rating: 5,
                    tanggal: "2025-08-30",
                    isi: "Sambal terenak yang pernah saya coba! Bikin makan jadi lahap, pasti repeat order."
                }
            ]
        },
        {
            ASIN: "PERTA-ID-004",
            nama_produk: "Pestisida Organik Neem Oil 500ml",
            merek_produk: "BioTani",
            model_produk: "Neem 500ml",
            kategori: "Pertanian",
            sub_kategori: "Pestisida",
            harga_asli: 85000,
            harga_produk: 69000,
            persentase_diskon: 19,
            mata_uang: "IDR",
            jumlah_unit: 800,
            unit_terjual: 720,
            status_produk: "Tersedia",
            minimum_pemesanan: 1,
            kondisi_produk: "Baru",
            berat_satuan: 600,
            bahan: "Ekstrak neem, minyak kelapa",
            negara_asal: "Indonesia",
            deskripsi_produk: "Pestisida alami dari ekstrak neem, aman untuk tanaman pangan, efektif lawan ulat dan kutu.",
            keyword: "pestisida organik, neem oil, bio pestisida",
            gambar_produk: "https://down-id.img.susercontent.com/file/id-11134207-7ra0q-mdrv8f30o3ij0c",
            thumbnail_produk: "https://down-id.img.susercontent.com/file/id-11134207-7ra0q-mdrv8f30o3ij0c",
            galeri_gambar: [
                "https://down-id.img.susercontent.com/file/id-11134207-7ra0q-mdrv8f30o3ij0c",
                "https://down-id.img.susercontent.com/file/id-11134207-7ra0q-mdrv8f30o3ij0c",
                "https://down-id.img.susercontent.com/file/id-11134207-7ra0q-mdrv8f30o3ij0c"
            ],
            varian_produk: [
                "https://down-id.img.susercontent.com/file/id-11134207-7ra0q-mdrv8f30o3ij0c",
                "https://down-id.img.susercontent.com/file/id-11134207-7ra0q-mdrv8f30o3ij0c",
                "https://down-id.img.susercontent.com/file/id-11134207-7ra0q-mdrv8f30o3ij0c"
            ],
            toko: "Tani Makmur Indonesia",
            rating_toko: 4.9,
            status_toko: "Official Store",
            lokasi_toko: "Jl. Raya Tlogomas No.56, Lowokwaru, Kec. Lowokwaru, Kota Malang, Jawa Timur 65144",
            maps_link: "https://maps.app.goo.gl/5vN9vL3kP9bZfG8J7",
            rating_bintang: 4.7,
            jumlah_ulasan: 450,
            hari_operasional: "Senin - Sabtu",
            jam_operasional: "07:00 - 18:00",
            ulasan: [
                {
                    nama_pengulas: "Rina S.",
                    rating: 5,
                    tanggal: "2025-10-15",
                    isi: "Pedasnya pas banget, aroma asapnya bikin nagih! Cumi lembut, cocok buat temen nasi hangat."
                },
                {
                    nama_pengulas: "Budi K.",
                    rating: 4,
                    tanggal: "2025-09-22",
                    isi: "Enak, gurihnya terasa. Tapi kemasan agak bocor sedikit saat pengiriman."
                },
                {
                    nama_pengulas: "Siti A.",
                    rating: 5,
                    tanggal: "2025-08-30",
                    isi: "Sambal terenak yang pernah saya coba! Bikin makan jadi lahap, pasti repeat order."
                }
            ]
        },
        {
            ASIN: "PERTA-ID-005",
            nama_produk: "Sekop Taman Stainless Steel",
            merek_produk: "TaniPro",
            model_produk: "Sekop Mini",
            kategori: "Pertanian",
            sub_kategori: "Alat Pertanian",
            harga_asli: 75000,
            harga_produk: 59000,
            persentase_diskon: 21,
            mata_uang: "IDR",
            jumlah_unit: 1200,
            unit_terjual: 1050,
            status_produk: "Tersedia",
            minimum_pemesanan: 1,
            kondisi_produk: "Baru",
            berat_satuan: 800,
            bahan: "Stainless steel, gagang kayu",
            negara_asal: "Indonesia",
            deskripsi_produk: "Sekop taman kecil anti karat, ringan, cocok untuk berkebun di pot atau polybag.",
            keyword: "sekop taman, alat berkebun, sekop mini",
            gambar_produk: "https://img.lazcdn.com/g/ff/kf/S8ad24b275e6b46408de27ccb69b420e5l.jpg_720x720q80.jpg",
            thumbnail_produk: "https://img.lazcdn.com/g/ff/kf/S8ad24b275e6b46408de27ccb69b420e5l.jpg_720x720q80.jpg",
            galeri_gambar: [
                "https://img.lazcdn.com/g/ff/kf/S8ad24b275e6b46408de27ccb69b420e5l.jpg_720x720q80.jpg",
                "https://img.lazcdn.com/g/ff/kf/S8ad24b275e6b46408de27ccb69b420e5l.jpg_720x720q80.jpg",
                "https://img.lazcdn.com/g/ff/kf/S8ad24b275e6b46408de27ccb69b420e5l.jpg_720x720q80.jpg"
            ],
            varian_produk: [
                "https://img.lazcdn.com/g/ff/kf/S8ad24b275e6b46408de27ccb69b420e5l.jpg_720x720q80.jpg",
                "https://img.lazcdn.com/g/ff/kf/S8ad24b275e6b46408de27ccb69b420e5l.jpg_720x720q80.jpg",
                "https://img.lazcdn.com/g/ff/kf/S8ad24b275e6b46408de27ccb69b420e5l.jpg_720x720q80.jpg"
            ],
            toko: "Tani Makmur Indonesia",
            rating_toko: 4.9,
            status_toko: "Official Store",
            lokasi_toko: "Jl. Raya Tlogomas No.56, Lowokwaru, Kec. Lowokwaru, Kota Malang, Jawa Timur 65144",
            maps_link: "https://maps.app.goo.gl/5vN9vL3kP9bZfG8J7",
            rating_bintang: 4.8,
            jumlah_ulasan: 680,
            hari_operasional: "Senin - Sabtu",
            jam_operasional: "07:00 - 18:00",
            ulasan: [
                {
                    nama_pengulas: "Rina S.",
                    rating: 5,
                    tanggal: "2025-10-15",
                    isi: "Pedasnya pas banget, aroma asapnya bikin nagih! Cumi lembut, cocok buat temen nasi hangat."
                },
                {
                    nama_pengulas: "Budi K.",
                    rating: 4,
                    tanggal: "2025-09-22",
                    isi: "Enak, gurihnya terasa. Tapi kemasan agak bocor sedikit saat pengiriman."
                },
                {
                    nama_pengulas: "Siti A.",
                    rating: 5,
                    tanggal: "2025-08-30",
                    isi: "Sambal terenak yang pernah saya coba! Bikin makan jadi lahap, pasti repeat order."
                }
            ]
        },
        //Elektronik
        {
            ASIN: "ELEC-001",
            nama_produk: "Smart TV LED 43 Inch Full HD",
            merek_produk: "VisioTech",
            model_produk: "VT-43FHD",
            kategori: "Elektronik",
            sub_kategori: "Televisi",
            harga_asli: 4299000,
            harga_produk: 3699000,
            persentase_diskon: 14,
            mata_uang: "IDR",
            jumlah_unit: 80,
            unit_terjual: 310,
            status_produk: "Tersedia",
            minimum_pemesanan: 1,
            kondisi_produk: "Baru",
            berat_satuan: 6.5,
            dimensi_produk: "96x60x10 cm",
            bahan: "Plastik dan logam",
            negara_asal: "Indonesia",
            spesifikasi: "Resolusi Full HD 1080p, Wi-Fi, YouTube & Netflix Ready.",
            deskripsi_produk: "Smart TV LED VisioTech 43 Inch menghadirkan tampilan tajam dan jernih dengan konektivitas Wi-Fi bawaan untuk streaming film favoritmu.",
            keyword: "smart tv, televisi full hd",
            gambar_produk: "https://cdn.polytron.co.id/public-assets/polytroncoid/2025/03/NEW-ECOM-SKU-PLD-43RG9059-1.png",
            thumbnail_produk: "https://cdn.polytron.co.id/public-assets/polytroncoid/2025/03/NEW-ECOM-SKU-PLD-43RG9059-1.png",
            galeri_gambar: [
                "https://cdn.polytron.co.id/public-assets/polytroncoid/2025/03/NEW-ECOM-SKU-PLD-43RG9059-1.png",
                "https://cdn.polytron.co.id/public-assets/polytroncoid/2025/03/NEW-ECOM-SKU-PLD-43RG9059-1.png",
                "https://cdn.polytron.co.id/public-assets/polytroncoid/2025/03/NEW-ECOM-SKU-PLD-43RG9059-1.png"
            ],
            varian_produk: [
                "https://cdn.polytron.co.id/public-assets/polytroncoid/2025/03/NEW-ECOM-SKU-PLD-43RG9059-1.png",
                "https://cdn.polytron.co.id/public-assets/polytroncoid/2025/03/NEW-ECOM-SKU-PLD-43RG9059-1.png",
                "https://cdn.polytron.co.id/public-assets/polytroncoid/2025/03/NEW-ECOM-SKU-PLD-43RG9059-1.png"
            ],
            toko: "Gadget Nusantara",
            rating_toko: 4.9,
            status_toko: "Official Store",
            lokasi_toko: "Jl. Pluit Karang Ayu No.B1, Pluit, Kec. Penjaringan, Kota Jakarta Utara, Daerah Khusus Ibukota Jakarta 14450",
            maps_link: "https://maps.app.goo.gl/7kL9mP7vX2fZ9k8J6",
            rating_bintang: 4.8,
            jumlah_ulasan: 1250,
            hari_operasional: "Senin - Minggu",
            jam_operasional: "07:00 - 22:00",
            ulasan: [
                {
                    nama_pengulas: "Rina S.",
                    rating: 5,
                    tanggal: "2025-10-15",
                    isi: "Pedasnya pas banget, aroma asapnya bikin nagih! Cumi lembut, cocok buat temen nasi hangat."
                },
                {
                    nama_pengulas: "Budi K.",
                    rating: 4,
                    tanggal: "2025-09-22",
                    isi: "Enak, gurihnya terasa. Tapi kemasan agak bocor sedikit saat pengiriman."
                },
                {
                    nama_pengulas: "Siti A.",
                    rating: 5,
                    tanggal: "2025-08-30",
                    isi: "Sambal terenak yang pernah saya coba! Bikin makan jadi lahap, pasti repeat order."
                }
            ]
        },
        {
            ASIN: "ELEC-002",
            nama_produk: "Kipas Angin Dinding Remote 16 Inch",
            merek_produk: "Maspion",
            model_produk: "WFR-1602",
            kategori: "Elektronik",
            sub_kategori: "Pendingin Ruangan",
            harga_asli: 549000,
            harga_produk: 449000,
            persentase_diskon: 18,
            mata_uang: "IDR",
            jumlah_unit: 150,
            unit_terjual: 620,
            status_produk: "Tersedia",
            minimum_pemesanan: 1,
            kondisi_produk: "Baru",
            berat_satuan: 3.2,
            bahan: "Plastik ABS",
            negara_asal: "Indonesia",
            spesifikasi: "3 kecepatan angin, kontrol remote, mode tidur.",
            deskripsi_produk: "Kipas dinding Maspion dengan remote control dan mode hemat energi. Ideal untuk kamar atau ruang kerja.",
            keyword: "kipas angin, kipas remote",
            gambar_produk: "https://images.tokopedia.net/img/cache/700/VqbcmM/2021/3/13/faeb41e0-58e8-4fb2-82f1-2a2aa0370cf3.jpg",
            thumbnail_produk: "https://images.tokopedia.net/img/cache/700/VqbcmM/2021/3/13/faeb41e0-58e8-4fb2-82f1-2a2aa0370cf3.jpg",
            galeri_gambar: [
                "https://images.tokopedia.net/img/cache/700/VqbcmM/2021/3/13/faeb41e0-58e8-4fb2-82f1-2a2aa0370cf3.jpg",
                "https://images.tokopedia.net/img/cache/700/VqbcmM/2021/3/13/faeb41e0-58e8-4fb2-82f1-2a2aa0370cf3.jpg",
                "https://images.tokopedia.net/img/cache/700/VqbcmM/2021/3/13/faeb41e0-58e8-4fb2-82f1-2a2aa0370cf3.jpg"
            ],
            varian_produk: [
                "https://images.tokopedia.net/img/cache/700/VqbcmM/2021/3/13/faeb41e0-58e8-4fb2-82f1-2a2aa0370cf3.jpg",
                "https://images.tokopedia.net/img/cache/700/VqbcmM/2021/3/13/faeb41e0-58e8-4fb2-82f1-2a2aa0370cf3.jpg",
                "https://images.tokopedia.net/img/cache/700/VqbcmM/2021/3/13/faeb41e0-58e8-4fb2-82f1-2a2aa0370cf3.jpg"
            ],
            toko: "Gadget Nusantara",
            rating_toko: 4.9,
            status_toko: "Official Store",
            lokasi_toko: "Jl. Pluit Karang Ayu No.B1, Pluit, Kec. Penjaringan, Kota Jakarta Utara, Daerah Khusus Ibukota Jakarta 14450",
            maps_link: "https://maps.app.goo.gl/7kL9mP7vX2fZ9k8J6",
            rating_bintang: 4.7,
            jumlah_ulasan: 970,
            hari_operasional: "Senin - Minggu",
            jam_operasional: "07:00 - 22:00",
            ulasan: [
                {
                    nama_pengulas: "Rina S.",
                    rating: 5,
                    tanggal: "2025-10-15",
                    isi: "Pedasnya pas banget, aroma asapnya bikin nagih! Cumi lembut, cocok buat temen nasi hangat."
                },
                {
                    nama_pengulas: "Budi K.",
                    rating: 4,
                    tanggal: "2025-09-22",
                    isi: "Enak, gurihnya terasa. Tapi kemasan agak bocor sedikit saat pengiriman."
                },
                {
                    nama_pengulas: "Siti A.",
                    rating: 5,
                    tanggal: "2025-08-30",
                    isi: "Sambal terenak yang pernah saya coba! Bikin makan jadi lahap, pasti repeat order."
                }
            ]
        },
        {
            ASIN: "ELEC-003",
            nama_produk: "Blender Kaca 2 in 1 Philips H2116",
            merek_produk: "Philips",
            model_produk: "HR2116",
            kategori: "Elektronik",
            sub_kategori: "Peralatan Dapur",
            harga_asli: 975000,
            harga_produk: 799000,
            persentase_diskon: 18,
            mata_uang: "IDR",
            jumlah_unit: 90,
            unit_terjual: 410,
            status_produk: "Tersedia",
            minimum_pemesanan: 1,
            kondisi_produk: "Baru",
            berat_satuan: 3.1,
            bahan: "Kaca + pisau stainless steel",
            negara_asal: "Indonesia",
            spesifikasi: "Motor 600W, 5 kecepatan, mode penghancur es.",
            deskripsi_produk: "Blender Philips dengan wadah kaca tahan panas dan pisau tajam. Cocok untuk jus, bumbu, dan smoothies.",
            keyword: "blender philips, blender kaca",
            gambar_produk: "https://down-id.img.susercontent.com/file/id-11134207-7qul2-lk6dxqoi0lyad1",
            thumbnail_produk: "https://down-id.img.susercontent.com/file/id-11134207-7qul2-lk6dxqoi0lyad1",
            galeri_gambar: [
                "https://down-id.img.susercontent.com/file/id-11134207-7qul2-lk6dxqoi0lyad1",
                "https://down-id.img.susercontent.com/file/id-11134207-7qul2-lk6dxqoi0lyad1",
                "https://down-id.img.susercontent.com/file/id-11134207-7qul2-lk6dxqoi0lyad1"
            ],
            varian_produk: [
                "https://down-id.img.susercontent.com/file/id-11134207-7qul2-lk6dxqoi0lyad1",
                "https://down-id.img.susercontent.com/file/id-11134207-7qul2-lk6dxqoi0lyad1",
                "https://down-id.img.susercontent.com/file/id-11134207-7qul2-lk6dxqoi0lyad1"
            ],
            toko: "Gadget Nusantara",
            rating_toko: 4.9,
            status_toko: "Official Store",
            lokasi_toko: "Jl. Pluit Karang Ayu No.B1, Pluit, Kec. Penjaringan, Kota Jakarta Utara, Daerah Khusus Ibukota Jakarta 14450",
            maps_link: "https://maps.app.goo.gl/7kL9mP7vX2fZ9k8J6",
            rating_bintang: 4.9,
            jumlah_ulasan: 840,
            hari_operasional: "Senin - Minggu",
            jam_operasional: "07:00 - 22:00",
            ulasan: [
                {
                    nama_pengulas: "Rina S.",
                    rating: 5,
                    tanggal: "2025-10-15",
                    isi: "Pedasnya pas banget, aroma asapnya bikin nagih! Cumi lembut, cocok buat temen nasi hangat."
                },
                {
                    nama_pengulas: "Budi K.",
                    rating: 4,
                    tanggal: "2025-09-22",
                    isi: "Enak, gurihnya terasa. Tapi kemasan agak bocor sedikit saat pengiriman."
                },
                {
                    nama_pengulas: "Siti A.",
                    rating: 5,
                    tanggal: "2025-08-30",
                    isi: "Sambal terenak yang pernah saya coba! Bikin makan jadi lahap, pasti repeat order."
                }
            ]
        },
        {
            ASIN: "ELEC-004",
            nama_produk: "Realme 11",
            merek_produk: "Realme",
            model_produk: "Realme 11 5G",
            kategori: "Elektronik",
            sub_kategori: "Handphone",
            harga_asli: 3899000,
            harga_produk: 3499000,
            persentase_diskon: 10,
            mata_uang: "IDR",
            jumlah_unit: 120,
            unit_terjual: 1050,
            status_produk: "Tersedia",
            minimum_pemesanan: 1,
            kondisi_produk: "Baru",
            berat_satuan: 0.3,
            bahan: "Aluminium + kaca Gorilla",
            negara_asal: "Indonesia",
            spesifikasi: "Layar 6.6” FHD+, kamera 108MP, baterai 5000mAh.",
            deskripsi_produk: "Smartphone 5G cepat dan elegan dengan kamera super jernih dan performa gaming ringan untuk aktivitas harian.",
            keyword: "hp realme, smartphone 5g",
            gambar_produk: "https://down-id.img.susercontent.com/file/sg-11134201-23020-s1cro39ibanv80",
            thumbnail_produk: "https://down-id.img.susercontent.com/file/sg-11134201-23020-s1cro39ibanv80",
            galeri_gambar: [
                "https://down-id.img.susercontent.com/file/sg-11134201-23020-s1cro39ibanv80",
                "https://down-id.img.susercontent.com/file/sg-11134201-23020-s1cro39ibanv80",
                "https://down-id.img.susercontent.com/file/sg-11134201-23020-s1cro39ibanv80"
            ],
            varian_produk: [
                "https://down-id.img.susercontent.com/file/sg-11134201-23020-s1cro39ibanv80",
                "https://down-id.img.susercontent.com/file/sg-11134201-23020-s1cro39ibanv80",
                "https://down-id.img.susercontent.com/file/sg-11134201-23020-s1cro39ibanv80"
            ],
            toko: "Gadget Nusantara",
            rating_toko: 4.9,
            status_toko: "Official Store",
            lokasi_toko: "Jl. Pluit Karang Ayu No.B1, Pluit, Kec. Penjaringan, Kota Jakarta Utara, Daerah Khusus Ibukota Jakarta 14450",
            maps_link: "https://maps.app.goo.gl/7kL9mP7vX2fZ9k8J6",
            rating_bintang: 4.9,
            jumlah_ulasan: 5200,
            hari_operasional: "Senin - Minggu",
            jam_operasional: "07:00 - 22:00",
            ulasan: [
                {
                    nama_pengulas: "Rina S.",
                    rating: 5,
                    tanggal: "2025-10-15",
                    isi: "Pedasnya pas banget, aroma asapnya bikin nagih! Cumi lembut, cocok buat temen nasi hangat."
                },
                {
                    nama_pengulas: "Budi K.",
                    rating: 4,
                    tanggal: "2025-09-22",
                    isi: "Enak, gurihnya terasa. Tapi kemasan agak bocor sedikit saat pengiriman."
                },
                {
                    nama_pengulas: "Siti A.",
                    rating: 5,
                    tanggal: "2025-08-30",
                    isi: "Sambal terenak yang pernah saya coba! Bikin makan jadi lahap, pasti repeat order."
                }
            ]
        },
        {
            ASIN: "ELEC-005",
            nama_produk: "Headset Wireless ANC Sony WH-CH720N",
            merek_produk: "Sony",
            model_produk: "WH-CH720N",
            kategori: "Elektronik",
            sub_kategori: "Aksesoris Audio",
            harga_asli: 2099000,
            harga_produk: 1799000,
            persentase_diskon: 14,
            mata_uang: "IDR",
            jumlah_unit: 60,
            unit_terjual: 330,
            status_produk: "Tersedia",
            minimum_pemesanan: 1,
            kondisi_produk: "Baru",
            berat_satuan: 0.25,
            bahan: "Plastik premium",
            negara_asal: "Malaysia",
            spesifikasi: "Noise Cancelling, Bluetooth 5.3, baterai 35 jam.",
            deskripsi_produk: "Headset wireless Sony dengan fitur Active Noise Cancelling dan suara jernih untuk musik maupun panggilan.",
            keyword: "headset sony, wireless headphone",
            gambar_produk: "https://img.lazcdn.com/g/p/4cd1595be25129fb3a75620a26652abc.jpg_720x720q80.jpg",
            thumbnail_produk: "https://img.lazcdn.com/g/p/4cd1595be25129fb3a75620a26652abc.jpg_720x720q80.jpg",
            galeri_gambar: [
                "https://img.lazcdn.com/g/p/4cd1595be25129fb3a75620a26652abc.jpg_720x720q80.jpg",
                "https://img.lazcdn.com/g/p/4cd1595be25129fb3a75620a26652abc.jpg_720x720q80.jpg",
                "https://img.lazcdn.com/g/p/4cd1595be25129fb3a75620a26652abc.jpg_720x720q80.jpg"
            ],
            varian_produk: [
                "https://img.lazcdn.com/g/p/4cd1595be25129fb3a75620a26652abc.jpg_720x720q80.jpg",
                "https://img.lazcdn.com/g/p/4cd1595be25129fb3a75620a26652abc.jpg_720x720q80.jpg",
                "https://img.lazcdn.com/g/p/4cd1595be25129fb3a75620a26652abc.jpg_720x720q80.jpg"
            ],
            toko: "Gadget Nusantara",
            rating_toko: 4.9,
            status_toko: "Official Store",
            lokasi_toko: "Jl. Pluit Karang Ayu No.B1, Pluit, Kec. Penjaringan, Kota Jakarta Utara, Daerah Khusus Ibukota Jakarta 14450",
            maps_link: "https://maps.app.goo.gl/7kL9mP7vX2fZ9k8J6",
            rating_bintang: 4.9,
            jumlah_ulasan: 2110,
            hari_operasional: "Senin - Minggu",
            jam_operasional: "07:00 - 22:00",
            ulasan: [
                {
                    nama_pengulas: "Rina S.",
                    rating: 5,
                    tanggal: "2025-10-15",
                    isi: "Pedasnya pas banget, aroma asapnya bikin nagih! Cumi lembut, cocok buat temen nasi hangat."
                },
                {
                    nama_pengulas: "Budi K.",
                    rating: 4,
                    tanggal: "2025-09-22",
                    isi: "Enak, gurihnya terasa. Tapi kemasan agak bocor sedikit saat pengiriman."
                },
                {
                    nama_pengulas: "Siti A.",
                    rating: 5,
                    tanggal: "2025-08-30",
                    isi: "Sambal terenak yang pernah saya coba! Bikin makan jadi lahap, pasti repeat order."
                }
            ]
        },
        // Furnitur
        {
            ASIN: "FURN-ID-001",
            nama_produk: "Meja Kayu Jati Solid",
            merek_produk: "JeparaCraft",
            model_produk: "JC-MJ100",
            kategori: "Furnitur",
            sub_kategori: "Meja",
            harga_asli: 2500000,
            harga_produk: 1999000,
            persentase_diskon: 20,
            mata_uang: "IDR",
            jumlah_unit: 50,
            unit_terjual: 320,
            status_produk: "Tersedia",
            minimum_pemesanan: 1,
            kondisi_produk: "Baru",
            berat_satuan: 25,
            dimensi_produk: "150x80x75 cm",
            bahan: "Kayu Jati",
            warna: "Cokelat Tua",
            negara_asal: "Indonesia",
            deskripsi_produk: "Meja kayu jati solid dengan desain minimalis modern buatan pengrajin Jepara. Tahan lama, anti rayap, dan cocok untuk ruang makan atau ruang kerja.",
            keyword: "meja jati, mebel jepara",
            gambar_produk: "https://kursicafe.net/wp-content/uploads/2020/07/Meja-Jati-Solid-Tebal-Kaki-Besi-Alami.jpg",
            thumbnail_produk: "https://kursicafe.net/wp-content/uploads/2020/07/Meja-Jati-Solid-Tebal-Kaki-Besi-Alami.jpg",
            galeri_gambar: [
                "https://kursicafe.net/wp-content/uploads/2020/07/Meja-Jati-Solid-Tebal-Kaki-Besi-Alami.jpg",
                "https://kursicafe.net/wp-content/uploads/2020/07/Meja-Jati-Solid-Tebal-Kaki-Besi-Alami.jpg",
                "https://kursicafe.net/wp-content/uploads/2020/07/Meja-Jati-Solid-Tebal-Kaki-Besi-Alami.jpg",
            ],
            varian_produk: [
                "https://kursicafe.net/wp-content/uploads/2020/07/Meja-Jati-Solid-Tebal-Kaki-Besi-Alami.jpg",
                "https://kursicafe.net/wp-content/uploads/2020/07/Meja-Jati-Solid-Tebal-Kaki-Besi-Alami.jpg",
                "https://kursicafe.net/wp-content/uploads/2020/07/Meja-Jati-Solid-Tebal-Kaki-Besi-Alami.jpg",
            ],
            toko: "Mebel Nusantara",
            rating_toko: 4.9,
            status_toko: "Official Store",
            lokasi_toko: "Jl. Raya Tahunan Jepara No.88, Tahunan, Kec. Tahunan, Kabupaten Jepara, Jawa Tengah 59425",
            maps_link: "https://maps.app.goo.gl/4kL9mP7vX2fZ9k8J6",
            rating_bintang: 4.8,
            jumlah_ulasan: 540,
            hari_operasional: "Senin - Sabtu",
            jam_operasional: "07:00 - 19:00",
            ulasan: [
                {
                    nama_pengulas: "Rina S.",
                    rating: 5,
                    tanggal: "2025-10-15",
                    isi: "Pedasnya pas banget, aroma asapnya bikin nagih! Cumi lembut, cocok buat temen nasi hangat."
                },
                {
                    nama_pengulas: "Budi K.",
                    rating: 4,
                    tanggal: "2025-09-22",
                    isi: "Enak, gurihnya terasa. Tapi kemasan agak bocor sedikit saat pengiriman."
                },
                {
                    nama_pengulas: "Siti A.",
                    rating: 5,
                    tanggal: "2025-08-30",
                    isi: "Sambal terenak yang pernah saya coba! Bikin makan jadi lahap, pasti repeat order."
                }
            ]
        },
        {
            ASIN: "FURN-ID-002",
            nama_produk: "Kursi Rotan Sintetis",
            merek_produk: "RattanHome",
            model_produk: "RH-KRS01",
            kategori: "Furnitur",
            sub_kategori: "Kursi",
            harga_asli: 800000,
            harga_produk: 699000,
            persentase_diskon: 13,
            mata_uang: "IDR",
            jumlah_unit: 120,
            unit_terjual: 850,
            status_produk: "Tersedia",
            minimum_pemesanan: 1,
            kondisi_produk: "Baru",
            berat_satuan: 5,
            bahan: "Rotan Sintetis & Rangka Besi",
            warna: "Cokelat Muda",
            negara_asal: "Indonesia",
            deskripsi_produk: "Kursi rotan sintetis yang elegan dan tahan cuaca, cocok untuk teras atau ruang santai. Buatan tangan pengrajin Cirebon.",
            keyword: "kursi rotan, rotan sintetis",
            gambar_produk: "https://rumahmebel.id/wp-content/uploads/2020/11/Kursi-Rotan-Sintetis-Glouster-Minimalis-1.jpg",
            thumbnail_produk: "https://rumahmebel.id/wp-content/uploads/2020/11/Kursi-Rotan-Sintetis-Glouster-Minimalis-1.jpg",
            galeri_gambar: [
                "https://rumahmebel.id/wp-content/uploads/2020/11/Kursi-Rotan-Sintetis-Glouster-Minimalis-1.jpg",
                "https://rumahmebel.id/wp-content/uploads/2020/11/Kursi-Rotan-Sintetis-Glouster-Minimalis-1.jpg",
                "https://rumahmebel.id/wp-content/uploads/2020/11/Kursi-Rotan-Sintetis-Glouster-Minimalis-1.jpg"
            ],
            varian_produk: [
                "https://rumahmebel.id/wp-content/uploads/2020/11/Kursi-Rotan-Sintetis-Glouster-Minimalis-1.jpg",
                "https://rumahmebel.id/wp-content/uploads/2020/11/Kursi-Rotan-Sintetis-Glouster-Minimalis-1.jpg",
                "https://rumahmebel.id/wp-content/uploads/2020/11/Kursi-Rotan-Sintetis-Glouster-Minimalis-1.jpg"
            ],
            toko: "Mebel Nusantara",
            rating_toko: 4.9,
            status_toko: "Official Store",
            lokasi_toko: "Jl. Raya Tahunan Jepara No.88, Tahunan, Kec. Tahunan, Kabupaten Jepara, Jawa Tengah 59425",
            maps_link: "https://maps.app.goo.gl/4kL9mP7vX2fZ9k8J6",
            rating_bintang: 4.6,
            jumlah_ulasan: 310,
            hari_operasional: "Senin - Sabtu",
            jam_operasional: "07:00 - 19:00",
            ulasan: [
                {
                    nama_pengulas: "Rina S.",
                    rating: 5,
                    tanggal: "2025-10-15",
                    isi: "Pedasnya pas banget, aroma asapnya bikin nagih! Cumi lembut, cocok buat temen nasi hangat."
                },
                {
                    nama_pengulas: "Budi K.",
                    rating: 4,
                    tanggal: "2025-09-22",
                    isi: "Enak, gurihnya terasa. Tapi kemasan agak bocor sedikit saat pengiriman."
                },
                {
                    nama_pengulas: "Siti A.",
                    rating: 5,
                    tanggal: "2025-08-30",
                    isi: "Sambal terenak yang pernah saya coba! Bikin makan jadi lahap, pasti repeat order."
                }
            ]
        },
        {
            ASIN: "FURN-ID-003",
            nama_produk: "Lemari Pakaian 3 Pintu Sliding",
            merek_produk: "Mebelindo",
            model_produk: "MI-LM3P",
            kategori: "Furnitur",
            sub_kategori: "Lemari",
            harga_asli: 3200000,
            harga_produk: 2899000,
            persentase_diskon: 10,
            mata_uang: "IDR",
            jumlah_unit: 30,
            unit_terjual: 180,
            status_produk: "Tersedia",
            minimum_pemesanan: 1,
            kondisi_produk: "Baru",
            berat_satuan: 65,
            dimensi_produk: "180x60x200 cm",
            bahan: "Kayu MDF Laminasi",
            warna: "Putih",
            negara_asal: "Indonesia",
            deskripsi_produk: "Lemari pakaian modern dengan pintu geser, dilengkapi cermin dan rak penyimpanan ekstra. Desain minimalis cocok untuk kamar modern.",
            keyword: "lemari sliding, lemari pakaian",
            gambar_produk: "https://cf.shopee.co.id/file/id-11134208-7qula-lfgk0elxqkyq41",
            thumbnail_produk: "https://cf.shopee.co.id/file/id-11134208-7qula-lfgk0elxqkyq41",
            galeri_gambar: [
                "https://cf.shopee.co.id/file/id-11134208-7qula-lfgk0elxqkyq41",
                "https://cf.shopee.co.id/file/id-11134208-7qula-lfgk0elxqkyq41",
                "https://cf.shopee.co.id/file/id-11134208-7qula-lfgk0elxqkyq41"
            ],
            varian_produk: [
                "https://cf.shopee.co.id/file/id-11134208-7qula-lfgk0elxqkyq41",
                "https://cf.shopee.co.id/file/id-11134208-7qula-lfgk0elxqkyq41",
                "https://cf.shopee.co.id/file/id-11134208-7qula-lfgk0elxqkyq41"
            ],
            toko: "Mebel Nusantara",
            rating_toko: 4.9,
            status_toko: "Official Store",
            lokasi_toko: "Jl. Raya Tahunan Jepara No.88, Tahunan, Kec. Tahunan, Kabupaten Jepara, Jawa Tengah 59425",
            maps_link: "https://maps.app.goo.gl/4k5mP7vX2fZ9k8J6",
            rating_bintang: 4.7,
            jumlah_ulasan: 270,
            hari_operasional: "Senin - Sabtu",
            jam_operasional: "07:00 - 19:00",
            ulasan: [
                {
                    nama_pengulas: "Rina S.",
                    rating: 5,
                    tanggal: "2025-10-15",
                    isi: "Pedasnya pas banget, aroma asapnya bikin nagih! Cumi lembut, cocok buat temen nasi hangat."
                },
                {
                    nama_pengulas: "Budi K.",
                    rating: 4,
                    tanggal: "2025-09-22",
                    isi: "Enak, gurihnya terasa. Tapi kemasan agak bocor sedikit saat pengiriman."
                },
                {
                    nama_pengulas: "Siti A.",
                    rating: 5,
                    tanggal: "2025-08-30",
                    isi: "Sambal terenak yang pernah saya coba! Bikin makan jadi lahap, pasti repeat order."
                }
            ]
        },
        {
            ASIN: "FURN-ID-004",
            nama_produk: "Rak Buku Minimalis",
            merek_produk: "SundaFurni",
            model_produk: "SF-RB01",
            kategori: "Furnitur",
            sub_kategori: "Rak Buku",
            harga_asli: 950000,
            harga_produk: 789000,
            persentase_diskon: 17,
            mata_uang: "IDR",
            jumlah_unit: 100,
            unit_terjual: 650,
            status_produk: "Tersedia",
            minimum_pemesanan: 1,
            kondisi_produk: "Baru",
            berat_satuan: 15,
            dimensi_produk: "120x30x180 cm",
            bahan: "Kayu Mahoni",
            warna: "Cokelat Natural",
            negara_asal: "Indonesia",
            deskripsi_produk: "Rak buku minimalis bergaya skandinavia dengan finishing halus. Cocok untuk ruang kerja atau ruang tamu.",
            keyword: "rak buku minimalis, rak kayu",
            gambar_produk: "https://www.sangkayu.co.id/wp-content/uploads/2023/09/23ef5af0-4c0c-46a8-8fd6-28ff4727a640-1.jpg",
            thumbnail_produk: "https://www.sangkayu.co.id/wp-content/uploads/2023/09/23ef5af0-4c0c-46a8-8fd6-28ff4727a640-1.jpg",
            galeri_gambar: [
                "https://www.sangkayu.co.id/wp-content/uploads/2023/09/23ef5af0-4c0c-46a8-8fd6-28ff4727a640-1.jpg",
                "https://www.sangkayu.co.id/wp-content/uploads/2023/09/23ef5af0-4c0c-46a8-8fd6-28ff4727a640-1.jpg",
                "https://www.sangkayu.co.id/wp-content/uploads/2023/09/23ef5af0-4c0c-46a8-8fd6-28ff4727a640-1.jpg"
            ],
            varian_produk: [
                "https://www.sangkayu.co.id/wp-content/uploads/2023/09/23ef5af0-4c0c-46a8-8fd6-28ff4727a640-1.jpg",
                "https://www.sangkayu.co.id/wp-content/uploads/2023/09/23ef5af0-4c0c-46a8-8fd6-28ff4727a640-1.jpg",
                "https://www.sangkayu.co.id/wp-content/uploads/2023/09/23ef5af0-4c0c-46a8-8fd6-28ff4727a640-1.jpg"
            ],
            toko: "Mebel Nusantara",
            rating_toko: 4.9,
            status_toko: "Official Store",
            lokasi_toko: "Jl. Raya Tahunan Jepara No.88, Tahunan, Kec. Tahunan, Kabupaten Jepara, Jawa Tengah 59425",
            maps_link: "https://maps.app.goo.gl/4kL9mP7vX2fZ9k8J6",
            rating_bintang: 4.6,
            jumlah_ulasan: 190,
            hari_operasional: "Senin - Sabtu",
            jam_operasional: "07:00 - 19:00",
            ulasan: [
                {
                    nama_pengulas: "Rina S.",
                    rating: 5,
                    tanggal: "2025-10-15",
                    isi: "Pedasnya pas banget, aroma asapnya bikin nagih! Cumi lembut, cocok buat temen nasi hangat."
                },
                {
                    nama_pengulas: "Budi K.",
                    rating: 4,
                    tanggal: "2025-09-22",
                    isi: "Enak, gurihnya terasa. Tapi kemasan agak bocor sedikit saat pengiriman."
                },
                {
                    nama_pengulas: "Siti A.",
                    rating: 5,
                    tanggal: "2025-08-30",
                    isi: "Sambal terenak yang pernah saya coba! Bikin makan jadi lahap, pasti repeat order."
                }
            ]
        },
        {
            ASIN: "FURN-ID-005",
            nama_produk: "Sofa L Bentuk Klasik",
            merek_produk: "Eleganza",
            model_produk: "ELG-SFL",
            kategori: "Furnitur",
            sub_kategori: "Sofa",
            harga_asli: 7000000,
            harga_produk: 6499000,
            persentase_diskon: 7,
            mata_uang: "IDR",
            jumlah_unit: 20,
            unit_terjual: 90,
            status_produk: "Tersedia",
            minimum_pemesanan: 1,
            kondisi_produk: "Baru",
            berat_satuan: 80,
            bahan: "Kain Beludru & Kayu Jati",
            warna: "Abu-abu Tua",
            negara_asal: "Indonesia",
            deskripsi_produk: "Sofa berbentuk L dengan bahan beludru premium dan rangka jati solid. Nyaman dan mewah, cocok untuk ruang keluarga modern.",
            keyword: "sofa L, sofa klasik",
            gambar_produk: "https://ivaro.co.id/cdn/shop/files/cabriole.jpg?v=1752555149&width=1445",
            thumbnail_produk: "https://ivaro.co.id/cdn/shop/files/cabriole.jpg?v=1752555149&width=1445",
            galeri_gambar: [
                "https://ivaro.co.id/cdn/shop/files/cabriole.jpg?v=1752555149&width=1445",
                "https://ivaro.co.id/cdn/shop/files/cabriole.jpg?v=1752555149&width=1445",
                "https://ivaro.co.id/cdn/shop/files/cabriole.jpg?v=1752555149&width=1445"
            ],
            varian_produk: [
                "https://ivaro.co.id/cdn/shop/files/cabriole.jpg?v=1752555149&width=1445",
                "https://ivaro.co.id/cdn/shop/files/cabriole.jpg?v=1752555149&width=1445",
                "https://ivaro.co.id/cdn/shop/files/cabriole.jpg?v=1752555149&width=1445"
            ],
            toko: "Mebel Nusantara",
            rating_toko: 4.9,
            status_toko: "Official Store",
            lokasi_toko: "Jl. Raya Tahunan Jepara No.88, Tahunan, Kec. Tahunan, Kabupaten Jepara, Jawa Tengah 59425",
            maps_link: "https://maps.app.goo.gl/4kL9mP7vX2fZ9k8J6",
            rating_bintang: 4.8,
            jumlah_ulasan: 310,
            hari_operasional: "Senin - Sabtu",
            jam_operasional: "07:00 - 19:00",
            ulasan: [
                {
                    nama_pengulas: "Rina S.",
                    rating: 5,
                    tanggal: "2025-10-15",
                    isi: "Pedasnya pas banget, aroma asapnya bikin nagih! Cumi lembut, cocok buat temen nasi hangat."
                },
                {
                    nama_pengulas: "Budi K.",
                    rating: 4,
                    tanggal: "2025-09-22",
                    isi: "Enak, gurihnya terasa. Tapi kemasan agak bocor sedikit saat pengiriman."
                },
                {
                    nama_pengulas: "Siti A.",
                    rating: 5,
                    tanggal: "2025-08-30",
                    isi: "Sambal terenak yang pernah saya coba! Bikin makan jadi lahap, pasti repeat order."
                }
            ]
        },
        // Edukasi
        {
            ASIN: "EDU-ID-001",
            nama_produk: "Buku Anak Cerdas: Petualangan di Nusantara",
            merek_produk: "Cendekia Press",
            model_produk: "CP-BAC01",
            kategori: "Edukasi",
            sub_kategori: "Buku Anak",
            harga_asli: 95000,
            harga_produk: 75000,
            persentase_diskon: 21,
            mata_uang: "IDR",
            jumlah_unit: 500,
            unit_terjual: 2200,
            status_produk: "Tersedia",
            minimum_pemesanan: 1,
            kondisi_produk: "Baru",
            berat_satuan: 0.3,
            bahan: "Kertas Art Paper Premium",
            warna: "Full Color",
            negara_asal: "Indonesia",
            deskripsi_produk: "Buku bergambar interaktif yang mengenalkan budaya dan keanekaragaman Nusantara untuk anak usia 4–8 tahun. Dilengkapi ilustrasi menarik dan aktivitas belajar ringan.",
            keyword: "buku anak, edukasi nusantara",
            gambar_produk: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSKwjFXGNey8n88vzjitkEupNqcBm4KNWVNYw&s",
            thumbnail_produk: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSKwjFXGNey8n88vzjitkEupNqcBm4KNWVNYw&s",
            galeri_gambar: [
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSKwjFXGNey8n88vzjitkEupNqcBm4KNWVNYw&s",
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSKwjFXGNey8n88vzjitkEupNqcBm4KNWVNYw&s",
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSKwjFXGNey8n88vzjitkEupNqcBm4KNWVNYw&s"
            ],
            varian_produk: [
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSKwjFXGNey8n88vzjitkEupNqcBm4KNWVNYw&s",
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSKwjFXGNey8n88vzjitkEupNqcBm4KNWVNYw&s",
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSKwjFXGNey8n88vzjitkEupNqcBm4KNWVNYw&s"
            ],
            toko: "Cendekia Press",
            rating_toko: 4.9,
            status_toko: "Official Store",
            lokasi_toko: "Jl. Kaliurang KM 5,2 No.27, Condongcatur, Kec. Depok, Kabupaten Sleman, Daerah Istimewa Yogyakarta 55281",
            maps_link: "https://maps.app.goo.gl/6vX8kL3mP7vZfG8J7",
            rating_bintang: 4.8,
            jumlah_ulasan: 980,
            hari_operasional: "Senin - Minggu",
            jam_operasional: "07:00 - 21:00",
            ulasan: [
                {
                    nama_pengulas: "Rina S.",
                    rating: 5,
                    tanggal: "2025-10-15",
                    isi: "Pedasnya pas banget, aroma asapnya bikin nagih! Cumi lembut, cocok buat temen nasi hangat."
                },
                {
                    nama_pengulas: "Budi K.",
                    rating: 4,
                    tanggal: "2025-09-22",
                    isi: "Enak, gurihnya terasa. Tapi kemasan agak bocor sedikit saat pengiriman."
                },
                {
                    nama_pengulas: "Siti A.",
                    rating: 5,
                    tanggal: "2025-08-30",
                    isi: "Sambal terenak yang pernah saya coba! Bikin makan jadi lahap, pasti repeat order."
                }
            ]
        },
        {
            ASIN: "EDU-ID-002",
            nama_produk: "Filosofi Teras",
            merek_produk: "Filosofi Teras",
            model_produk: "SH-DG01",
            kategori: "Edukasi",
            sub_kategori: "Psikologi",
            harga_asli: 350000,
            harga_produk: 275000,
            persentase_diskon: 22,
            mata_uang: "IDR",
            jumlah_unit: 9999,
            unit_terjual: 5400,
            status_produk: "Tersedia",
            minimum_pemesanan: 1,
            kondisi_produk: "Baru",
            berat_satuan: 0.3,
            deskripsi_produk: "“Filosofi Teras” adalah buku pengantar filsafat Stoisisme modern yang ditulis oleh Henry Manampiring. Buku ini mengajarkan cara menghadapi emosi negatif, tekanan sosial, dan ketidakpastian hidup dengan sudut pandang logis dan tenang...",
            keyword: "filosofi teras, stoik, psikologi",
            gambar_produk: "https://www.static-src.com/wcsstore/Indraprastha/images/catalog/full//catalog-image/101/MTA-152358158/brd-44261_buku-filosofi-teras_full01-7172ae55.jpg",
            thumbnail_produk: "https://www.static-src.com/wcsstore/Indraprastha/images/catalog/full//catalog-image/101/MTA-152358158/brd-44261_buku-filosofi-teras_full01-7172ae55.jpg",
            galeri_gambar: [
                "https://www.static-src.com/wcsstore/Indraprastha/images/catalog/full//catalog-image/101/MTA-152358158/brd-44261_buku-filosofi-teras_full01-7172ae55.jpg",
                "https://www.static-src.com/wcsstore/Indraprastha/images/catalog/full//catalog-image/101/MTA-152358158/brd-44261_buku-filosofi-teras_full01-7172ae55.jpg",
                "https://www.static-src.com/wcsstore/Indraprastha/images/catalog/full//catalog-image/101/MTA-152358158/brd-44261_buku-filosofi-teras_full01-7172ae55.jpg"
            ],
            varian_produk: [
                "https://www.static-src.com/wcsstore/Indraprastha/images/catalog/full//catalog-image/101/MTA-152358158/brd-44261_buku-filosofi-teras_full01-7172ae55.jpg",
                "https://www.static-src.com/wcsstore/Indraprastha/images/catalog/full//catalog-image/101/MTA-152358158/brd-44261_buku-filosofi-teras_full01-7172ae55.jpg",
                "https://www.static-src.com/wcsstore/Indraprastha/images/catalog/full//catalog-image/101/MTA-152358158/brd-44261_buku-filosofi-teras_full01-7172ae55.jpg"
            ],
            toko: "Cendekia Press",
            rating_toko: 4.9,
            status_toko: "Official Store",
            lokasi_toko: "Jl. Kaliurang KM 5,2 No.27, Condongcatur, Kec. Depok, Kabupaten Sleman, Daerah Istimewa Yogyakarta 55281",
            maps_link: "https://maps.app.goo.gl/6vX8kL3mP7vZfG8J7",
            rating_bintang: 4.7,
            jumlah_ulasan: 680,
            hari_operasional: "Senin - Minggu",
            jam_operasional: "07:00 - 21:00",
            ulasan: [
                {
                    nama_pengulas: "Rina S.",
                    rating: 5,
                    tanggal: "2025-10-15",
                    isi: "Pedasnya pas banget, aroma asapnya bikin nagih! Cumi lembut, cocok buat temen nasi hangat."
                },
                {
                    nama_pengulas: "Budi K.",
                    rating: 4,
                    tanggal: "2025-09-22",
                    isi: "Enak, gurihnya terasa. Tapi kemasan agak bocor sedikit saat pengiriman."
                },
                {
                    nama_pengulas: "Siti A.",
                    rating: 5,
                    tanggal: "2025-08-30",
                    isi: "Sambal terenak yang pernah saya coba! Bikin makan jadi lahap, pasti repeat order."
                }
            ]
        },
        {
            ASIN: "EDU-ID-003",
            nama_produk: "Modul Belajar Bahasa Inggris Anak",
            merek_produk: "EduKid",
            model_produk: "EK-ENG01",
            kategori: "Edukasi",
            sub_kategori: "Modul Belajar",
            harga_asli: 120000,
            harga_produk: 89000,
            persentase_diskon: 26,
            mata_uang: "IDR",
            jumlah_unit: 400,
            unit_terjual: 1700,
            status_produk: "Tersedia",
            minimum_pemesanan: 1,
            kondisi_produk: "Baru",
            berat_satuan: 0.5,
            bahan: "Kertas Art Carton",
            warna: "Full Color",
            negara_asal: "Indonesia",
            deskripsi_produk: "Modul belajar interaktif bahasa Inggris dasar untuk anak SD. Disertai latihan kosakata, audio, dan QR code untuk video pembelajaran.",
            keyword: "belajar inggris anak, modul sd",
            gambar_produk: "https://cdn.gramedia.com/uploads/items/Sd_Mi_Kls.I_Bahasa_Inggris__Kur.Merdeka.jpg",
            thumbnail_produk: "https://cdn.gramedia.com/uploads/items/Sd_Mi_Kls.I_Bahasa_Inggris__Kur.Merdeka.jpg",
            galeri_gambar: [
                "https://cdn.gramedia.com/uploads/items/Sd_Mi_Kls.I_Bahasa_Inggris__Kur.Merdeka.jpg",
                "https://cdn.gramedia.com/uploads/items/Sd_Mi_Kls.I_Bahasa_Inggris__Kur.Merdeka.jpg",
                "https://cdn.gramedia.com/uploads/items/Sd_Mi_Kls.I_Bahasa_Inggris__Kur.Merdeka.jpg"
            ],
            varian_produk: [
                "https://cdn.gramedia.com/uploads/items/Sd_Mi_Kls.I_Bahasa_Inggris__Kur.Merdeka.jpg",
                "https://cdn.gramedia.com/uploads/items/Sd_Mi_Kls.I_Bahasa_Inggris__Kur.Merdeka.jpg",
                "https://cdn.gramedia.com/uploads/items/Sd_Mi_Kls.I_Bahasa_Inggris__Kur.Merdeka.jpg"
            ],
            toko: "Cendekia Press",
            rating_toko: 4.9,
            status_toko: "Official Store",
            lokasi_toko: "Jl. Kaliurang KM 5,2 No.27, Condongcatur, Kec. Depok, Kabupaten Sleman, Daerah Istimewa Yogyakarta 55281",
            maps_link: "https://maps.app.goo.gl/6vX8kL3mP7vZfG8J7",
            rating_bintang: 4.8,
            jumlah_ulasan: 860,
            hari_operasional: "Senin - Minggu",
            jam_operasional: "07:00 - 21:00",
            ulasan: [
                {
                    nama_pengulas: "Rina S.",
                    rating: 5,
                    tanggal: "2025-10-15",
                    isi: "Pedasnya pas banget, aroma asapnya bikin nagih! Cumi lembut, cocok buat temen nasi hangat."
                },
                {
                    nama_pengulas: "Budi K.",
                    rating: 4,
                    tanggal: "2025-09-22",
                    isi: "Enak, gurihnya terasa. Tapi kemasan agak bocor sedikit saat pengiriman."
                },
                {
                    nama_pengulas: "Siti A.",
                    rating: 5,
                    tanggal: "2025-08-30",
                    isi: "Sambal terenak yang pernah saya coba! Bikin makan jadi lahap, pasti repeat order."
                }
            ]
        },
        {
            ASIN: "EDU-ID-004",
            nama_produk: "Paket Belajar Arduino Dasar",
            merek_produk: "TeknoLab",
            model_produk: "TL-ARD01",
            kategori: "Edukasi",
            sub_kategori: "Kit Elektronik",
            harga_asli: 550000,
            harga_produk: 499000,
            persentase_diskon: 9,
            mata_uang: "IDR",
            jumlah_unit: 200,
            unit_terjual: 950,
            status_produk: "Tersedia",
            minimum_pemesanan: 1,
            kondisi_produk: "Baru",
            berat_satuan: 1.5,
            bahan: "PCB & Komponen Elektronik",
            warna: "Biru",
            negara_asal: "Indonesia",
            deskripsi_produk: "Paket lengkap untuk belajar Arduino: board, kabel, sensor, dan panduan proyek berbasis STEM. Cocok untuk pelajar dan mahasiswa teknik.",
            keyword: "arduino kit, belajar coding",
            gambar_produk: "https://down-id.img.susercontent.com/file/sg-11134201-7qvcy-lfm7bswbmljic6",
            thumbnail_produk: "https://down-id.img.susercontent.com/file/sg-11134201-7qvcy-lfm7bswbmljic6",
            galeri_gambar: [
                "https://down-id.img.susercontent.com/file/sg-11134201-7qvcy-lfm7bswbmljic6",
                "https://down-id.img.susercontent.com/file/sg-11134201-7qvcy-lfm7bswbmljic6",
                "https://down-id.img.susercontent.com/file/sg-11134201-7qvcy-lfm7bswbmljic6"
            ],
            varian_produk: [
                "https://down-id.img.susercontent.com/file/sg-11134201-7qvcy-lfm7bswbmljic6",
                "https://down-id.img.susercontent.com/file/sg-11134201-7qvcy-lfm7bswbmljic6",
                "https://down-id.img.susercontent.com/file/sg-11134201-7qvcy-lfm7bswbmljic6"
            ],
            toko: "Cendekia Press",
            rating_toko: 4.9,
            status_toko: "Official Store",
            lokasi_toko: "Jl. Kaliurang KM 5,2 No.27, Condongcatur, Kec. Depok, Kabupaten Sleman, Daerah Istimewa Yogyakarta 55281",
            maps_link: "https://maps.app.goo.gl/6vX8kL3mP7vZfG8J7",
            rating_bintang: 4.7,
            jumlah_ulasan: 410,
            hari_operasional: "Senin - Minggu",
            jam_operasional: "07:00 - 21:00",
            ulasan: [
                {
                    nama_pengulas: "Rina S.",
                    rating: 5,
                    tanggal: "2025-10-15",
                    isi: "Pedasnya pas bang hvxdet, aroma asapnya bikin nagih! Cumi lembut, cocok buat temen nasi hangat."
                },
                {
                    nama_pengulas: "Budi K.",
                    rating: 4,
                    tanggal: "2025-09-22",
                    isi: "Enak, gurihnya terasa. Tapi kemasan agak bocor sedikit saat pengiriman."
                },
                {
                    nama_pengulas: "Siti A.",
                    rating: 5,
                    tanggal: "2025-08-30",
                    isi: "Sambal terenak yang pernah saya coba! Bikin makan jadi lahap, pasti repeat order."
                }
            ]
        },
        {
            ASIN: "EDU-ID-005",
            nama_produk: "Flashcard Bahasa Indonesia",
            merek_produk: "LittleLang",
            model_produk: "LL-ID01",
            kategori: "Edukasi",
            sub_kategori: "Flashcard",
            harga_asli: 85000,
            harga_produk: 69000,
            persentase_diskon: 18,
            mata_uang: "IDR",
            jumlah_unit: 400,
            unit_terjual: 1300,
            status_produk: "Tersedia",
            minimum_pemesanan: 1,
            kondisi_produk: "Baru",
            berat_satuan: 0.4,
            bahan: "Art Carton",
            warna: "Full Color",
            negara_asal: "Indonesia",
            deskripsi_produk: "Flashcard edukatif dengan gambar dan kata dalam Bahasa Indonesia. Cocok untuk anak prasekolah untuk memperluas kosa kata.",
            keyword: "flashcard anak, belajar bahasa",
            gambar_produk: "https://www.static-src.com/wcsstore/Indraprastha/images/catalog/full/catalog-image/90/MTA-155204126/tentang-anak_tentang-anak_full01.jpg",
            thumbnail_produk: "https://www.static-src.com/wcsstore/Indraprastha/images/catalog/full/catalog-image/90/MTA-155204126/tentang-anak_tentang-anak_full01.jpg",
            galeri_gambar: [
                "https://www.static-src.com/wcsstore/Indraprastha/images/catalog/full/catalog-image/90/MTA-155204126/tentang-anak_tentang-anak_full01.jpg",
                "https://www.static-src.com/wcsstore/Indraprastha/images/catalog/full/catalog-image/90/MTA-155204126/tentang-anak_tentang-anak_full01.jpg",
                "https://www.static-src.com/wcsstore/Indraprastha/images/catalog/full/catalog-image/90/MTA-155204126/tentang-anak_tentang-anak_full01.jpg",
            ],
            varian_produk: [
                "https://www.static-src.com/wcsstore/Indraprastha/images/catalog/full/catalog-image/90/MTA-155204126/tentang-anak_tentang-anak_full01.jpg",
                "https://www.static-src.com/wcsstore/Indraprastha/images/catalog/full/catalog-image/90/MTA-155204126/tentang-anak_tentang-anak_full01.jpg",
                "https://www.static-src.com/wcsstore/Indraprastha/images/catalog/full/catalog-image/90/MTA-155204126/tentang-anak_tentang-anak_full01.jpg",
            ],
            toko: "Cendekia Press",
            rating_toko: 4.9,
            status_toko: "Official Store",
            lokasi_toko: "Jl. Kaliurang KM 5,2 No.27, Condongcatur, Kec. Depok, Kabupaten Sleman, Daerah Istimewa Yogyakarta 55281",
            maps_link: "https://maps.app.goo.gl/6vX8kL3mP7vZfG8J7",
            rating_bintang: 4.7,
            jumlah_ulasan: 420,
            hari_operasional: "Senin - Minggu",
            jam_operasional: "07:00 - 21:00",
            ulasan: [
                {
                    nama_pengulas: "Rina S.",
                    rating: 5,
                    tanggal: "2025-10-15",
                    isi: "Pedasnya pas banget, aroma asapnya bikin nagih! Cumi lembut, cocok buat temen nasi hangat."
                },
                {
                    nama_pengulas: "Budi K.",
                    rating: 4,
                    tanggal: "2025-09-22",
                    isi: "Enak, gurihnya terasa. Tapi kemasan agak bocor sedikit saat pengiriman."
                },
                {
                    nama_pengulas: "Siti A.",
                    rating: 5,
                    tanggal: "2025-08-30",
                    isi: "Sambal terenak yang pernah saya coba! Bikin makan jadi lahap, pasti repeat order."
                }
            ]
        },
    ];
    const productsWithUpload = products.map((p, idx) => {
        // Base tanggal maksimum: 13 Nov 2025
        const maxDate = new Date("2025-11-13T00:00:00Z");
        const d = new Date(maxDate);
        // Geser mundur per index agar unik per produk dan tetap di 2025
        d.setDate(maxDate.getDate() - idx);
        // Clamp ke 2025-01-01 jika melewati awal tahun
        const minDate = new Date("2025-01-01T00:00:00Z");
        if (d < minDate) {
            // Jika produk lebih banyak dari jumlah hari, gunakan siklus dari awal tahun, tetap unik bulan-tanggal selama stok hari mencukupi
            const dayOfYear = (idx % ((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24) + 1)) | 0;
            d.setTime(minDate.getTime());
            d.setDate(minDate.getDate() + dayOfYear);
        }
        // Hapus kondisi_produk, nolkan diskon, samakan harga_produk dengan harga_asli
        const { kondisi_produk, persentase_diskon, harga_produk, harga_asli, ...rest } = p;
        // Variasi tag dari Firestore
        const tagOptions = [
            "Gratis Ongkir",
            "Voucher Gede",
            "Cashback",
            "COD",
            "Garansi",
            "Official Store",
        ];
        // Tentukan apakah produk ini didiskon (balanced: kira-kira separuh)
        const alreadyDiscounted = typeof rest.persentase_diskon === 'number' && rest.persentase_diskon > 0;
        const shouldDiscount = alreadyDiscounted || (idx % 2 === 0);
        // Tentukan persentase diskon
        const discountCandidates = [10, 12, 15, 18, 20, 25, 30];
        const chosenDiscount = alreadyDiscounted
            ? Math.max(1, Math.round(Number(rest.persentase_diskon)))
            : (shouldDiscount ? discountCandidates[idx % discountCandidates.length] : 0);
        // Hitung harga setelah diskon jika ada
        const hargaSesudahDiskon = chosenDiscount > 0
            ? Math.max(100, Math.round(harga_asli * (1 - chosenDiscount / 100)))
            : harga_asli;
        // Siapkan tags; jika diskon, tambahkan tag Diskon di depan
        const baseTags = [
            tagOptions[idx % tagOptions.length],
            tagOptions[(idx + 1) % tagOptions.length],
        ];
        const tags = chosenDiscount > 0
            ? ([`Diskon ${chosenDiscount}%`, ...baseTags])
            : baseTags;
        // Nilai favorit/likes dan interaksi deterministik per index
        const likes = 30 + ((idx * 97) % 970); // 30..999
        const interactions = 120 + ((idx * 53) % 3800); // 120..3919
        // Ulasan dinamis 10+ per produk dengan variasi nilai
        const namaSample = [
            "Aulia", "Budi", "Citra", "Dimas", "Eka", "Fajar", "Gita", "Hadi", "Indah", "Joko",
            "Kirana", "Lukman", "Maya", "Nadia", "Oki", "Putri", "Rizky", "Sari", "Tio", "Yuni"
        ];
        const komentarKategori = {
            "Kuliner": [
                "Rasanya mantap, bumbunya meresap.",
                "Porsinya pas, cocok untuk lauk harian.",
                "Kemasan rapi, sampai dalam keadaan baik.",
                "Pedasnya pas, bikin nagih!",
                "Aromanya wangi, kualitas terjaga.",
            ],
            "Fashion": [
                "Jahitannya rapi, bahan nyaman dipakai.",
                "Modelnya elegan, cocok untuk acara formal.",
                "Ukuran pas sesuai chart.",
                "Warna sesuai foto, tidak luntur.",
                "Kualitas premium dengan harga bersahabat.",
            ],
            "Kerajinan": [
                "Detail kerajinannya halus dan rapi.",
                "Cocok untuk dekorasi rumah, kesan hangat.",
                "Material kuat dan finishing bagus.",
                "Desain unik, worth it.",
                "Sesuai ekspektasi, pengemasan aman.",
            ],
            "Kesehatan": [
                "Efektif, cocok untuk kebutuhan harian.",
                "Expired masih lama, aman dipakai.",
                "Kualitas terjamin, original.",
                "Bermanfaat dan harganya terjangkau.",
                "Pengiriman cepat, barang aman.",
            ],
            "Pendidikan": [
                "Kontennya membantu belajar anak.",
                "Cetakannya jelas dan warna menarik.",
                "Materi mudah dipahami.",
                "Sangat direkomendasikan untuk latihan.",
                "Packaging rapi dan aman.",
            ],
        };
        const pilihKomentar = (kategori, i) => {
            const list = komentarKategori[kategori] || ["Bagus dan bermanfaat."];
            return list[i % list.length];
        };
        const buatUlasan = (produkKategori) => {
            const arr = [];
            const baseDate = new Date("2025-11-10T00:00:00Z");
            const total = 12; // 10+ ulasan
            for (let i = 0; i < total; i++) {
                const nama = namaSample[(idx * 7 + i) % namaSample.length];
                const rating = 3 + ((idx + i) % 3) + (i % 2 === 0 ? 0.5 : 0); // 3..5 dengan variasi 0.5
                const tgl = new Date(baseDate);
                tgl.setDate(baseDate.getDate() - (idx + i));
                arr.push({
                    id: `${p.ASIN}-R${i + 1}`,
                    nama,
                    rating: Number(rating.toFixed(1)),
                    komentar: pilihKomentar(produkKategori, i),
                    tanggal: tgl.toISOString().slice(0, 10),
                    helpful: (i * 13 + idx * 5) % 57,
                });
            }
            return arr;
        };
        const avgRating = (list) => {
            if (!list.length)
                return 0;
            const sum = list.reduce((acc, r) => acc + (typeof r.rating === 'number' ? r.rating : 0), 0);
            return Number((sum / list.length).toFixed(1));
        };
        const reviews = buatUlasan(rest.kategori || "Umum");
        const unitTerjual = typeof rest.unit_terjual === 'number'
            ? rest.unit_terjual
            : (300 + ((idx * 41) % 1700)); // bervariasi per produk
        return {
            ...rest,
            harga_asli,
            harga_produk: hargaSesudahDiskon,
            persentase_diskon: chosenDiscount,
            upload_at: d.toISOString().slice(0, 10), // YYYY-MM-DD dalam 2025 dan <= 2025-11-13
            tags,
            // metrik favorit/keterlibatan
            likes,
            favorites: likes,
            hearts: likes,
            interactions,
            // 10+ ulasan per produk, beragam
            ulasan: reviews,
            jumlah_ulasan: reviews.length,
            unit_terjual: unitTerjual,
            rating_bintang: typeof rest.rating_bintang === 'number' ? rest.rating_bintang : avgRating(reviews),
        };
    });
    await uploadProducts(productsWithUpload);
    // Cek semua produk setelah upload
    let all = await getAllProducts();
    console.log("📦 Produk setelah upload:");
    console.table(all);
    // Update satu produk
    // if (all.length > 0) {
    //   await updateProduct(all[0].id, {
    //     nama_produk: "Shampo Herbal Premium",
    //     harga_produk: 59900,
    //     jumlah_unit: 50,
    //   });
    // }
    // BulkUpdate (buat update pake mapping)
    // if (all.length >= 2) {
    //   await bulkUpdateProducts([
    //     { id: all[0].id, data: { persentase_diskon: 10, harga_produk: 54900 } },
    //     { id: all[1].id, data: { status_produk: "Habis", unit_terjual: 2000 } },
    //   ]);
    // }
    // Hapus satu produk
    // if (all.length > 0) {
    //   await deleteProduct(all[0].id);
    //   console.log(`🗑️ Produk ${all[0].nama_produk} berhasil dihapus`);
    // }
    // hapus semua produk
    // await deleteAllProducts();
    // console.log("🧹 Semua produk berhasil dihapus");
    // Cek hasi akhir
    // const final = await getAllProducts();
    // console.table(final);
}
seedProduk()
    .then(() => console.log("🌱 Selesai seeding"))
    .catch((err) => console.error("❌ Gagal seeding:", err));
