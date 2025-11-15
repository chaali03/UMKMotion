// Activity Tracker - Track user activities for history
import { db, auth } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export interface Activity {
  type: 'product_view' | 'visit' | 'consult_chat' | 'purchase' | 'review';
  title?: string;
  store?: string;
  storeId?: string;
  productASIN?: string;
  productName?: string;
  category?: string;
  image?: string;
  consultantId?: number;
  consultantName?: string;
  createdAt?: Date;
}

// Track product view
export async function trackProductView(product: {
  ASIN: string;
  nama_produk: string;
  gambar_produk?: string;
  thumbnail_produk?: string;
  kategori?: string;
  toko?: string;
}, userId?: string | null) {
  try {
    const uid = userId || (auth?.currentUser?.uid);
    if (!uid) {
      // Still save to localStorage for later sync
      const activity: Activity = {
        type: 'product_view',
        title: product.nama_produk,
        productASIN: product.ASIN,
        productName: product.nama_produk,
        category: product.kategori,
        image: product.gambar_produk || product.thumbnail_produk,
        store: product.toko,
        createdAt: new Date()
      };
      saveActivityToLocal(activity);
      return;
    }

    const activity: Activity = {
      type: 'product_view',
      title: product.nama_produk,
      productASIN: product.ASIN,
      productName: product.nama_produk,
      category: product.kategori,
      image: product.gambar_produk || product.thumbnail_produk,
      store: product.toko,
      createdAt: new Date()
    };

    // Save to localStorage
    saveActivityToLocal(activity);

    // Save to Firestore if user is logged in
    if (db && uid) {
      try {
        await addDoc(collection(db, 'users', uid, 'activities'), {
          ...activity,
          createdAt: serverTimestamp()
        });
      } catch (e) {
        console.warn('Failed to save activity to Firestore:', e);
      }
    }
  } catch (error) {
    console.warn('Failed to track product view:', error);
  }
}

// Track UMKM visit
export async function trackUMKMVisit(store: {
  id: string;
  nama_toko: string;
  image?: string;
  profileImage?: string;
  kategori?: string;
}, userId?: string | null) {
  try {
    const uid = userId || (auth?.currentUser?.uid);
    if (!uid) {
      const activity: Activity = {
        type: 'visit',
        title: `Kunjungi ${store.nama_toko}`,
        store: store.nama_toko,
        storeId: store.id,
        category: store.kategori,
        image: store.image || store.profileImage,
        createdAt: new Date()
      };
      saveActivityToLocal(activity);
      return;
    }

    const activity: Activity = {
      type: 'visit',
      title: `Kunjungi ${store.nama_toko}`,
      store: store.nama_toko,
      storeId: store.id,
      category: store.kategori,
      image: store.image || store.profileImage,
      createdAt: new Date()
    };

    saveActivityToLocal(activity);

    if (db && uid) {
      try {
        await addDoc(collection(db, 'users', uid, 'activities'), {
          ...activity,
          createdAt: serverTimestamp()
        });
      } catch (e) {
        console.warn('Failed to save activity to Firestore:', e);
      }
    }
  } catch (error) {
    console.warn('Failed to track UMKM visit:', error);
  }
}

// Track consultant chat
export async function trackConsultantChat(consultant: {
  id: number;
  name: string;
  avatar?: string;
}, userId?: string | null) {
  try {
    const uid = userId || (auth?.currentUser?.uid);
    if (!uid) {
      const activity: Activity = {
        type: 'consult_chat',
        title: `Chat dengan ${consultant.name}`,
        consultantId: consultant.id,
        consultantName: consultant.name,
        image: consultant.avatar,
        createdAt: new Date()
      };
      saveActivityToLocal(activity);
      return;
    }

    const activity: Activity = {
      type: 'consult_chat',
      title: `Chat dengan ${consultant.name}`,
      consultantId: consultant.id,
      consultantName: consultant.name,
      image: consultant.avatar,
      createdAt: new Date()
    };

    saveActivityToLocal(activity);

    if (db && uid) {
      try {
        await addDoc(collection(db, 'users', uid, 'activities'), {
          ...activity,
          createdAt: serverTimestamp()
        });
      } catch (e) {
        console.warn('Failed to save activity to Firestore:', e);
      }
    }
  } catch (error) {
    console.warn('Failed to track consultant chat:', error);
  }
}

function saveActivityToLocal(activity: Activity) {
  try {
    const activities = JSON.parse(localStorage.getItem('user_activities') || '[]');
    activities.unshift({
      ...activity,
      id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    });
    // Keep only last 100 activities
    const limited = activities.slice(0, 100);
    localStorage.setItem('user_activities', JSON.stringify(limited));
  } catch (error) {
    console.warn('Failed to save activity to localStorage:', error);
  }
}

// Get activities from localStorage (fallback)
export function getLocalActivities(): Activity[] {
  try {
    const activities = JSON.parse(localStorage.getItem('user_activities') || '[]');
    return activities.map((a: any) => ({
      ...a,
      createdAt: a.createdAt ? new Date(a.createdAt) : new Date()
    }));
  } catch {
    return [];
  }
}

