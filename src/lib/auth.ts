import { GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, sendPasswordResetEmail, sendEmailVerification, signOut, fetchSignInMethodsForEmail } from 'firebase/auth';
import { doc, setDoc, getDocs, collection, query, where } from 'firebase/firestore';
import { auth, db } from './firebase';

export const googleProvider = new GoogleAuthProvider();

export async function signInWithEmail(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function signUpWithEmail(email: string, password: string, fullName?: string, nickname?: string) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  
  // Save user data to Firestore
  if (userCredential.user) {
    try {
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: email.toLowerCase(),
        fullName: fullName || '',
        nickname: nickname || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Error saving user data to Firestore:', err);
      // Don't throw - auth is successful even if Firestore save fails
    }
  }
  
  return userCredential;
}

export async function signInWithGoogle() {
  return signInWithPopup(auth, googleProvider);
}

export async function checkEmailExists(email: string): Promise<boolean> {
  try {
    const methods = await fetchSignInMethodsForEmail(auth, email);
    return methods && methods.length > 0;
  } catch {
    return false;
  }
}

// Stricter existence check: try Auth, then fallback to Firestore users collection.
// If any check errors, return true to avoid false "email tidak terdaftar" when password sebenarnya salah.
export async function checkEmailExistsStrict(email: string): Promise<boolean> {
  const e = (email || '').trim().toLowerCase();
  try {
    const methods = await fetchSignInMethodsForEmail(auth, e);
    if (methods && methods.length > 0) return true;
  } catch {
    // ignore and fallback
  }
  try {
    const q = query(collection(db, 'users'), where('email', '==', e));
    const snap = await getDocs(q);
    if (!snap.empty) return true;
  } catch {
    // If Firestore query fails, assume exists to prevent misleading message
    return true;
  }
  return false;
}

export async function sendPasswordReset(email: string, redirectUrl?: string) {
  // If redirectUrl === '' we intentionally skip custom continue URL
  let url = redirectUrl === '' ? undefined : redirectUrl;
  if (!url && typeof window !== 'undefined') {
    url = `${window.location.origin}/login`;
  }
  if (url) {
    try {
      return await sendPasswordResetEmail(auth, email, { url });
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/invalid-continue-uri' || code === 'auth/unauthorized-continue-uri') {
        // Retry without custom redirect URL
        return await sendPasswordResetEmail(auth, email);
      }
      throw err;
    }
  }
  return await sendPasswordResetEmail(auth, email);
}

export async function signOutUser() {
  return signOut(auth);
}

export async function sendVerificationEmail() {
  if (!auth.currentUser) throw new Error('No authenticated user to verify');
  return sendEmailVerification(auth.currentUser);
}

export async function isEmailRegistered(email: string): Promise<boolean> {
  const methods = await fetchSignInMethodsForEmail(auth, email.toLowerCase());
  return Array.isArray(methods) && methods.length > 0;
}
