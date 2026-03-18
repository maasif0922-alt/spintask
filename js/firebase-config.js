/**
 * Firebase Configuration
 * Replace the placeholder values below with your actual Firebase project credentials.
 * Go to: Firebase Console → Your Project → Project Settings → Your Apps → SDK Setup
 */

// =====================================================================
//  PASTE YOUR FIREBASE CONFIG HERE
// =====================================================================
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
// =====================================================================

// Initialize Firebase
let db = null;
let firebaseReady = false;

try {
    if (typeof firebase !== 'undefined') {
        firebase.initializeApp(firebaseConfig);
        db = firebase.database();
        firebaseReady = true;
        console.log('[Firebase] Connected successfully.');
    } else {
        console.warn('[Firebase] SDK not loaded. Real-time sync disabled. Using local storage fallback.');
    }
} catch (e) {
    console.warn('[Firebase] Init failed:', e.message, '— Using local storage fallback.');
}
