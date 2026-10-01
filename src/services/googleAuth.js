import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../lib/firebase';
export const signInWithGoogle = () => signInWithPopup(auth, new GoogleAuthProvider());
