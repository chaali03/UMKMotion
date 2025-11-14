// lib/stores.ts
import { db } from './firebase.js';
import { collection, addDoc, doc, getDoc, getDocs, query, where, setDoc, serverTimestamp, writeBatch, } from 'firebase/firestore';
// Normalisasi nama
const normalizeName = (name) => name.trim().toLowerCase();
// === UPSERT BY NAME (CASE-INSENSITIVE) ===
export async function upsertStoreByName(originalName, data = {}) {
    const normalized = normalizeName(originalName);
    const q = query(collection(db, STORES_COLLECTION), where('nama_toko_normalized', '==', normalized));
    const snap = await getDocs(q);
    const now = serverTimestamp();
    if (!snap.empty) {
        const d = snap.docs[0];
        const ref = doc(db, STORES_COLLECTION, d.id);
        const existing = d.data();
        const nameChanged = existing.nama_toko !== originalName;
        const updateData = { ...data, updatedAt: now };
        if (nameChanged) {
            updateData.nama_toko = originalName;
            updateData.nama_toko_normalized = normalized;
        }
        await setDoc(ref, updateData, { merge: true });
        const newDoc = await getDoc(ref);
        const raw = newDoc.data();
        if (!raw)
            throw new Error('Gagal baca data');
        return { id: d.id, data: raw };
    }
    const ref = await addDoc(collection(db, STORES_COLLECTION), {
        nama_toko: originalName,
        nama_toko_normalized: normalized,
        ...data,
        createdAt: now,
        updatedAt: now,
    });
    const newDoc = await getDoc(ref);
    const raw = newDoc.data();
    if (!raw)
        throw new Error('Gagal baca data');
    return { id: ref.id, data: raw };
}
// === UPSERT BANYAK ===
export async function upsertStoresByName(items) {
    const results = [];
    for (const s of items) {
        results.push(await upsertStoreByName(s.nama_toko, s));
    }
    return results;
}
// === HAPUS BERDASARKAN NAMA ===
export async function deleteStoreByName(name) {
    const normalized = normalizeName(name);
    const q = query(collection(db, STORES_COLLECTION), where('nama_toko_normalized', '==', normalized));
    const snap = await getDocs(q);
    if (snap.empty)
        return;
    const batch = writeBatch(db);
    snap.docs.forEach(d => batch.delete(d.ref));
    await batch.commit();
    console.log(`[DELETE] Toko "${name}" berhasil dihapus`);
}
// === HAPUS SEMUA ===
export async function deleteAllStores() {
    const snap = await getDocs(collection(db, STORES_COLLECTION));
    if (snap.empty)
        return console.log('[DELETE] Collection kosong');
    const batch = writeBatch(db);
    snap.docs.forEach(d => batch.delete(d.ref));
    await batch.commit();
    console.log(`[DELETE] Berhasil hapus ${snap.size} toko`);
}
// === LIST SEMUA ===
export async function listStores() {
    const snap = await getDocs(collection(db, STORES_COLLECTION));
    return snap.docs.map(d => ({ id: d.id, data: d.data() }));
}
// === FORMAT WIB ===
export function formatWIB(timestamp) {
    if (!timestamp)
        return 'Belum dibuat';
    return timestamp.toDate().toLocaleString('id-ID', {
        timeZone: 'Asia/Jakarta',
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
}
// === CONVERT KE CLIENT ===
export function toClientStore(store) {
    const { nama_toko_normalized, ...rest } = store;
    return {
        ...rest,
        reviews: store.reviews,
        createdAt: store.createdAt?.toMillis(),
        updatedAt: store.updatedAt?.toMillis(),
    };
}
// === LIST DENGAN WIB ===
export async function listStoresWithWIB() {
    const stores = await listStores();
    return stores.map(({ data }) => {
        const client = toClientStore(data);
        console.log(`- ${client.nama_toko}`);
        console.log(`  Dibuat: ${formatWIB(data.createdAt)}`);
        console.log(`  Update: ${formatWIB(data.updatedAt)}`);
        if (client.reviews?.length) {
            console.log(`  Reviews: ${client.reviews.length} ulasan`);
        }
        console.log('---');
        return client;
    });
}
export const STORES_COLLECTION = 'stores';
