/**
 * Firebase Configuration & Initialization
 * This file connects your website to Firebase Realtime Database (for sports)
 * and Firestore (for users & admin alerts).
 */

const firebaseConfig = {
    apiKey: "AIzaSyABlI1bnZb4EDuMm3LN0cXVGZyTHWFqCUo",
    authDomain: "spin-54ba6.firebaseapp.com",
    projectId: "spin-54ba6",
    storageBucket: "spin-54ba6.firebasestorage.app",
    messagingSenderId: "670887738809",
    appId: "1:670887738809:web:b54e788b6e909460d24a68",
    measurementId: "G-QTREKFXV8Y"
};

// Global variables for database access
let db = null;        // Realtime Database (used by sports)
let fs = null;        // Firestore (used by users & admins)
let firebaseReady = false;

try {
    if (typeof firebase !== 'undefined') {
        firebase.initializeApp(firebaseConfig);
        
        // Initialize Realtime Database
        db = firebase.database();
        
        // Initialize Firestore
        fs = firebase.firestore();
        
        firebaseReady = true;
        console.log('[Firebase] Connected successfully to Realtime DB & Firestore.');
    } else {
        console.warn('[Firebase] SDK not loaded. Using local storage fallback.');
    }
} catch (e) {
    console.error('[Firebase] Initialization error:', e);
}
