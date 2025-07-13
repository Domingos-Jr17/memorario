import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBch88N9OV8adEFtSH_ogko94sYQikI8yA",
  authDomain: "memorario-3b941.firebaseapp.com",
  projectId: "memorario-3b941",
  storageBucket: "memorario-3b941.appspot.com", // corrigido
  messagingSenderId: "377550151646",
  appId: "1:377550151646:web:a2837ddd65c2d545c2874f",
  measurementId: "G-1QVVGKL2KW"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
