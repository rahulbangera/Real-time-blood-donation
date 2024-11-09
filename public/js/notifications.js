// import { initializeApp } from "firebase/app";
// import { getMessaging, getToken, onMessage } from "firebase/messaging";
// import { getAnalytics } from "firebase/analytics";
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js'
import { getMessaging, getToken, onMessage } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-messaging.js'
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-analytics.js'

const firebaseConfig = {
  apiKey: "AIzaSyDvw9xC6byg4DkNpWzzB4466BidJCJRggU",
  authDomain: "real-time-blood-donation-c0c32.firebaseapp.com",
  projectId: "real-time-blood-donation-c0c32",
  storageBucket: "real-time-blood-donation-c0c32.firebasestorage.app",
  messagingSenderId: "99078731654",
  appId: "1:99078731654:web:9724de214ab7b8cb2f5e07",
  measurementId: "G-BX25M7M35P",
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);
const analytics = getAnalytics(app);


async function requestNotificationPermission() {
  const permission = await Notification.requestPermission();
  if (permission === "granted") {
    console.log("Notification permission granted");
  } else {
    console.log("Notification permission denied");
  }
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/firebase-messaging-sw.js')
    .then((registration) => {
      console.log('Service Worker registered with scope:', registration.scope);
    })
    .catch((error) => {
      console.error('Service Worker registration failed:', error);
    });
} else {
  console.warn('Service Workers are not supported in this browser.');
}


requestNotificationPermission();

getToken(messaging, {
  vapidKey:
    "BAdlA-8wJBL7nixKyuIyTFy6_M7iUpACPCd9b49nT3KDWrUXMtIfW6QshVsL5w_9I1NfqR14bmyzRKgPkkskIEQ",
}).then((currentToken) => {
  if (currentToken) {
    console.log("Token: ", currentToken);
    fetch('checkFCMToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: currentToken }),
    }).then((res) => {
      if (res.status === 200) {
        console.log('Token exists');
      } else {
        console.log('Token does not exist');
      }
    })
  } else {
    console.log(
      "No registration token available. Request permission to generate one."
    );
  }
});

onMessage(messaging, (payload) => {
  console.log("Message received. ", payload);
});
