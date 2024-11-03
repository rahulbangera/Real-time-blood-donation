import e from "express";
import http, { createServer } from "http";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import ejs from "ejs";
import mongoose from "mongoose";
import mongo from "mongodb";
import nodemailer from "nodemailer";
import LocalUser from "./Models/localuser";
import session from "express-session";
import Otps from "./Models/otpverifications.js";
import bodyParser from "body-parser";
import MongoStore from "connect-mongo";
import Donor from "./Models/donorModel.js";

const app = e();
const PORT = process.env.PORT || 5000;

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "coderangersverify@gmail.com",
    pass: "vzhykowzuabnjscw ",
  },
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

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
      secure: false, // true if HTTPS
    },
  })
);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(e.static("public"));
app.use(e.json());
app.use(e.urlencoded({ extended: true }));

// service: "smtp.gmail.com",
//   auth: {
//     user: "coderangersverify@gmail.com",
//     pass: "vzhykowzuabnjscw ",
//   }



  // req.session.email = "testing";


app.get("/", async (req, res) => {

  console.log(req.session.email);
  console.log(req.session.name);
  console.log(req.session.username);
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

app.get("/profile", (req, res) => {
  res.render("components/mapping");
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.get("/signin", (req, res) => {
  res.render("signin");
});

app.post("/nearbysearch", async (req, res) => {
  const { nearbyHospitals, bdGroup } = req.body;
  let selectedHospitals = [];
  for (const hospital of nearbyHospitals) {
    const donorexist = await Donor.find({
      hospitals: {
        $elemMatch: { placeId: hospital.place_id },
      },
      bloodGroup: bdGroup,
    });
    if (donorexist.length > 0) {
      for (let i = 0; i < donorexist.length; i++) {
        // if(donorexist[i].email === req.session.email) {
        //   continue;
        // }
        let loc = `${donorexist[i].location.sublocality}, ${donorexist[i].location.town}`;
        let hospital1 = { name: hospital.name, donorName: donorexist[i].name, donorUserName: donorexist[i].username, donorPlace: loc };
        selectedHospitals.push(hospital1);
      }
    }
  }
  res.status(200).json({ selectedHospitals });
});

app.get("/requestblood", (req, res) => {
  if (req.session.email) {
    res.render("request", { userLoggedIn: true });
  } else {
    res.render("request", { userLoggedIn: false });
  }
});

app.get("/donateblood", async (req, res) => {
  const currentUser = await Donor.findOne({ email: req.session.email });
  console.log(currentUser);
  if (currentUser) {
    res.render("donate", { userLoggedIn: true, active: true });
  } else if (req.session.email) {
    res.render("donate", { userLoggedIn: true, active: false });
  } else {
    res.render("donate", { userLoggedIn: false, active: false });
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
  const data = req.body;
  const { name, userName, email, password, mbNumber, bdGroup } = data;
  const verified = false;

  console.log("in");

  if (name && userName && email && password && mbNumber && bdGroup) {
    console.log("in2");
    try {
      const existingUser = await LocalUser.findOne({ email: email });
      if (existingUser) {
        return res.send("User already exists");
      }

      console.log("in3");
      const newUser = new LocalUser({
        name,
        username: userName,
        email,
        password,
        mobile: mbNumber,
        bloodgroup: bdGroup,
        verified,
      });

      req.session.email = email;
      req.session.name = userName;

      const savedUser = await newUser.save();

      const otp = Math.floor(100000 + Math.random() * 900000);
      const mailOptions = {
        from: "coderangersverify@gmail.com",
        to: email,
        subject: "OTP Verification",
        text: `Your OTP is: ${otp}`,
      };

      const newOtpUser = new Otps({
        username: userName,
        email,
        emailOtp: otp,
      });

      await newOtpUser.save();
      req.session.email = await newOtpUser.email;

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
          return res.send("Failed to send OTP");
        } else {
          console.log("Email sent: " + info.response);
        }
      });
    } catch (error) {
      console.error("Error during signup:", error);
      res.status(500).send("Internal Server Error");
    }
  } else {
    res.send("Please fill all the fields");
  }
});

app.post("/otpVerify", async (req, res) => {
  let { hidemail, otp } = req.body;
  const email1 = hidemail;
  console.log(otp);
  console.log(email1);
  otp = parseInt(otp);

  try {
    const otpUser = await Otps.findOne({ email: email1 });
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
      res.redirect("/signin");
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

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  req.session.email = email;
  console.log(email);
  const currentUser = await LocalUser.findOne({ email });
  if (currentUser) {
    if (currentUser.password === password) {
      req.session.name = currentUser.name;
      req.session.username = currentUser.username;
      res.redirect("/");
    } else {
      res.send("Incorrect password");
    }
  } else {
    res.send("User not found");
  }
  console.log(req.session.email);
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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
