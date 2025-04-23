// Adding this file to help debug Firestore issues
// Add this script tag after the other Firebase scripts in index.html
// This will output more detailed Firestore errors to the console

function checkFirebaseSetup() {
  console.log("Checking Firebase setup...");
  
  try {
    // Check if Firebase is initialized
    if (!firebase.apps.length) {
      console.error("Firebase is not initialized!");
      return false;
    }
    
    // Check if Firestore is available
    if (!firebase.firestore) {
      console.error("Firestore is not available. Make sure the Firestore SDK is loaded.");
      return false;
    }
    
    console.log("Firebase is initialized and Firestore is available");
    
    // Test a simple Firestore operation
    firebase.firestore().collection('reviews').limit(1).get()
      .then(snapshot => {
        console.log("Firestore connection test succeeded!");
      })
      .catch(error => {
        console.error("Firestore test query failed:", error);
        console.log("Error code:", error.code);
        console.log("Error message:", error.message);
        
        // Specific error handling
        if (error.code === 'permission-denied') {
          console.log("SOLUTION: You need to update your Firestore rules to allow read/write access");
          console.log("Go to Firebase Console > Firestore Database > Rules and set:");
          console.log(`
            rules_version = '2';
            service cloud.firestore {
              match /databases/{database}/documents {
                match /{document=**} {
                  allow read, write: if true;
                }
              }
            }
          `);
        } else if (error.code === 'resource-exhausted') {
          console.log("SOLUTION: You've exceeded your Firebase quota. Check your billing plan.");
        } else if (error.code === 'unavailable') {
          console.log("SOLUTION: There might be connectivity issues. Check your internet connection.");
        }
      });
      
    return true;
  } catch (e) {
    console.error("Error in checkFirebaseSetup:", e);
    return false;
  }
}

// Run the check when this script loads
document.addEventListener('DOMContentLoaded', checkFirebaseSetup);
