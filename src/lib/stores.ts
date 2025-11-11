import { db } from './firebase.js';
import { collection, addDoc, doc, getDoc, getDocs, query, where, setDoc, updateDoc, Timestamp, serverTimestamp } from 'firebase/firestore';

export const STORES_COLLECTION = 'stores';

export type Store = {
  nama_toko: string;
  image?: string;
  banner?: string;
  kategori?: string;
  deskripsi_toko?: string;
  lokasi_toko?: string;
  no_telp?: string;
  email?: string;
  profileImage?: string;
  jam_operasional: string;
  hari_operasional: string;
  rating_toko?: number;
  jumlah_review?: number;
  maps_link?: string;
  fasilitas?: string[];
  metode_pembayaran?: string[];
  social?: { instagram?: string; facebook?: string; whatsapp?: string };
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

export async function upsertStoreByName(
  name: string,
  data: Partial<Store> = {}
): Promise<{ id: string; data: Store }> {
  const q = query(collection(db, STORES_COLLECTION), where('nama_toko', '==', name));
  const snap = await getDocs(q);

  if (!snap.empty) {
    const d = snap.docs[0];
    const ref = doc(db, STORES_COLLECTION, d.id);

    // updateeeee
    await updateDoc(ref, {
      ...data,
      nama_toko: name,
      updatedAt: serverTimestamp(),
    });

    const newDoc = await getDoc(ref);
    return { id: d.id, data: newDoc.data() as Store };
  }

  // Insert baru
  const ref = await addDoc(collection(db, STORES_COLLECTION), {
    nama_toko: name,
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const newDoc = await getDoc(ref);
  return { id: ref.id, data: newDoc.data() as Store };
}

export function formatWIB(timestamp?: Timestamp): string {
  if (!timestamp) return 'Belum dibuat';
  const date = timestamp.toDate();
  return date.toLocaleString('id-ID', {
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



// Helper: upsert multiple stores using their name as natural key
export async function upsertStoresByName(items: Array<Partial<Store> & { name: string }>): Promise<Array<{ id: string; data: Store }>>{
  const results: Array<{ id: string; data: Store }> = [];
  for (const s of items) {
    const r = await upsertStoreByName(s.name, s);
    results.push(r);
  }
  return results;
}

export async function getStoreById(id: string){
  const ref = doc(db, STORES_COLLECTION, id);
  const snap = await getDoc(ref);
  return snap.exists() ? { id, ...(snap.data() as Store) } : null;
}

export async function listStores(){
  const snap = await getDocs(collection(db, STORES_COLLECTION));
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as Store) }));
}
