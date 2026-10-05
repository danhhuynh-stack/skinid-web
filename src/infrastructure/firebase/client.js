import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  getAuth,
  getIdTokenResult,
  GoogleAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updatePassword,
  updateProfile
} from 'firebase/auth';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where
} from 'firebase/firestore';
import { firebaseConfig } from '../../shared/config/runtime.js';

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const authSdk = Object.freeze({
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  getIdTokenResult,
  GoogleAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updatePassword,
  updateProfile
});

const firestoreSdk = Object.freeze({
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where
});

export const firebaseServices = Object.freeze({
  app,
  auth,
  db,
  sdk: Object.freeze({ auth: authSdk, firestore: firestoreSdk })
});

export const firebaseReady = Promise.resolve(firebaseServices);

export function installLegacyFirebaseBridge() {
  if (typeof window === 'undefined') return firebaseServices;
  window.SKINID_FIREBASE = firebaseServices;
  window.SKINID_FIREBASE_READY = firebaseReady;
  queueMicrotask(() => document.dispatchEvent(new CustomEvent('skinid:firebase-ready', { detail: firebaseServices })));
  return firebaseServices;
}

export async function initializeAnalytics() {
  if (typeof window === 'undefined') return null;
  try {
    const analyticsSdk = await import('firebase/analytics');
    if (!(await analyticsSdk.isSupported())) return null;
    return analyticsSdk.getAnalytics(app);
  } catch (error) {
    console.warn('[SkinID Firebase] Analytics không khả dụng:', error.message);
    return null;
  }
}
