import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeAuth,
  browserLocalPersistence,
  indexedDBLocalPersistence
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: 'AIzaSyDblmBt3b2L_olx5-7cURDVN-mbgu1_Rdc',
  authDomain: 'smartpantryai-f36db.firebaseapp.com',
  projectId: 'smartpantryai-f36db',
  storageBucket: 'smartpantryai-f36db.firebasestorage.app',
  messagingSenderId: '589013373841',
  appId: '1:589013373841:android:910f7b13e1a5d244734030'
};

// Initialize Firebase App (check if already initialized)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Conditionally configure persistence based on platform to prevent bundling errors.
const getAuthInstance = () => {
  if (Platform.OS === 'web') {
    return initializeAuth(app, {
      persistence: [indexedDBLocalPersistence, browserLocalPersistence]
    });
  } else {
    // Only import native modules when running on Native platforms
    const { getReactNativePersistence } = require('firebase/auth');
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });
  }
};

export const auth = getAuthInstance();

// Initialize Firestore
export const db = getFirestore(app);
