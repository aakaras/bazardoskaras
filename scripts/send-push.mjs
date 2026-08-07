import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';

// Initialize Firebase Admin using Service Account from Environment Variable
const serviceAccountKeyStr = process.env.FIREBASE_SERVICE_ACCOUNT;
if (!serviceAccountKeyStr) {
  console.error("Missing FIREBASE_SERVICE_ACCOUNT environment variable.");
  process.exit(1);
}

const serviceAccount = JSON.parse(serviceAccountKeyStr);

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();
const messaging = getMessaging();

async function run() {
  const itemTitle = process.env.ITEM_TITLE || 'Temos um novo item!';
  const itemId = process.env.ITEM_ID;

  console.log(`Preparing to send push notification for: ${itemTitle} (${itemId})`);

  // Fetch all tokens
  const tokensSnapshot = await db.collection('push_tokens').get();
  
  if (tokensSnapshot.empty) {
    console.log('No push tokens found. Skipping.');
    return;
  }

  const tokens = [];
  tokensSnapshot.forEach(doc => {
    const data = doc.data();
    if (data.token) {
      tokens.push(data.token);
    }
  });

  console.log(`Found ${tokens.length} subscribers.`);

  const message = {
    notification: {
      title: 'Novo Item no Bazar!',
      body: itemTitle,
    },
    data: {
      url: itemId ? `https://bazardoskaras.web.app/item/${itemId}` : 'https://bazardoskaras.web.app/'
    },
    tokens: tokens
  };

  try {
    const response = await messaging.sendEachForMulticast(message);
    console.log(`${response.successCount} messages were sent successfully.`);
    if (response.failureCount > 0) {
      console.log(`${response.failureCount} messages failed.`);
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          console.error(`Error sending to token at index ${idx}:`, resp.error);
          // Optional: we could delete invalid tokens from Firestore here
        }
      });
    }
  } catch (error) {
    console.error('Error sending multicast message:', error);
    process.exit(1);
  }
}

run();
