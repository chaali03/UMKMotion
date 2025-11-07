import { db } from "./firebase.js";
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc, } from "firebase/firestore";
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
export const addProduct = async (product) => {
    const nextId = await getNextProductId();
    await setDoc(doc(db, COLLECTION_NAME, nextId), product);
    console.log(`✅ Produk disimpan (${product.nama_produk}) dengan ID ${nextId}`);
};
// Upload banyak produk (skip kalo ASIN udah ada)
export const uploadProducts = async (products) => {
    const existing = (await getAllProducts());
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
export const updateProduct = async (id, updatedData) => {
    const ref = doc(db, COLLECTION_NAME, id);
    await updateDoc(ref, updatedData);
    console.log(`✏️ Produk ${id} berhasil diupdate`);
};
// Bulk update
export const bulkUpdateProducts = async (updates) => {
    for (const { id, data } of updates) {
        await updateProduct(id, data);
    }
    console.log("🧩 Bulk update selesai!");
};
// Hapus satu produk
export const deleteProduct = async (id) => {
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
