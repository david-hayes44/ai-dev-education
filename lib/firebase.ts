// Import the functions you need from the SDKs you need
import { initializeApp, getApps, FirebaseApp } from "firebase/app"
import { getFirestore, Firestore } from "firebase/firestore"
import { getStorage, FirebaseStorage } from "firebase/storage"
import { getAuth } from 'firebase/auth'

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

// Log Firebase configuration for debugging (only in development)
if (process.env.NODE_ENV === 'development') {
  console.log('Firebase config (sanitized):', {
    apiKey: firebaseConfig.apiKey ? `${firebaseConfig.apiKey.substring(0, 3)}...` : undefined,
    authDomain: firebaseConfig.authDomain,
    projectId: firebaseConfig.projectId,
    storageBucket: firebaseConfig.storageBucket,
    hasMessagingSenderId: !!firebaseConfig.messagingSenderId,
    hasAppId: !!firebaseConfig.appId,
    environment: process.env.NODE_ENV,
    isConfigComplete: !!(
      firebaseConfig.apiKey && 
      firebaseConfig.authDomain && 
      firebaseConfig.projectId && 
      firebaseConfig.storageBucket
    )
  });
}

// Initialize Firebase
let firebaseApp: FirebaseApp | undefined
if (!getApps().length) {
  firebaseApp = initializeApp(firebaseConfig)
} else {
  firebaseApp = getApps()[0]
}

// Initialize Firestore
let db: Firestore
// Initialize Storage
let storage: FirebaseStorage

if (firebaseApp) {
  db = getFirestore(firebaseApp)
  storage = getStorage(firebaseApp)
} else {
  throw new Error("Firebase app initialization failed")
}

const auth = getAuth(firebaseApp)

export { firebaseApp, auth, db, storage }
