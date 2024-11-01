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

const app = e();
const PORT = 5000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(e.static("public"));
app.use(e.json());
app.use(e.urlencoded({ extended: true }));
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(
  session({
    secret: "yourSecret",
    resave: false,
    saveUninitialized: false,
  })
);
// service: "smtp.gmail.com",
//   auth: {
//     user: "coderangersverify@gmail.com",
//     pass: "vzhykowzuabnjscw ",
//   }

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: "coderangersverify@gmail.com",
    pass: "vzhykowzuabnjscw ",
  },
});


app.get("/", (req, res) => {
  if (req.session.email) {
    res.render("welcome", { userLoggedIn: true });
  }
  else{
    res.render("welcome", { userLoggedIn: false });
  }
});

app.get("/profile", (req, res) => {
  res.render("components/mapping");
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/requestblood", (req, res) => {
if (req.session.email) {
    res.render("request", { userLoggedIn: true });
  }
  else{
    res.render("request", { userLoggedIn: false });
  }});

app.get("/donateblood", (req, res) => {
  if (req.session.email) {
    res.render("donate", { userLoggedIn: true });
  }
  else{
    res.render("donate", { userLoggedIn: false });
  }
});

app.post("/signup", async (req, res) => {
  const data = req.body;
  const { name, userName, email, password, mbNumber, bdGroup } = data; // Destructure for cleaner access
  const verified = false;

  console.log("in");
  req.session.username = userName;

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

      // Save the new user and set session variables
      const savedUser = await newUser.save();
      req.session.email = savedUser.email; // Set session variables
      req.session.name = savedUser.name;
      console.log(`Session email: ${req.session.email}`); // Check if it's set

      // Generate OTP
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

      await newOtpUser.save(); // Save OTP user
      req.session.email = await newOtpUser.email; // Set session variables
      // Send OTP email
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
  const { hidemail } = req.body;
  console.log(hidemail);
  console.log(req.session.email);
  const email = hidemail;
  let { otp } = req.body;
  console.log(otp);
  otp = parseInt(otp);

  try {
    const otpUser = await Otps.findOne({ email });
    if (!otpUser) {
      return res.status(400).send("No OTP found for this email.");
    }

    if (otpUser.emailOtp === otp) {
      const user = await LocalUser.findOne({ email });
      if (!user) {
        return res.status(400).send("User not found.");
      }

      user.verified = true;
      userLoggedIn = true;
      await user.save();
      res.send("User verified");
    } else {
      res.send("Invalid OTP");
    }
  } catch (error) {
    console.error("Error during OTP verification:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/createSession", (req, res) => {
  req.session.email = "myname";
  res.send("Session created");
  console.log("I created: " + req.session.email);
});

app.get("/checkSession", (req, res) => {
  if (req.session.email) {
    res.send("Session exists");
    console.log("I have: " + req.session.email);
  } else {
    res.send("Session does not exist");
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log(email);
  const currentUser = await LocalUser.findOne({ email });
  if (currentUser) {
    if (currentUser.password === password) {
      userLoggedIn = true;
      req.session.email = currentUser.email;
      req.session.name = currentUser.name;
      req.session.username = currentUser.username;
      res.redirect("/");
    } else {
      res.send("Incorrect password");
    }
  } else {
    res.send("User not found");
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) throw err;
    res.redirect("/");
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
