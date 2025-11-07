import { GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, sendPasswordResetEmail, sendEmailVerification, signOut } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
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

export async function sendPasswordReset(email: string) {
  return sendPasswordResetEmail(auth, email);
}

export async function signOutUser() {
  return signOut(auth);
}

export async function sendVerificationEmail() {
  if (!auth.currentUser) throw new Error('No authenticated user to verify');
  return sendEmailVerification(auth.currentUser);
}
