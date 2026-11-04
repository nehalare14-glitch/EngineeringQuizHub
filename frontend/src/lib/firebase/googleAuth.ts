import {
  GoogleAuthProvider,
  browserLocalPersistence,
  browserSessionPersistence,
  setPersistence,
  signInWithPopup,
  signInWithEmailAndPassword,
} from "firebase/auth";

import { auth } from "./config";

const googleProvider = new GoogleAuthProvider();

async function configurePersistence(rememberMe: boolean) {
  await setPersistence(
    auth,
    rememberMe ? browserLocalPersistence : browserSessionPersistence
  );
}

export async function loginWithGoogle(rememberMe = true) {
  await configurePersistence(rememberMe);
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function loginWithEmail(
  email: string,
  password: string,
  rememberMe = true
) {
  await configurePersistence(rememberMe);
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}
