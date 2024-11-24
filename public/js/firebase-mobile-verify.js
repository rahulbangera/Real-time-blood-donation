import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-app.js";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "https://www.gstatic.com/firebasejs/9.17.2/firebase-auth.js";

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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

console.log("Setting up reCAPTCHA");
window.recaptchaVerifier = new RecaptchaVerifier(
  "verifyCaptcha",
  {
    size: "invisible",
    callback: (response) => {
      console.log("reCAPTCHA solved, allow signInWithPhoneNumber");
      // reCAPTCHA solved, allow signInWithPhoneNumber
    },
  },
  auth
);

const verify = document.getElementById("verify");

verify.addEventListener("click", () => {
  // window.recaptchaVerifier.render().then((widgetId) => {
  //   console.log("reCAPTCHA rendered with widgetId:", widgetId);
  // });
  // window.recaptchaVerifier
  //   .verify()
  //   .then((response) => {
  //     console.log("reCAPTCHA manually triggered, response:", response);
  //     onSignInSubmit();
  //   })
  //   .catch((error) => {
  //     console.error("Error triggering reCAPTCHA:", error);
  //   });
  onSignInSubmit();
});

console.log("recaptchaVerifier initialized:", window.recaptchaVerifier);

// Handle the sign-in and OTP verification
// Function to send OTP
async function onSignInSubmit() {
  console.log("Sending OTP...");
  const verifyOTPS = document.getElementById("verifyOTP");
  const phoneNumber = parseInt(document.getElementById("mobile").value);
  const appVerifier = window.recaptchaVerifier;
  verifyOTPS.addEventListener("click", confirmOtp);

  console.log("Phone number:", phoneNumber);

  try {
    // Send SMS
    signInWithPhoneNumber(auth, `+91${phoneNumber}`, appVerifier)
      .then((confirmationResult) => {
        window.confirmationResult = confirmationResult;
      })
      .catch((error) => {
        if (error.code === "auth/too-many-requests") {
          console.error("Too many requests. Retrying in 30 seconds...");
        } else {
          console.error("Error sending SMS:", error);
        }
      });
    console.log(window.confirmationResult);
    console.log("SMS sent successfully. Waiting for OTP...");
  } catch (error) {
    if (error.code === "auth/too-many-requests") {
      console.error("Too many requests. Retrying in 30 seconds...");
      setTimeout(() => onSignInSubmit(), 30 * 1000); // Retry after 30 seconds
    } else {
      console.error("Error sending SMS:", error);
    }
  }
}

async function confirmOtp() {
  const otp = getUserOtp();
  console.log("Entered OTP:", otp);

  try {
    const result = await window.confirmationResult.confirm(otp);

    const user = result.user;
    console.log("User signed in successfully:", user);

    window.mobileNumber = document.getElementById("mobile").value;
    console.log("Mobile number:", window.mobileNumber);
  } catch (error) {
    console.error("Error confirming OTP:", error);
  }
}

function getUserOtp() {
  return document.getElementById("otp").value;
}
