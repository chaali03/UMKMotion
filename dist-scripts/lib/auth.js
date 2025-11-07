import { GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, sendPasswordResetEmail, sendEmailVerification, signOut } from 'firebase/auth';
import { auth } from './firebase';
export const googleProvider = new GoogleAuthProvider();
export async function signInWithEmail(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
}
export async function signUpWithEmail(email, password) {
    return createUserWithEmailAndPassword(auth, email, password);
}
export async function signInWithGoogle() {
    return signInWithPopup(auth, googleProvider);
}
export async function sendPasswordReset(email) {
    return sendPasswordResetEmail(auth, email);
}
export async function signOutUser() {
    return signOut(auth);
}
export async function sendVerificationEmail() {
    if (!auth.currentUser)
        throw new Error('No authenticated user to verify');
    return sendEmailVerification(auth.currentUser);
}
