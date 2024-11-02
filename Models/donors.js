import e from "express";
import mongoose from "mongoose";

try {
    mongoose.connect(
      "mongodb+srv://myAtlasDBUser:Hero123456@test1.bu7v6.mongodb.net/bloodDonation?retryWrites=true&w=majority&appName=Test1"
    );
  
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }

  const donorUserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
      },
    email: {
      type: String,
      required: true,
    },
    bloodGroup: {
      type: String,
      required: true,
    },
    latitude: {
        type: Number,
        required: true,
        },
    longitude: {
        type: Number,
        required: true,
        },
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    zip: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  });

  const Donor = mongoose.model("Donor", donorUserSchema);

  export default Donor;
