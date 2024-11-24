import e from "express";
import fs from "fs";
import http, { createServer } from "http";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import ejs from "ejs";
import mongoose from "mongoose";
import mongo from "mongodb";
import nodemailer from "nodemailer";
import LocalUser from "./Models/localuser.js";
import session from "express-session";
import Otps from "./Models/otpverifications.js";
import bodyParser from "body-parser";
import MongoStore from "connect-mongo";
import Donor from "./Models/donorModel.js";
import admin from "firebase-admin";
// import serviceAccount from "./Models/real-time-blood-donation-c0c32-firebase-adminsdk-2q376-f788502794.json" assert { type: "json" };
import { assert, info } from "console";
import TokenUser from "./Models/tokenUser.js";
import RequestsForDonor from "./Models/requestsForDonors.js";
import twilio from "twilio";
import sentRequest from "./Models/sentRequests.js";
import bcrypt from "bcrypt";
import AcceptedRequests from "./Models/acceptedRequests.js";
import { Vonage } from "@vonage/server-sdk";
import { type } from "os";
import https from "https";
import resetToken from "./Models/resetToken.js";
import crypto from "crypto";
import axios from "axios";
import sosRequest from "./Models/sosRequests.js";
import sosReqForDonor from "./Models/sosReqForDonors.js";
import dotenv from "dotenv";

dotenv.config();

const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AUTH;
// const client = twilio(accountSid, authToken);

const app = e();
const PORT = process.env.PORT || 5000;
const url =
  process.env.BASE_URL ||
  "https://real-time-blood-donation-production-cdfc.up.railway.app";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_ID,
    pass: process.env.EMAIL_PASS,
  },
});

const OTPLess_API_KEY = "OTPLess_API_KEY";

async function sendOtp(phoneNumber) {
  try {
    const response = await axios.post(
      "https://api.otpless.com/sendOtp",
      {
        phone: phoneNumber, // Phone number in international format (e.g., +919876543210)
      },
      {
        headers: {
          Authorization: `Bearer ${OTPLess_API_KEY}`,
        },
      }
    );

    console.log("OTP sent successfully:", response.data);
    return response.data; // Store response for further actions
  } catch (error) {
    console.error("Error sending OTP:", error.response.data);
    throw error;
  }
}

const vonage = new Vonage({
  apiKey: process.env.VONAGE_USER,
  apiSecret: process.env.VONAGE_PASS,
});

const vonageUser = process.env.VONAGE_USER;
const vonagePass = process.env.VONAGE_PASS;
const from = "14157386102";

function sendVonageMessage(to, body) {
  console.log(to);

  const data = JSON.stringify({
    from: { type: "whatsapp", number: from },
    to: { type: "whatsapp", number: to },
    message: {
      content: {
        type: "text",
        text: body,
      },
    },
  });

  const options = {
    hostname: "messages-sandbox.nexmo.com",
    port: 443,
    path: "/v0.1/messages",
    method: "POST",
    authorization: {
      username: vonageUser,
      password: vonagePass,
    },
    headers: {
      Authorization: "Basic " + btoa(vonageUser + ":" + vonagePass),
      "Content-Type": "application/json",
    },
  };

  const req = https.request(options, (res) => {
    res.on("data", (d) => {
      process.stdout.write(d);
    });
  });

  req.on("error", (error) => {
    console.error(error);
  });

  req.write(data);
  req.end();
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.set("view engine", "ejs");

app.set("views", path.join(__dirname, "views"));

// const serviceAccountPath = path.join(
//   __dirname,
//   "./Models/real-time-blood-donation-c0c32-fd651774f25a.json"
// );

const serviceAccount = JSON.parse(process.env.FIREBASE_CRED);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// app.use(
//   session({
//     secret: process.env.SESSION_SECRET || "secret",
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//       secure: process.env.NODE_ENV === "production",
//       httpOnly: true,
//       maxAge: 24 * 60 * 60 * 1000,
//     },
//   })
// );

app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl:
        "mongodb+srv://myAtlasDBUser:Hero123456@test1.bu7v6.mongodb.net/bloodDonation?retryWrites=true&w=majority&appName=Test1",
      collectionName: "sessions",
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
      sameSite: "lax",
      secure: false,
    },
  })
);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// app.use(e.static("public"));
app.use(e.static(__dirname + "/public/"));
app.use(e.json());
app.use(e.urlencoded({ extended: true }));

// service: "smtp.gmail.com",
//   auth: {
//     user: "coderangersverify@gmail.com",
//     pass: "vzhykowzuabnjscw ",
//   }

// req.session.email = "testing";

async function sendOtpEmail(email, username) {
  const otp = Math.floor(100000 + Math.random() * 900000);
  const mailOptions = {
    from: "coderangersverify@gmail.com",
    to: email,
    subject: "OTP Verification",
    text: `Your OTP is: ${otp}`,
  };

  const dup = await Otps.findOneAndDelete({ email });

  const newOtpUser = new Otps({
    username: username,
    email,
    emailOtp: otp,
  });

  await newOtpUser.save();
  // req.session.email = await newOtpUser.email;

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      return res.send("Failed to send OTP");
    } else {
      console.log("Email sent: " + info.response);
    }
  });
  return;
}

function sendNotification(userToken, title, body) {
  const message = {
    token: userToken,
    notification: {
      title,
      body,
      // icon: "https://png.pngtree.com/png-clipart/20230426/original/pngtree-blood-drop-blood-red-cartoon-illustration-png-image_9103018.png",
    },
    data: {
      click_action: `${url}/dashboard`,
    },
  };
  admin
    .messaging()
    .send(message)
    .then((response) => {
      console.log("Notification sent successfully", response);
    })
    .catch((error) => {
      console.log("Error sending notification", error);
    });
}

// function sendWhatsappMessage(to, body) {
//   client.messages
//     .create({
//       from: "whatsapp:+14155238886",
//       body: "Hi you have a request",
//       to: `whatsapp:${to}`,
//     })
//     .then((message) => console.log(message.sid));
// }

app.get("/favicon.ico", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "favicon.ico"));
});

app.get("/", async (req, res) => {
  const foundUser = await Donor.findOne({ email: req.session.email }).lean();
  console.log(foundUser);
  if (foundUser) {
    res.render("welcome", { userLoggedIn: true, active: true });
  } else if (req.session.email) {
    res.render("welcome", { userLoggedIn: true, active: false });
  } else {
    res.render("welcome", { userLoggedIn: false, active: false });
  }
});

app.get("/profile", async (req, res) => {
  if (req.session.email) {
    const currentUser = await LocalUser.findOne({ email: req.session.email });
    let username = currentUser.username;
    let email = currentUser.email;
    let name = currentUser.name;
    let mobile = currentUser.mobile;
    let bloodgroup = currentUser.bloodgroup;
    res.render("profile", {
      userLoggedIn: true,
      username,
      email,
      name,
      mobile,
      bloodgroup,
    });
  } else {
    return res.redirect("/signin?error=Login to continue");
  }
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.get("/signin", (req, res) => {
  const error = req.query.error;
  if (error !== undefined) {
    res.render("signin", { error });
  } else {
    res.render("signin", { error: "" });
  }
});

app.post("/nearbysearch", async (req, res) => {
  const { nearbyHospitals, bdGroup } = req.body;
  let currUsername = req.session.username;
  let donorexist = [];
  let currHospital;
  let hospital1;
  let selectedHospitals = [];
  if (bdGroup === "ANY") {
    for (const hospital of nearbyHospitals) {
      donorexist = await Donor.find({
        hospitals: {
          $elemMatch: { placeId: hospital.place_id },
        },
        username: { $ne: currUsername },
      });
      if (donorexist.length > 0) {
        // for (let i = 0; i < donorexist.length; i++) {
        //   // if(donorexist[i].email === req.session.email) {
        //   //   continue;
        //   // }
        //   let loc = `${donorexist[i].location.sublocality}, ${donorexist[i].location.town}`;
        //   let hospital1 = {
        //     name: hospital.name,
        //     // donorName: donorexist[i].name,
        //     // donorUserName: donorexist[i].username,
        //     distance: hospital.distance,
        //     bloodGroup: donorexist[i].bloodGroup,
        //     count: donorexist.length,
        //   };
        //   selectedHospitals.add(hospital1);
        // }

        hospital1 = {
          hospitalName: hospital.name,
          hospitalPlaceId: hospital.place_id,
          bdGroup: bdGroup,
          distance: Math.round(hospital.distance) / 1000,
          count: donorexist.length,
        };

        selectedHospitals.push(hospital1);
      }
    }
  } else {
    for (const hospital of nearbyHospitals) {
      donorexist = await Donor.find({
        hospitals: {
          $elemMatch: { placeId: hospital.place_id },
        },
        bloodGroup: bdGroup,
        username: { $ne: currUsername },
      });
      if (hospital.place_id === "ChIJYZTdbJiyvDsREeCa-AmBcI0") {
        console.log(donorexist);
      }

      if (donorexist.length > 0) {
        //   for (let i = 0; i < donorexist.length; i++) {
        //     // if(donorexist[i].email === req.session.email) {
        //     //   continue;
        //     // }
        //     let loc = `${donorexist[i].location.sublocality}, ${donorexist[i].location.town}`;
        //     let hospital1 = {
        //       name: hospital.name,
        //       donorName: donorexist[i].name,
        //       donorUserName: donorexist[i].username,
        //       donorPlace: loc,
        //       bloodGroup: donorexist[i].bloodGroup,
        //     };
        //     selectedHospitals.push(hospital1);
        //   }
        // }
        hospital1 = {
          hospitalName: hospital.name,
          hospitalPlaceId: hospital.place_id,
          bdGroup: bdGroup,
          distance: Math.round(hospital.distance) / 1000,
          count: donorexist.length,
        };
        selectedHospitals.push(hospital1);
      }
    }

    // if (donorexist.length > 0) {
    //   for (let i = 0; i < donorexist.length; i++) {
    //     // if(donorexist[i].email === req.session.email) {
    //     //   continue;
    //     // }
    //     let loc = `${donorexist[i].location.sublocality}, ${donorexist[i].location.town}`;
    //     let hospital1 = {
    //       name: hospital.name,
    //       donorName: donorexist[i].name,
    //       donorUserName: donorexist[i].username,
    //       donorPlace: loc,
    //       bloodGroup: bdGroup,
    //     };
    //     selectedHospitals.push(hospital1);
    //   }
    // }
  }
  res.status(200).json({ selectedHospitals });
});

app.get("/requestblood", (req, res) => {
  if (req.session.email) {
    res.render("request", { userLoggedIn: true });
  } else {
    return res.redirect("/signin?error=Login to continue");
  }
});

app.get("/donateblood", async (req, res) => {
  const currentUser = await Donor.findOne({ email: req.session.email });
  if (currentUser) {
    res.render("donate", { userLoggedIn: true, active: true });
  } else if (req.session.email) {
    res.render("donate", { userLoggedIn: true, active: false });
  } else {
    return res.redirect("/signin?error=Login to continue");
  }
});

app.post("/donoractive", async (req, res) => {
  const { selectedHospitals, sublocality, town } = req.body;
  await Donor.deleteOne({ email: req.session.email });
  const currentUser = await LocalUser.findOne({ email: req.session.email });
  const newDonor = await new Donor({
    name: currentUser.name,
    username: currentUser.username,
    email: currentUser.email,
    bloodGroup: currentUser.bloodgroup,
    hospitals: selectedHospitals,
    location: {
      sublocality,
      town,
    },
  });

  await newDonor.save();
  res.status(200).send("Saved");
  // 100ms delay
});

app.post("/donorinactive", async (req, res) => {
  const curr = await Donor.deleteOne({ email: req.session.email });
  res.status(200).send("Deleted");
});

app.post("/signup", async (req, res) => {
  const { formObject } = await req.body;
  const { name, userName, email, password, mbNumber, bdGroup } = formObject;
  let saltrounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltrounds);
  const verified = false;

  if (name && userName && email && password && mbNumber && bdGroup) {
    try {
      const existingUserEmail = await LocalUser.findOne({ email: email });
      if (existingUserEmail) {
        return res.status(301).send("Email already exists");
      }
      const existingUserUsername = await LocalUser.findOne({
        username: userName,
      });
      if (existingUserUsername) {
        return res.status(300).send("Username already exists");
      }
      const existingUserMobile = await LocalUser.findOne({ mobile: mbNumber });
      if (existingUserMobile) {
        return res.status(302).send("Mobile number already exists");
      }

      const newUser = new LocalUser({
        name,
        username: userName,
        email,
        password: hashedPassword,
        mobile: mbNumber,
        bloodgroup: bdGroup,
        verified,
      });

      // req.session.email = email;
      // req.session.name = userName;

      const savedUser = await newUser.save();

      const duplicate = await Otps.findOne({ email });
      if (duplicate) {
        await Otps.deleteOne({ email });
      }

      sendOtpEmail(email, userName);
      res.status(200).json({ redirect: "/otpverify", hidemail: email });
    } catch (error) {
      console.error("Error during signup:", error);
      res.status(500).send("Internal Server Error");
    }
  } else {
    res.send("Please fill all the fields");
  }
});

app.post("/otpVerify", async (req, res) => {
  console.log(req.body);
  let { hidemail, otp } = req.body;
  const email1 = hidemail;
  console.log(otp);
  console.log(email1);
  otp = parseInt(otp);

  try {
    const otpUser = await Otps.findOne({ email: email1 });
    console.log(otpUser);
    if (!otpUser) {
      return res.status(400).send("No OTP found for this email.");
    }

    if (otpUser.emailOtp === otp) {
      const user = await LocalUser.findOne({ email: email1 });
      if (!user) {
        return res.status(400).send("User not found.");
      }

      user.verified = true;
      await user.save();
      return res.redirect("/signin?error=User verified, please login");
    } else {
      res.redirect("/signup");
    }
  } catch (error) {
    console.error("Error during OTP verification:", error);
    res.status(500).send("Internal Server Error");
  }
});

// app.get("/createSession", (req, res) => {
//   req.session.email = "myname";
//   res.send("Session created");
//   console.log("I created: " + req.session.email);
// });

// app.get("/checkSession", (req, res) => {
//   if (req.session.email) {
//     res.send("Session exists");
//     console.log("I have: " + req.session.email);
//   } else {
//     res.send("Session does not exist");
//   }
// });

app.get("/otpverify", (req, res) => {
  const email = req.query.email;
  console.log(email);
  res.render("otpverify", { hidemail: email });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  // req.session.email = email;
  console.log(email);
  const currentUser = await LocalUser.findOne({ email });
  if (currentUser) {
    const checkPass = await bcrypt.compare(password, currentUser.password);
    if (checkPass) {
      if (currentUser.verified === false) {
        sendOtpEmail(email, currentUser.username);
        return res.redirect("otpverify" + "?email=" + email);
      }
      req.session.email = email;
      req.session.name = await currentUser.name;
      req.session.username = await currentUser.username;
      await req.session.save();
      return res.redirect("/");
    } else {
      return res.redirect(
        "/signin?error=Incorrect Password, please try again!!"
      );
      // res.send("Incorrect password");
    }
  } else {
    return res.redirect("/signin?error=User not found, please sign up!!");
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) throw err;
    res.redirect("/");
  });
});

app.post("/fetchUserData", async (req, res) => {
  const { email } = req.session.email;
  const userData = await LocalUser.findOne({ email });
  if (userData) {
    res.status(200).json({ userData });
  } else {
    res.status(400).json({ status: 400 });
  }
});

app.post("/checkFCMToken", async (req, res) => {
  const { token } = req.body;
  const username = req.session.username;
  const email = req.session.email;
  const tokenUser = await TokenUser.findOne({ tokenId: token });
  if (tokenUser) {
    res.status(200).send("Token exists");
  } else if (email && username) {
    const tokenUser = new TokenUser({
      username,
      email,
      tokenId: token,
    });
    await tokenUser.save();
    res.status(200).send("Token saved");
  } else {
    res.status(400).send("Token not saved");
  }
});

app.post("/sendNotification", async (req, res) => {
  const { title, body, username } = req.body;
  const user = await TokenUser.find({ username });
  if (user) {
    for (let i = 0; i < user.length; i++) {
      sendNotification(user[i].tokenId, title, body);
    }
    res.status(200).send("Notification sent");
  } else {
    res.status(400).send("User not found");
  }
});

app.post("/searchDonors", async (req, res) => {
  console.log("------------------------------------------");
  const requestorUsername = req.session.username;
  const requestorEmail = req.session.email;
  const { hospitalPlaceId, bdGroup } = req.body;

  try {
    let donors = await Donor.find({
      hospitals: { $elemMatch: { placeId: hospitalPlaceId } },
    });

    donors = donors.filter((donor) => donor.username !== requestorUsername);

    if (donors.length > 0) {
      const hospitalName = donors[0].hospitals.find(
        (place) => place.placeId === hospitalPlaceId
      ).name;
      addRequestToSelfRecords(
        requestorUsername,
        requestorEmail,
        bdGroup,
        hospitalName,
        hospitalPlaceId,
        donors.length
      );

      donors.forEach(async (donor) => {
        addRequestToDonorRecords(
          donor.name,
          donor.username,
          donor.email,
          bdGroup,
          hospitalName,
          requestorUsername,
          hospitalPlaceId
        );

        const donorTokenId = await TokenUser.find({ email: donor.email });
        donorTokenId.forEach((donor) => {
          sendNotification(
            donor.tokenId,
            "Donation Request",
            "Blood donation request from a user"
          );
        });

        sendMail(
          donor.email,
          donor.name,
          "Donation Request",
          `Blood donation request from a user at a nearby hospital
          To respond, visit the website: ${url}/dashboard
          `
        );

        const Local = await LocalUser.findOne({ email: donor.email });
        const mobile = `+91${Local.mobile}`;
        console.log(mobile);
        console.log(typeof mobile);
        const message = `
              Hi ${donor.name},
      
              You have a Blood Donation request from a user at a nearby hospital. Please visit the website to respond.
              Visit the website: https://real-time-blood-donation.onrender.com/dashboard
      
              Thank you for your support.
              `;
        // sendWhatsappMessage(mobile, message);
        const mobile2 = `91${Local.mobile}`;
        sendVonageMessage(mobile2, message);
      });
      res.status(200).send("Donors found");
    } else {
      res.status(500).send("No donors found");
    }
  } catch (error) {
    console.error("Error during search for donors:", error);
    res.status(500).send("Internal Server Error");
  }
});

async function addRequestToDonorRecords(
  name,
  username,
  email,
  bdGroup,
  hospitalName,
  requestorUsername,
  hospitalPlaceId
) {
  const duplicate = await RequestsForDonor.findOne({
    username,
    requestorUsername,
    hospitalPlaceId,
  });
  if (duplicate) {
    return;
  }
  const newRequest = new RequestsForDonor({
    username,
    email,
    bloodGroup: bdGroup,
    requestorUsername,
    hospitalName,
    hospitalPlaceId,
  });
  await newRequest.save();

  // notifyUser(
  //   name,
  //   username,
  //   email,
  //   bdGroup,
  //   requestorUsername,
  //   hospitalPlaceId
  // );
}

// async function notifyUser(
//   name,
//   username,
//   email,
//   bdGroup,
//   requestorUsername,
//   hospitalPlaceId
// ) {
// }

function sendMail(to, name, subject, text) {
  const mailOptions = {
    from: "coderangersverify@gmail.com",
    to: to,
    subject: subject,
    text: `Hi ${name},
    
    ${text}
    
   `,
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      return res.send("Failed to send mail");
    } else {
      console.log("Email sent: " + info.response);
    }
  });
}

app.get("/dashboard", (req, res) => {
  if (req.session.email) {
    return res.render("dashboard", { userLoggedIn: true });
  } else {
    return res.redirect("/signin?Login to continue");
  }
});

async function addRequestToSelfRecords(
  username,
  email,
  bdGroup,
  hospitalName,
  hospitalPlaceId,
  hospitalCount
) {
  const dup = await sentRequest.findOne({ username, hospitalPlaceId });
  if (dup) {
    if (dup.donorCount === hospitalCount) {
      return;
    } else {
      await sentRequest.updateOne(
        { username, hospitalPlaceId },
        { donorCount: hospitalCount }
      );
    }
  }
  const newRequest = new sentRequest({
    username,
    email,
    bloodGroup: bdGroup,
    hospitalName: hospitalName,
    donorCount: hospitalCount,
    hospitalPlaceId,
  });

  await newRequest.save();
}

// app.post("/api/donationrequests", async (req, res) => {
//   const username = req.session.username;
//   const myDonorRequests = await RequestsForDonor.find({ username });
//   const donorHospitals = await Donor.findOne({ username });
//   const sentRequests = await sentRequest.find;
//   let finalizedData = [];
//   let requiredHospitals = [];

//   const isReserved = await RequestsForDonor.findOne({ accepted: true });
//   console.log(isReserved);
//   if (isReserved) {
//     res.status(300).send("Request already accepted", isReserved);
//   } else {
//     if (myDonorRequests.length > 0) {
//       let requiredHospitalsIds = myDonorRequests.map(
//         (request) => request.hospitalPlaceId
//       );
//       myDonorRequests.forEach(async (request) => {
//         let ob1 = {
//           username: request.requestorUsername,
//           bloodGroup: request.bloodGroup,
//           hospitalPlaceId: request.hospitalPlaceId,
//           dateRequested: request.DateRequested,
//         };
//         requiredHospitals.push(ob1);
//       });

//       donorHospitals.hospitals.forEach((hospital) => {
//         requiredHospitals.forEach((request) => {
//           if (hospital.placeId === request.hospitalPlaceId) {
//             let date = new Date(request.dateRequested);
//             let ob2 = {
//               requestorUsername: request.username,
//               bloodGroup: request.bloodGroup,
//               hospitalPlaceId: request.hospitalPlaceId,
//               hospitalName: hospital.name,
//               dateRequested: date.toLocaleDateString(),
//             };
//             finalizedData.push(ob2);
//           }
//         });
//       });
//     }
//     res.status(200).send(finalizedData);
//   }
// });

app.post("/api/donationrequests", async (req, res) => {
  const username = req.session.username;
  const myDonorRequests = await RequestsForDonor.find({ username });
  const donorHospitals = await Donor.findOne({ username });
  const sentRequests = await sentRequest.find;
  let finalizedData = [];
  let requiredHospitals = [];

  const isReserved = await RequestsForDonor.findOne({
    username,
    accepted: true,
  });

  const acceptedData = await AcceptedRequests.findOne({
    acceptorUsername: username,
  });

  if (acceptedData) {
    console.log("-------------------------");
    console.log(acceptedData);
    res.status(300).json({
      message: "Request already accepted",
      data: { isReserved, acceptedData },
    });
  } else {
    if (myDonorRequests.length > 0) {
      let requiredHospitalsIds = myDonorRequests.map(
        (request) => request.hospitalPlaceId
      );
      myDonorRequests.forEach(async (request) => {
        let ob1 = {
          username: request.requestorUsername,
          bloodGroup: request.bloodGroup,
          hospitalPlaceId: request.hospitalPlaceId,
          dateRequested: request.DateRequested,
        };
        requiredHospitals.push(ob1);
      });

      donorHospitals.hospitals.forEach((hospital) => {
        requiredHospitals.forEach((request) => {
          if (hospital.placeId === request.hospitalPlaceId) {
            let date = new Date(request.dateRequested);
            let ob2 = {
              requestorUsername: request.username,
              bloodGroup: request.bloodGroup,
              hospitalPlaceId: request.hospitalPlaceId,
              hospitalName: hospital.name,
              dateRequested: date.toLocaleDateString(),
            };
            finalizedData.push(ob2);
          }
        });
      });
    }
    res.status(200).json(finalizedData);
  }
});

app.post("/api/sentrequests", async (req, res) => {
  const username = req.session.username;
  const myRequests = await sentRequest.find({
    username,
  });
  let requiredHospitals = [];
  const donorHospitals = await Donor.findOne({ username });
  let sentHospitals = [];

  let finalizedData = [];

  if (myRequests.length > 0) {
    myRequests.forEach(async (request) => {
      let date = new Date(request.DateRequested);
      let ob1 = {
        bloodGroup: request.bloodGroup,
        hospitalName: request.hospitalName,
        hospitalPlaceId: request.hospitalPlaceId,
        donorCount: request.donorCount,
        dateRequested: date.toLocaleDateString(),
        satisfied: request.satisfied,
      };
      requiredHospitals.push(ob1);
    });

    // donorHospitals.hospitals.forEach((hospital) => {
    //   requiredHospitals.forEach((request) => {
    //     if (hospital.placeId === request.hospitalPlaceId) {
    //       let date = new Date(request.dateRequested);
    //       let ob2 = {
    //         bloodGroup: request.bloodGroup,
    //         hospitalName: hospital.name,
    //         donorCount: request.donorCount,
    //         satisfied: request.satisfied,
    //         dateRequested: date.toLocaleDateString(),
    //       };
    //       finalizedData.push(ob2);
    //     }
    //   });
    // });
    finalizedData = requiredHospitals;
  }
  res.status(200).send(finalizedData);
});

app.post("/api/acceptrequest", async (req, res) => {
  const { requestorUsername, hospitalPlaceId } = req.body;
  const username = req.session.username;
  const requestorRequests = await sentRequest.findOne({
    username: requestorUsername,
    hospitalPlaceId,
  });

  const donorRequests = await RequestsForDonor.findOne({
    username,
    requestorUsername,
    hospitalPlaceId,
  });
  const donorDetails = await LocalUser.findOne({ username: username });
  const requestorDetails = await LocalUser.findOne({
    username: requestorUsername,
  });

  const acceptedRequests = await new AcceptedRequests({
    requestorUsername,
    requestorMobile: requestorDetails.mobile,
    acceptorUsername: username,
    hospitalPlaceId,
    hospitalName: requestorRequests.hospitalName,
    acceptorMobile: donorDetails.mobile,
    acceptorBloodGroup: donorDetails.bloodgroup,
  });

  await acceptedRequests.save();
  if (donorRequests) {
    donorRequests.accepted = true;
    await donorRequests.save();
  } else {
    res.status(400).send("Request not found");
  }

  const deleteOtherRequests = await RequestsForDonor.deleteMany({
    requestorUsername,
    hospitalPlaceId,
    username: { $ne: username },
  });
  console.log("---------------------------");
  console.log(deleteOtherRequests);

  if (requestorRequests) {
    requestorRequests.satisfied = true;
    await requestorRequests.save();
    res.status(200).send("Request accepted");
  } else {
    res.status(400).send("Request not found");
  }
});

app.post("/api/declinerequest", async (req, res) => {
  const { requestorUsername, hospitalPlaceId } = req.body;
  const username = req.session.username;
  const donorRequests = await RequestsForDonor.deleteOne({
    username,
    requestorUsername,
    hospitalPlaceId,
  });

  if (donorRequests) {
    res.status(200).send("Request declined");
  } else {
    res.status(400).send("Request not found");
  }
});

app.post("/api/satisfiedrequests", async (req, res) => {
  const { data } = req.body;
  var finalizedData = [];
  for (const request of data) {
    const username = req.session.username;
    const hospitalPlaceId = request.hospitalPlaceId;
    const hospitalName = request.hospitalName;

    const acceptorDetails = await AcceptedRequests.findOne({
      requestorUsername: username,
      hospitalPlaceId,
    });

    if (acceptorDetails !== null) {
      finalizedData.push(acceptorDetails);
    }
  }
  if (finalizedData.length > 0) {
    res.status(200).send(finalizedData);
  } else {
    res.status(300).send("No satisfied requests found");
  }
});

app.post("/api/cancelrequests", async (req, res) => {
  const { requestPlaceId } = req.body;
  const username = req.session.username;

  const donorRequests = await RequestsForDonor.deleteMany({
    requestorUsername: username,
    hospitalPlaceId: requestPlaceId,
  });
  console.log(donorRequests);
  const sentRequests = await sentRequest.deleteOne({
    username,
    hospitalPlaceId: requestPlaceId,
  });
  console.log(donorRequests);
  if (donorRequests && sentRequests) {
    res.status(200).send("Requests cancelled");
  } else {
    res.status(400).send("Requests not found");
  }
});

app.post("/api/chatUsers", async (req, res) => {
  console.log("In chat users");
  const username = req.session.username;
  console.log(username);
  const requestors = await AcceptedRequests.find({
    acceptorUsername: username,
  });
  console.log(requestors);
  const donors = await AcceptedRequests.find({ requestorUsername: username });
  console.log(donors);
  res.status(200).json({ requestors, donors });
});

// app.post("/api/chatMessages/:to", async (req, res) => {
//   const { to } = req.params;
//   const from = req.session.username;
// });

app.post("/api/myUserName", async (req, res) => {
  console.log(req.session.username);
  const username = await req.session.username;
  console.log(username);
  res.status(200).json({ username });
});

app.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await LocalUser.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const uniqueResetToken = crypto.randomBytes(32).toString("hex");
    console.log(uniqueResetToken);

    const hashedToken = crypto
      .createHash("sha256")
      .update(uniqueResetToken)
      .digest("hex");

    console.log("------------------------");
    console.log(hashedToken);

    const newToken = new resetToken({
      userId: user._id,
      token: hashedToken,
      expiresAt: Date.now() + 3600000, // Token expires in 1 hour
    });

    newToken.save();

    // Generate the password reset link
    const resetLink = `https://real-time-blood-donation.onrender.com/reset-password/${uniqueResetToken}`;

    await transporter.sendMail({
      from: "coderangersverify@gmail.com",
      to: email,
      subject: "Password Reset",
      html: `<p>Click the link below to reset your password:</p>
             <a href="${resetLink}">${resetLink}</a>
             <p>The link will expire in 1 hour.</p>`,
    });

    res
      .status(200)
      .json({ message: "Password reset link sent to your email." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong." });
  }
});

app.get("/reset-password", (req, res) => {
  res.render("signin");
});

app.get("/reset-password/:token", async (req, res) => {
  const { token } = req.params;

  try {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const tokenDoc = await resetToken.findOne({
      token: hashedToken,
      expiresAt: { $gt: Date.now() },
    });

    if (!tokenDoc) {
      return res.status(400).json({ message: "Invalid or expired token." });
    }

    res.render("resetpass", { token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong." });
  }
});

app.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const tokenDoc = await resetToken.findOne({
      token: hashedToken,
      expiresAt: { $gt: Date.now() },
    });

    if (!tokenDoc) {
      return res.status(400).json({ message: "Invalid or expired token." });
    }

    const user = await LocalUser.findById(tokenDoc.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    await resetToken.findByIdAndDelete(tokenDoc._id);

    res.status(200).json({ message: "Password reset successful." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong." });
  }
});
app.get("/sos", async (req, res) => {
  if (req.session.email) {
    res.render("sos", { userLoggedIn: true });
  } else {
    res.render("sos", { userLoggedIn: false });
  }
});

app.post("/sos", async (req, res) => {
  const { data } = req.body;
  const { name, phone, bloodGroup, hospital, place_id, selectedHospitals } =
    data;
  let uniqueDonors = [];
  const duplicate = await sosRequest.findOne({ phone });
  if (duplicate) {
    return res.status(400).json({ message: "Request already exists" });
  }
  const newSosRequest = new sosRequest({
    name,
    phone,
    bloodGroup,
    hospitalName: hospital,
    hospitalPlaceId: place_id,
  });
  await newSosRequest.save();

  selectedHospitals.forEach(async (hospitalele) => {
    const donors = await Donor.find({
      hospitals: { $elemMatch: { placeId: hospitalele.hospitalPlaceId } },
      bloodGroup,
    });
    donors.forEach(async (donor) => {
      const yesno = uniqueDonors.includes(donor.username);
      if (!yesno) {
        uniqueDonors.push(donor.username);
        const dupl = await sosReqForDonor.findOne({
          username: donor.username,
          hospitalPlaceId: hospital.place_id,
          requestorPhone: phone,
        });
        if (dupl) {
          return;
        }
        const newSosRequestForDonor = new sosReqForDonor({
          donorName: donor.name,
          donorUsername: donor.username,
          bloodGroup: bloodGroup,
          requestorPhone: phone,
          hospitalName: hospital,
          hospitalPlaceId: place_id,
        });
        await newSosRequestForDonor.save();
        const donorTokenId = await TokenUser.find({ email: donor.email });
        donorTokenId.forEach((donor) => {
          sendNotification(
            donor.tokenId,
            "SOS Request",
            `Mobile Number: ${phone} Urgent blood donation request from a nearby hospital`
          );
        });
        sendMail(
          donor.email,
          donor.name,
          "SOS Request",
          `Urgent Blood Donation request from a nearby hospital
        To contact the donor, please call ${phone}, or visit the website: ${url}/dashboard
        `
        );

        const Local = await LocalUser.findOne({ email: donor.email });
        const mobile = `+91${Local.mobile}`;
        const message = `
            Hi ${donor.name},

           Urgent Blood Donation request from a nearby hospital. To Contact the requestor, please call ${phone} or visit the website.

            To Visit Website: https://real-time-blood-donation.onrender.com/dashboard

            Thank you for your support.
            `;
        // sendWhatsappMessage(mobile, message);
        const mobile2 = `91${Local.mobile}`;
        sendVonageMessage(mobile2, message);
      }
    });
  });
  return res.status(200).json({ message: "Request sent" });
});

app.post("/api/sosrequests", async (req, res) => {
  const username = req.session.username;

  // Fetch all requests for the donor
  const mySosRequests = await sosReqForDonor.find({ donorUsername: username });

  // Use Promise.all to handle asynchronous mapping
  const finalizedData = await Promise.all(
    mySosRequests.map(async (request) => {
      return {
        requestorPhone: request.requestorPhone,
        bloodGroup: request.bloodGroup,
        hospitalName: request.hospitalName,
        hospitalPlaceId: request.hospitalPlaceId,
      };
    })
  );

  // Log the finalized data

  // Send response after data is fully prepared
  res.status(200).json({ finalizedData });
});

app.use((req, res, next) => {
  res.status(404).render("error", {
    message: "Page not found! The route you requested does not exist.",
  });
});

app.use((err, req, res, next) => {
  console.error("Server Error:", err); // Log the error details for debugging

  // Send a user-friendly error message to the client
  res.status(500).render("error", {
    message: err.message || "An unexpected error occurred",
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
