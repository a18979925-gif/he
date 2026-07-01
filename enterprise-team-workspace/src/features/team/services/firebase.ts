import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCabOzelPkL9PrpQRvTNkd_aTuSTISsNIM",
  authDomain: "sdas-6ea6e.firebaseapp.com",
  projectId: "sdas-6ea6e",
  storageBucket: "sdas-6ea6e.firebasestorage.app",
  messagingSenderId: "638068066461",
  appId: "1:638068066461:web:406b29271c189ea054ac74"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
}, "ai-studio-enterpriseteamwo-e04f4f78-3b7b-4fa6-a7ef-040bf7243d51");

