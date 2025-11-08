import { db } from "./firebase.js";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

const COLLECTION_NAME = "products";

// Ambil ID berikutnya (autoincrement dari 000)
const getNextProductId = async () => {
  const snapshot = await getDocs(collection(db, COLLECTION_NAME));

  const ids = snapshot.docs
    .map((doc) => parseInt(doc.id))
    .filter((n) => !isNaN(n))
    .sort((a, b) => a - b);

  const next = ids.length > 0 ? Math.max(...ids) + 1 : 0;

  return next.toString().padStart(3, "0");
};

// Tambah satu produk
export const addProduct = async (product: Product) => {
  const nextId = await getNextProductId();
  await setDoc(doc(db, COLLECTION_NAME, nextId), product);
  console.log(`✅ Produk disimpan (${product.nama_produk}) dengan ID ${nextId}`);
};

// Upload banyak produk (skip kalo ASIN udah ada)
export const uploadProducts = async (products: Product[]) => {
  const existing = (await getAllProducts()) as (Product & { id: string })[];
  const existingAsins = new Set(existing.map((p) => p.ASIN));

  for (const p of products) {
    if (existingAsins.has(p.ASIN)) {
      console.log(`⚠️ Skip: produk dengan ASIN ${p.ASIN} sudah ada (${p.nama_produk})`);
      continue;
    }

    const nextId = await getNextProductId();
    await setDoc(doc(db, COLLECTION_NAME, nextId), p);
    console.log(`🆕 Upload produk baru: ${p.nama_produk} → ID ${nextId}`);
  }

  console.log("📦 Upload selesai — hanya produk baru yang ditambahkan.");
};

// Ambil semua produk
export const getAllProducts = async () => {
  const snapshot = await getDocs(collection(db, COLLECTION_NAME));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// Update produk
export const updateProduct = async (id: string, updatedData: Partial<Product>) => {
  const ref = doc(db, COLLECTION_NAME, id);
  await updateDoc(ref, updatedData);
  console.log(`✏️ Produk ${id} berhasil diupdate`);
};

// Bulk update (update pake mapping)
export const bulkUpdateProducts = async (updates: { id: string; data: Partial<Product> }[]) => {
  for (const { id, data } of updates) {
    await updateProduct(id, data);
  }
  console.log("🧩 Bulk update selesai!");
};

// Hapus satu produk
export const deleteProduct = async (id: string) => {
  const ref = doc(db, COLLECTION_NAME, id);
  await deleteDoc(ref);
  console.log(`🗑️ Produk ${id} berhasil dihapus`);
};

// Hapus semua produk
export const deleteAllProducts = async () => {
  const snapshot = await getDocs(collection(db, COLLECTION_NAME));
  for (const d of snapshot.docs) {
    await deleteDoc(doc(db, COLLECTION_NAME, d.id));
  }
  console.log("🧹 Semua produk dihapus dari Firestore");
};

// Type buat produk
export type Product = {
  // Identitas Produk
  ASIN: string;
  nama_produk: string;
  merek_produk: string;
  model_produk: string;
  kategori: string;
  sub_kategori: string;

  // Harga & Promo
  harga_asli: number | null;
  harga_produk: number;
  persentase_diskon: number | null;
  mata_uang: string;

  // Stok & Penjualan
  jumlah_unit: number;
  unit_terjual: number;
  status_produk: "Tersedia" | "Habis" | "Pre-order";
  minimum_pemesanan: number;
  kondisi_produk: "Baru" | "Bekas" | "Refurbished";

  // Spesifikasi Produk
  berat_satuan: number;
  dimensi_produk?: string;
  bahan?: string;
  warna?: string;
  varian_produk?: string;
  negara_asal?: string;
  spesifikasi?: string;

  // Deskripsi & Konten
  deskripsi_produk: string;
  keyword?: string;

  // Media Produk
  gambar_produk: string;
  thumbnail_produk: string;
  galeri_gambar?: string[];
  video_produk?: string;

  // Informasi Toko
  toko: string;
  telepon_toko?: number;
  jam_operasional?: string;
  kategori_toko?: string;
  rating_toko: number | null;
  status_toko: "Official Store" | "Toko Biasa";
  lokasi_toko: string;
  maps_link: string;
  jumlah_produk_di_toko?: number;

  // Ulasan & Rating
  rating_bintang: number | null;
  jumlah_ulasan: number;
  komentar?: string[];
  foto_pembeli?: string[];

};
