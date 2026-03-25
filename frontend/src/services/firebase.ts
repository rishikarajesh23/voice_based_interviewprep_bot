import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';


const firebaseConfig = {
  // Add your Firebase config here
 apiKey: "AIzaSyBlYfdlCmyBXe1QAgnUxt073xalyzMnBZs",
  authDomain: "preptalkinterviewbot.firebaseapp.com",
  projectId: "preptalkinterviewbot",
  storageBucket: "preptalkinterviewbot.firebasestorage.app",
  messagingSenderId: "818549915708",
  appId: "1:818549915708:web:f511dc275331a842080339"
};


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);


export const signUp = async (email: string, password: string, name: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const token = await userCredential.user.getIdToken();
    return { user: userCredential.user, token, name };
  } catch (error) {
    throw error;
  }
};


export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const token = await userCredential.user.getIdToken();
    return { user: userCredential.user, token };
  } catch (error) {
    throw error;
  }
};


export const logOut = () => signOut(auth);


export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
