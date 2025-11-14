import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Increment favorit count di Firestore untuk produk tertentu
 * @param productId - ASIN/ID produk
 * @param delta - +1 untuk tambah, -1 untuk kurang
 */
export async function updateProductFavorites(productId: string, delta: number = 1): Promise<void> {
  try {
    const productRef = doc(db, 'products', productId);
    await updateDoc(productRef, {
      likes: increment(delta),
      favorites: increment(delta),
      hearts: increment(delta),
      interactions: increment(Math.abs(delta)) // selalu positif untuk interaksi
    });
    console.log(`✅ Favorit produk ${productId} berhasil diupdate (${delta > 0 ? '+' : ''}${delta})`);
  } catch (error) {
    console.error('❌ Gagal update favorit produk:', error);
    // Jangan throw error agar UX tetap lancar meski Firestore gagal
  }
}
