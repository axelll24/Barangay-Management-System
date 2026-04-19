import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Validate connection to Firestore
async function testConnection() {
  try {
    // Attempt to fetch a document from the server to verify connectivity
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firestore connection successful.");
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('the client is offline') || error.message.includes('unavailable')) {
        console.error("Firestore Error: Could not reach the backend. This often happens if the database is not provisioned or the configuration is invalid.");
        console.warn("If this is a remixed app, you may need to run the 'Set up Firebase' tool to create a new database.");
      } else {
        console.error("Firestore Connection Error:", error.message);
      }
    }
  }
}
testConnection();
