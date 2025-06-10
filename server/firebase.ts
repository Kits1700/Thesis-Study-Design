import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
let db: admin.firestore.Firestore;

try {
  // Check if Firebase is already initialized
  if (!admin.apps.length) {
    // For local development, you can use a service account key
    // For production, use environment variables or default credentials
    if (process.env.FIREBASE_PROJECT_ID) {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
    } else {
      // Fallback initialization - you'll need to set up proper credentials
      console.warn("Firebase not configured. Please set FIREBASE_PROJECT_ID in your environment.");
      console.warn("For local development, you can:");
      console.warn("1. Create a Firebase project at https://console.firebase.google.com");
      console.warn("2. Generate a service account key");
      console.warn("3. Set GOOGLE_APPLICATION_CREDENTIALS environment variable");
    }
  }
  
  db = admin.firestore();
  console.log("✅ Firebase connection established");
} catch (error) {
  console.error("❌ Failed to initialize Firebase:", error);
  throw error;
}

export { db };