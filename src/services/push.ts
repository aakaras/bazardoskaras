import { messaging, db, isConfigured } from "@/lib/firebase";
import { getToken } from "firebase/messaging";
import { doc, setDoc } from "firebase/firestore";

export async function requestPushPermission(vapidKey: string): Promise<string | null> {
  if (!isConfigured) {
    console.warn("Firebase not configured. Push notifications won't work.");
    return null;
  }
  
  if (typeof window === "undefined" || !("Notification" in window)) {
    return null;
  }
  
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const msg = await messaging();
      if (!msg) {
        console.log("Messaging not supported by browser.");
        return null;
      }
      
      const firebaseConfig = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
      };

      // Ensure service worker is registered with the correct parameters
      const swUrl = `/firebase-messaging-sw.js?firebaseConfig=${encodeURIComponent(JSON.stringify(firebaseConfig))}`;
      await navigator.serviceWorker.register(swUrl);
      const registration = await navigator.serviceWorker.ready;
      
      const currentToken = await getToken(msg, { 
        vapidKey, 
        serviceWorkerRegistration: registration 
      });

      if (currentToken) {
        // Save the token to Firestore
        await saveTokenToFirestore(currentToken);
        return currentToken;
      } else {
        console.log("No registration token available.");
        return null;
      }
    } else {
      console.log("Notification permission not granted.");
      return null;
    }
  } catch (err) {
    console.error("An error occurred while retrieving token. ", err);
    return null;
  }
}

async function saveTokenToFirestore(token: string) {
  try {
    // We use setDoc to create or update if it exists
    await setDoc(doc(db, "push_tokens", token), {
      token,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }, { merge: true });
  } catch (error) {
    console.error("Error saving push token to Firestore", error);
  }
}
