import { initializeApp } from 'firebase/app';

import {
getAuth
} from 'firebase/auth';

import {
getFirestore
} from 'firebase/firestore';

const firebaseConfig = {

apiKey:
'AIzaSyDblmBt3b2L_olx5-7cURDVN-mbgu1_Rdc',

authDomain:
'smartpantryai-f36db.firebaseapp.com',

projectId:
'smartpantryai-f36db',

storageBucket:
'smartpantryai-f36db.firebasestorage.app',

messagingSenderId:
'589013373841',

appId:
'1:589013373841:android:910f7b13e1a5d244734030'

};

const app =
initializeApp(
firebaseConfig
);

export const auth =
getAuth(
app
);

export const db =
getFirestore(
app
);