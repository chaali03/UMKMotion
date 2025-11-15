// lib/follow.ts
import { db } from './firebase';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  increment,
  updateDoc
} from 'firebase/firestore';

/**
 * Follow a store/user
 */
export async function followStore(userId: string, storeId: string, storeName: string): Promise<void> {
  try {
    const followRef = doc(db, 'users', userId, 'following', storeId);
    await setDoc(followRef, {
      storeId,
      storeName,
      followedAt: serverTimestamp()
    });

    // Update follower count in store
    const storeRef = doc(db, 'stores', storeId);
    const storeSnap = await getDoc(storeRef);
    if (storeSnap.exists()) {
      await updateDoc(storeRef, {
        followerCount: increment(1)
      });
    }
  } catch (error) {
    console.error('Error following store:', error);
    throw error;
  }
}

/**
 * Unfollow a store/user
 */
export async function unfollowStore(userId: string, storeId: string): Promise<void> {
  try {
    const followRef = doc(db, 'users', userId, 'following', storeId);
    await deleteDoc(followRef);

    // Update follower count in store
    const storeRef = doc(db, 'stores', storeId);
    const storeSnap = await getDoc(storeRef);
    if (storeSnap.exists()) {
      await updateDoc(storeRef, {
        followerCount: increment(-1)
      });
    }
  } catch (error) {
    console.error('Error unfollowing store:', error);
    throw error;
  }
}

/**
 * Check if user is following a store
 */
export async function isFollowingStore(userId: string, storeId: string): Promise<boolean> {
  try {
    const followRef = doc(db, 'users', userId, 'following', storeId);
    const followSnap = await getDoc(followRef);
    return followSnap.exists();
  } catch (error) {
    console.error('Error checking follow status:', error);
    return false;
  }
}

/**
 * Get all stores/user that a user is following
 */
export async function getFollowing(userId: string): Promise<Array<{ storeId: string; storeName: string; followedAt: any }>> {
  try {
    const followingRef = collection(db, 'users', userId, 'following');
    const snapshot = await getDocs(followingRef);
    return snapshot.docs.map(doc => ({
      storeId: doc.id,
      ...doc.data()
    } as any));
  } catch (error) {
    console.error('Error getting following:', error);
    return [];
  }
}

/**
 * Get all followers of a store/user
 */
export async function getFollowers(storeId: string): Promise<Array<{ userId: string; userName?: string; userPhoto?: string; followedAt: any }>> {
  try {
    // Get all users who are following this store
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);
    
    const followers: Array<{ userId: string; userName?: string; userPhoto?: string; followedAt: any }> = [];
    
    for (const userDoc of usersSnapshot.docs) {
      const followingRef = doc(db, 'users', userDoc.id, 'following', storeId);
      const followingSnap = await getDoc(followingRef);
      
      if (followingSnap.exists()) {
        const userData = userDoc.data();
        followers.push({
          userId: userDoc.id,
          userName: userData.nickname || userData.fullName || userData.displayName || 'User',
          userPhoto: userData.photoURL || userData.photoUrl,
          followedAt: followingSnap.data().followedAt
        });
      }
    }
    
    return followers;
  } catch (error) {
    console.error('Error getting followers:', error);
    return [];
  }
}

/**
 * Get followers for a user profile
 */
export async function getUserFollowers(userId: string): Promise<Array<{ userId: string; userName?: string; userPhoto?: string; followedAt: any }>> {
  try {
    // For user profiles, we track who follows this user
    // This can be stored in a followers subcollection
    const followersRef = collection(db, 'users', userId, 'followers');
    const followersSnapshot = await getDocs(followersRef);
    
    const followers: Array<{ userId: string; userName?: string; userPhoto?: string; followedAt: any }> = [];
    
    for (const followerDoc of followersSnapshot.docs) {
      const followerId = followerDoc.id;
      const followerData = followerDoc.data();
      
      // Get user info
      const userRef = doc(db, 'users', followerId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        followers.push({
          userId: followerId,
          userName: userData.nickname || userData.fullName || userData.displayName || 'User',
          userPhoto: userData.photoURL || userData.photoUrl,
          followedAt: followerData.followedAt || followerData.createdAt
        });
      }
    }
    
    return followers;
  } catch (error) {
    console.error('Error getting user followers:', error);
    return [];
  }
}

/**
 * Get follower count for a store
 */
export async function getFollowerCount(storeId: string): Promise<number> {
  try {
    const storeRef = doc(db, 'stores', storeId);
    const storeSnap = await getDoc(storeRef);
    if (storeSnap.exists()) {
      const data = storeSnap.data();
      return data.followerCount || 0;
    }
    return 0;
  } catch (error) {
    console.error('Error getting follower count:', error);
    return 0;
  }
}

