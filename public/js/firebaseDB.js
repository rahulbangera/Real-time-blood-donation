// importScripts(
//   "https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js"
// );
// importScripts(
//   "https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js"
// );
// // Import Firebase libraries using importScripts
// // importScripts(
// //     "https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js"
// //   );
// //   importScripts(
// //     "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore-compat.js"
// //   );
// //   
  // Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyDvw9xC6byg4DkNpWzzB4466BidJCJRggU",
    authDomain: "real-time-blood-donation-c0c32.firebaseapp.com",
    projectId: "real-time-blood-donation-c0c32",
    storageBucket: "real-time-blood-donation-c0c32.firebasestorage.app",
    messagingSenderId: "99078731654",
    appId: "1:99078731654:web:9724de214ab7b8cb2f5e07",
    measurementId: "G-BX25M7M35P",
    vapidKey:
      "BAdlA-8wJBL7nixKyuIyTFy6_M7iUpACPCd9b49nT3KDWrUXMtIfW6QshVsL5w_9I1NfqR14bmyzRKgPkkskIEQ",
  };
  
  // Initialize Firebase app
  firebase.initializeApp(firebaseConfig);
  
  // Initialize Firestore
  const db = firebase.firestore();
  
  // Send Message Function
  async function sendMessage(from, to, message) {
    const roomId = [from, to].sort().join(":");
    const timestamp = new Date();
  
    try {
      await db.collection("messages").add({
        from,
        to,
        roomId,
        message,
        timestamp,
      });
      console.log("Message sent");
    } catch (err) {
      console.error("Error sending message: ", err);
    }
  }
  