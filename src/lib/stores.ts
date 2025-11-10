import { db } from './firebase.js';
import { collection, addDoc, doc, getDoc, getDocs, query, where, setDoc, updateDoc } from 'firebase/firestore';

export const STORES_COLLECTION = 'stores';

export type Store = {
  name: string;
  image?: string;
  banner?: string;
  category?: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  profileImage?: string;
  openHours?: string;
  openDays?: string;
  rating?: number;
  reviewCount?: number;
  mapsLink?: string;
  facilities?: string[];
  paymentMethods?: string[];
  social?: { instagram?: string; facebook?: string; whatsapp?: string };
  createdAt?: number;
  updatedAt?: number;
};

export async function upsertStoreByName(name: string, data: Partial<Store> = {}): Promise<{ id: string; data: Store }>{
  const q = query(collection(db, STORES_COLLECTION), where('name', '==', name));
  const snap = await getDocs(q);
  const now = Date.now();
  if (!snap.empty) {
    const d = snap.docs[0];
    const ref = doc(db, STORES_COLLECTION, d.id);
    await updateDoc(ref, { ...data, name, updatedAt: now });
    const newDoc = await getDoc(ref);
    return { id: d.id, data: newDoc.data() as Store };
  }

  const ref = await addDoc(collection(db, STORES_COLLECTION), { name, ...data, createdAt: now, updatedAt: now });
  const newDoc = await getDoc(ref);
  return { id: ref.id, data: newDoc.data() as Store };
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
