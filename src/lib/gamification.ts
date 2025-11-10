import { db } from './firebase';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  getDocs, 
  query, 
  where, 
  serverTimestamp,
  increment 
} from 'firebase/firestore';

export interface MissionProgress {
  missionId: string;
  progress: number;
  target: number;
  completed: boolean;
  completedAt?: Date;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: string;
  rarity: string;
  points: number;
}

export interface UserBadge {
  badgeId: string;
  earnedAt: Date;
  fromMission?: string;
}

// Track mission progress
export async function trackMissionProgress(
  userId: string, 
  missionType: string, 
  value: number = 1,
  metadata?: any
) {
  try {
    // Get all active missions of this type
    const missionsQuery = query(
      collection(db, 'missions'),
      where('type', '==', missionType),
      where('isActive', '==', true)
    );
    
    const missionsSnapshot = await getDocs(missionsQuery);
    
    for (const missionDoc of missionsSnapshot.docs) {
      const mission = missionDoc.data();
      const missionId = mission.id;
      
      // Get current progress
      const progressRef = doc(db, 'users', userId, 'progress', missionId);
      const progressDoc = await getDoc(progressRef);
      
      let currentProgress = 0;
      if (progressDoc.exists()) {
        currentProgress = progressDoc.data().progress || 0;
      }
      
      // Calculate new progress
      let newProgress = currentProgress + value;
      
      // Special handling for different mission types
      if (missionType === 'spending') {
        // For spending missions, accumulate the amount
        newProgress = currentProgress + value;
      } else if (missionType === 'weekend_purchase') {
        // Only count if it's weekend
        const now = new Date();
        const dayOfWeek = now.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) { // Sunday or Saturday
          newProgress = currentProgress + 1;
        } else {
          continue; // Skip this mission if not weekend
        }
      }
      
      // Check if mission is completed
      const isCompleted = newProgress >= mission.target;
      const wasCompleted = progressDoc.exists() && progressDoc.data().completed;
      
      // Update progress
      const progressData: any = {
        progress: newProgress,
        completed: isCompleted,
        updatedAt: serverTimestamp()
      };
      
      if (isCompleted && !wasCompleted) {
        progressData.completedAt = serverTimestamp();
        
        // Award points and badge
        await awardMissionRewards(userId, mission);
      }
      
      await setDoc(progressRef, progressData, { merge: true });
    }
  } catch (error) {
    console.error('Error tracking mission progress:', error);
  }
}

// Award mission rewards (points and badge)
async function awardMissionRewards(userId: string, mission: any) {
  try {
    // Award points
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      'gamification.totalPoints': increment(mission.points),
      'gamification.completedMissions': increment(1),
      'gamification.lastUpdated': serverTimestamp()
    });
    
    // Award badge if specified
    if (mission.badge) {
      await awardBadge(userId, mission.badge, mission.id);
    }
    
    console.log(`Mission ${mission.id} completed for user ${userId}`);
  } catch (error) {
    console.error('Error awarding mission rewards:', error);
  }
}

// Award badge to user
export async function awardBadge(userId: string, badgeId: string, fromMission?: string) {
  try {
    // Check if user already has this badge
    const userBadgeRef = doc(db, 'users', userId, 'badges', badgeId);
    const userBadgeDoc = await getDoc(userBadgeRef);
    
    if (userBadgeDoc.exists()) {
      return; // User already has this badge
    }
    
    // Get badge info
    const badgesQuery = query(
      collection(db, 'badges'),
      where('id', '==', badgeId)
    );
    const badgesSnapshot = await getDocs(badgesQuery);
    
    if (badgesSnapshot.empty) {
      console.error(`Badge ${badgeId} not found`);
      return;
    }
    
    const badge = badgesSnapshot.docs[0].data();
    
    // Award badge
    await setDoc(userBadgeRef, {
      badgeId: badgeId,
      earnedAt: serverTimestamp(),
      fromMission: fromMission || null
    });
    
    // Update user stats
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      'gamification.earnedBadges': increment(1),
      'gamification.totalPoints': increment(badge.points),
      'gamification.lastBadgeEarned': badgeId,
      'gamification.lastUpdated': serverTimestamp()
    });
    
    console.log(`Badge ${badgeId} awarded to user ${userId}`);
  } catch (error) {
    console.error('Error awarding badge:', error);
  }
}

// Check and award category-specific badges
export async function checkCategoryBadges(userId: string, category: string, count: number) {
  const categoryBadges: { [key: string]: { threshold: number; badgeId: string } } = {
    'makanan': { threshold: 15, badgeId: 'foodie' },
    'minuman': { threshold: 15, badgeId: 'foodie' },
    'fashion': { threshold: 10, badgeId: 'fashionista' },
    'kerajinan': { threshold: 8, badgeId: 'craft_lover' }
  };
  
  const categoryLower = category.toLowerCase();
  if (categoryBadges[categoryLower] && count >= categoryBadges[categoryLower].threshold) {
    await awardBadge(userId, categoryBadges[categoryLower].badgeId);
  }
}

// Track purchase activity
export async function trackPurchase(userId: string, amount: number, category: string, metadata?: any) {
  // Track spending mission
  await trackMissionProgress(userId, 'spending', amount, metadata);
  
  // Track purchase count mission
  await trackMissionProgress(userId, 'purchase', 1, metadata);
  
  // Track weekend purchase if applicable
  await trackMissionProgress(userId, 'weekend_purchase', 1, metadata);
  
  // Check category-specific badges
  // You would need to implement category counting logic here
}

// Track visit activity
export async function trackVisit(userId: string, umkmId: string, metadata?: any) {
  await trackMissionProgress(userId, 'visit', 1, { umkmId, ...metadata });
}

// Track review activity
export async function trackReview(userId: string, productId: string, rating: number, metadata?: any) {
  await trackMissionProgress(userId, 'review', 1, { productId, rating, ...metadata });
}

// Track favorite activity
export async function trackFavorite(userId: string, itemId: string, itemType: string, metadata?: any) {
  await trackMissionProgress(userId, 'favorite', 1, { itemId, itemType, ...metadata });
}

// Track share activity
export async function trackShare(userId: string, itemId: string, platform: string, metadata?: any) {
  await trackMissionProgress(userId, 'share', 1, { itemId, platform, ...metadata });
}

// Track login activity
export async function trackLogin(userId: string) {
  // For consecutive login tracking, you'd need more complex logic
  // This is a simplified version
  await trackMissionProgress(userId, 'login', 1, { loginDate: new Date().toDateString() });
}

// Get user gamification stats
export async function getUserGamificationStats(userId: string) {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    const userData = userDoc.data();
    const gamification = userData?.gamification || {};
    
    return {
      totalPoints: gamification.totalPoints || 0,
      completedMissions: gamification.completedMissions || 0,
      earnedBadges: gamification.earnedBadges || 0,
      level: Math.floor((gamification.totalPoints || 0) / 1000) + 1,
      lastBadgeEarned: gamification.lastBadgeEarned || null,
      lastUpdated: gamification.lastUpdated?.toDate() || null
    };
  } catch (error) {
    console.error('Error getting user gamification stats:', error);
    return {
      totalPoints: 0,
      completedMissions: 0,
      earnedBadges: 0,
      level: 1,
      lastBadgeEarned: null,
      lastUpdated: null
    };
  }
}

// Get user badges
export async function getUserBadges(userId: string): Promise<UserBadge[]> {
  try {
    const badgesSnapshot = await getDocs(collection(db, 'users', userId, 'badges'));
    const userBadges: UserBadge[] = [];
    
    badgesSnapshot.forEach((doc) => {
      const data = doc.data();
      userBadges.push({
        badgeId: data.badgeId,
        earnedAt: data.earnedAt?.toDate() || new Date(),
        fromMission: data.fromMission
      });
    });
    
    return userBadges;
  } catch (error) {
    console.error('Error getting user badges:', error);
    return [];
  }
}

// Fetch all badges stored by CLI into 'badges' collection
export async function getAllBadges(): Promise<Badge[]> {
  try {
    const snap = await getDocs(collection(db, 'badges'));
    const items: Badge[] = [];
    snap.forEach((d) => {
      const data = d.data() as any;
      items.push({
        id: data.id,
        name: data.name,
        description: data.description,
        icon: data.icon,
        color: data.color,
        category: data.category,
        rarity: data.rarity,
        points: Number(data.points) || 0
      });
    });
    return items;
  } catch (e) {
    console.error('Error fetching badges:', e);
    return [];
  }
}

// Types and fetcher for missions written by CLI to 'missions'
export interface Mission {
  id: string;
  title: string;
  description: string;
  type: string;
  target: number;
  points: number;
  badge?: string;
  category?: string;
  isActive?: boolean;
  difficulty?: string;
}

export async function getAllMissions(): Promise<Mission[]> {
  try {
    const snap = await getDocs(collection(db, 'missions'));
    const items: Mission[] = [];
    snap.forEach((d) => {
      const data = d.data() as any;
      items.push({
        id: data.id,
        title: data.title,
        description: data.description,
        type: data.type,
        target: Number(data.target) || 0,
        points: Number(data.points) || 0,
        badge: data.badge,
        category: data.category,
        isActive: data.isActive,
        difficulty: data.difficulty
      });
    });
    return items;
  } catch (e) {
    console.error('Error fetching missions:', e);
    return [];
  }
}

// Types and fetcher for vouchers written by CLI to 'vouchers'
export interface Voucher {
  code: string;
  title: string;
  description: string;
  type: string;
  value: number;
  minPurchase?: number;
  maxDiscount?: number;
  pointsCost?: number;
  category?: string;
  validFrom?: Date;
  validUntil?: Date;
  usageLimit?: number;
  usedCount?: number;
  isActive?: boolean;
}

export async function getAllVouchers(): Promise<Voucher[]> {
  try {
    const snap = await getDocs(collection(db, 'vouchers'));
    const items: Voucher[] = [];
    snap.forEach((d) => {
      const v = d.data() as any;
      const toDate = (x: any) => (x?.toDate ? x.toDate() : x ? new Date(x) : undefined);
      items.push({
        code: v.code,
        title: v.title,
        description: v.description,
        type: v.type,
        value: Number(v.value) || 0,
        minPurchase: v.minPurchase != null ? Number(v.minPurchase) : undefined,
        maxDiscount: v.maxDiscount != null ? Number(v.maxDiscount) : undefined,
        pointsCost: v.pointsCost != null ? Number(v.pointsCost) : undefined,
        category: v.category,
        validFrom: toDate(v.validFrom),
        validUntil: toDate(v.validUntil),
        usageLimit: v.usageLimit != null ? Number(v.usageLimit) : undefined,
        usedCount: v.usedCount != null ? Number(v.usedCount) : undefined,
        isActive: v.isActive
      });
    });
    return items;
  } catch (e) {
    console.error('Error fetching vouchers:', e);
    return [];
  }
}

// Get user mission progress
export async function getUserMissionProgress(userId: string): Promise<MissionProgress[]> {
  try {
    const progressSnapshot = await getDocs(collection(db, 'users', userId, 'progress'));
    const progressList: MissionProgress[] = [];
    
    progressSnapshot.forEach((doc) => {
      const data = doc.data();
      progressList.push({
        missionId: doc.id,
        progress: data.progress || 0,
        target: data.target || 0,
        completed: data.completed || false,
        completedAt: data.completedAt?.toDate()
      });
    });
    
    return progressList;
  } catch (error) {
    console.error('Error getting user mission progress:', error);
    return [];
  }
}
