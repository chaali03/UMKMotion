export interface StoreData {
  name: string;
  address: string;
  mapsLink: string;
  rating: number;
  status: string;
  openDays: string;
  openHours: string;
  image?: string;
  profileImage?: string;
  phone?: string;
  email?: string;
  description?: string;
  facilities?: string[];
  paymentMethods?: string[];
}

// Daftar toko dengan nama persis seperti di src/produkdata/produkdata.ts
export const stores: StoreData[] = [
  {
    name: "Nusantara Rasa",
    address: "Jl. Raya Darmo Permai III No.17, Pradahkalindungan, Kec. Dukuhpakis, Kota Surabaya, Jawa Timur 60226",
    mapsLink: "https://maps.app.goo.gl/8vN9vL3kP9bZfG8J7",
    rating: 4.9,
    status: "Official Store",
    openDays: "Senin - Minggu",
    openHours: "07:00 - 22:00",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&auto=format&fit=crop&q=60",
    profileImage: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=60",
    phone: "+62 31 5678 9012",
    email: "hello@nusantararasa.id",
    description: "Nusantara Rasa menyediakan berbagai produk makanan dan minuman khas Nusantara dengan kualitas terbaik. Kami berkomitmen menghadirkan cita rasa autentik Indonesia untuk keluarga Indonesia.",
    paymentMethods: ["Cash", "Debit Card", "Credit Card", "E-Wallet", "QRIS", "Transfer Bank"]
  },
  {
    name: "Kain Nusantara",
    address: "Jl. Kauman No.25, Kauman, Kec. Pekalongan Timur, Kota Pekalongan, Jawa Tengah 51122",
    mapsLink: "https://maps.app.goo.gl/3kL9mP7vX2fZ9k8J6",
    rating: 4.9,
    status: "Official Store",
    openDays: "Senin - Sabtu",
    openHours: "08:00 - 17:00",
    image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=1200&auto=format&fit=crop&q=60",
    profileImage: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=400&auto=format&fit=crop&q=60",
    phone: "+62 285 4321 567",
    email: "hello@kainnusantara.id",
    description: "Pusat kain batik dan tekstil tradisional Indonesia. Kain Nusantara menawarkan berbagai koleksi batik tulis, batik cap, dan kain tenun dari berbagai daerah di Indonesia dengan motif dan kualitas terbaik.",
    paymentMethods: ["Cash", "Transfer Bank", "E-Wallet", "QRIS", "Credit Card"]
  },
  {
    name: "Karya Nusantara",
    address: "Jl. Imogiri Timur No.123, Giwangan, Kec. Umbulharjo, Kota Yogyakarta, Daerah Istimewa Yogyakarta 55163",
    mapsLink: "https://maps.app.goo.gl/9vX8kL3mP7vZfG8J7",
    rating: 4.9,
    status: "Official Store",
    openDays: "Senin - Minggu",
    openHours: "09:00 - 21:00",
    image: "https://images.unsplash.com/photo-1582639590011-f5a8416d1101?w=1200&auto=format&fit=crop&q=60",
    profileImage: "https://images.unsplash.com/photo-1582639590011-f5a8416d1101?w=400&auto=format&fit=crop&q=60",
    phone: "+62 274 8901 234",
    email: "hello@karyanusantara.id",
    description: "Galeri dan toko kerajinan tangan Indonesia. Karya Nusantara menghadirkan berbagai produk kerajinan berkualitas seperti anyaman, ukiran kayu, keramik, dan suvenir khas Nusantara yang dibuat oleh pengrajin lokal terpilih.",
    paymentMethods: ["Cash", "Debit Card", "Credit Card", "E-Wallet", "QRIS", "Transfer Bank"]
  },
  {
    name: "Apotek Sehat Nusantara",
    address: "Jl. Raya Pondok Gede No.27, Jatimakmur, Kec. Pondok Gede, Kota Bekasi, Jawa Barat 17413",
    mapsLink: "https://maps.app.goo.gl/2mK9vL3kP7bZfG8J7",
    rating: 4.9,
    status: "Official Store",
    openDays: "Senin - Minggu",
    openHours: "07:00 - 23:00",
    image: "https://images.unsplash.com/photo-1576602976047-174e57a47881?w=1200&auto=format&fit=crop&q=60",
    profileImage: "https://images.unsplash.com/photo-1576602976047-174e57a47881?w=400&auto=format&fit=crop&q=60",
    phone: "+62 21 8456 7890",
    email: "support@apoteksehatnusantara.id",
    description: "Apotek terpercaya dengan pelayanan farmasi profesional 24 jam. Menyediakan obat-obatan, vitamin, suplemen, alat kesehatan, dan produk kesehatan lainnya dengan harga terjangkau dan kualitas terjamin.",
    paymentMethods: ["Cash", "Debit Card", "Credit Card", "E-Wallet", "QRIS", "Transfer Bank", "BPJS"]
  },
  {
    name: "Tani Makmur Indonesia",
    address: "Jl. Raya Tlogomas No.56, Lowokwaru, Kec. Lowokwaru, Kota Malang, Jawa Timur 65144",
    mapsLink: "https://maps.app.goo.gl/5vN9vL3kP9bZfG8J7",
    rating: 4.9,
    status: "Official Store",
    openDays: "Senin - Sabtu",
    openHours: "07:00 - 18:00",
    image: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1200&auto=format&fit=crop&q=60",
    profileImage: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&auto=format&fit=crop&q=60",
    phone: "+62 341 5678 901",
    email: "support@tanimakmur.id",
    description: "Toko pertanian terlengkap yang menyediakan bibit unggul, pupuk organik dan anorganik, pestisida, alat pertanian modern, dan perlengkapan berkebun. Melayani petani dan penggemar urban farming dengan konsultasi gratis.",
    paymentMethods: ["Cash", "Transfer Bank", "E-Wallet", "QRIS", "Kredit Pertanian"]
  },
  {
    name: "Gadget Nusantara",
    address: "Jl. Pluit Karang Ayu No.B1, Pluit, Kec. Penjaringan, Kota Jakarta Utara, Daerah Khusus Ibukota Jakarta 14450",
    mapsLink: "https://maps.app.goo.gl/7kL9mP7vX2fZ9k8J6",
    rating: 4.9,
    status: "Official Store",
    openDays: "Senin - Minggu",
    openHours: "07:00 - 22:00",
    image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1200&auto=format&fit=crop&q=60",
    profileImage: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&auto=format&fit=crop&q=60",
    phone: "+62 21 6789 0123",
    email: "support@gadgetnusantara.id",
    description: "Official store gadget dan elektronik terlengkap. Menyediakan smartphone, laptop, tablet, smartwatch, accessories, dan berbagai produk teknologi terkini dari brand ternama dengan garansi resmi dan harga kompetitif.",
    paymentMethods: ["Cash", "Debit Card", "Credit Card", "E-Wallet", "QRIS", "Transfer Bank", "Cicilan 0%"]
  },
  {
    name: "Mebel Nusantara",
    address: "Jl. Raya Tahunan Jepara No.88, Tahunan, Kec. Tahunan, Kabupaten Jepara, Jawa Tengah 59425",
    mapsLink: "https://maps.app.goo.gl/4kL9mP7vX2fZ9k8J6",
    rating: 4.9,
    status: "Official Store",
    openDays: "Senin - Sabtu",
    openHours: "07:00 - 19:00",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&auto=format&fit=crop&q=60",
    profileImage: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&auto=format&fit=crop&q=60",
    phone: "+62 291 3456 789",
    email: "support@mebelnusantara.id",
    description: "Produsen dan penjual furniture berkualitas tinggi khas Jepara. Mebel Nusantara menawarkan berbagai produk furniture kayu jati seperti kursi, meja, lemari, tempat tidur, dan custom furniture dengan ukiran detail dan finishing premium.",
    paymentMethods: ["Cash", "Transfer Bank", "Credit Card", "Cicilan", "DP System"]
  },
  {
    name: "Cendekia Press",
    address: "Jl. Kaliurang KM 5,2 No.27, Condongcatur, Kec. Depok, Kabupaten Sleman, Daerah Istimewa Yogyakarta 55281",
    mapsLink: "https://maps.app.goo.gl/6vX8kL3mP7vZfG8J7",
    rating: 4.9,
    status: "Official Store",
    openDays: "Senin - Minggu",
    openHours: "07:00 - 21:00",
    image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&auto=format&fit=crop&q=60",
    profileImage: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&auto=format&fit=crop&q=60",
    phone: "+62 274 5678 123",
    email: "hello@cendekiapress.id",
    description: "Penerbit dan toko buku terpercaya yang menyediakan berbagai koleksi buku pelajaran, buku referensi, novel, komik, dan alat tulis. Juga melayani jasa percetakan untuk buku, majalah, brosur, dan berbagai kebutuhan cetak lainnya.",
    paymentMethods: ["Cash", "Debit Card", "Credit Card", "E-Wallet", "QRIS", "Transfer Bank"]
  }
];

export const storesByName: Record<string, StoreData> = Object.fromEntries(
  stores.map((s) => [s.name, s])
);