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
  name: {
    type: String,
    required: true,
  },
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
  hospitals: [
    {
      placeId: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      location: {
        lat: {
          type: Number,
          required: true,
        },
        lng: {
          type: Number,
          required: true,
        },
      },
    },
  ],
  location: {
    sublocality: {
      type: String,
      required: true,
    },
    town: {
      type: String,
      required: true,
    },
  },
  date: {
    type: Date,
    default: Date.now,
    expires: 2592000, // expires in 30 days (30 days * 24 hours * 60 minutes * 60 seconds)
  },
});

const Donor = mongoose.model("Donor", donorUserSchema);

export default Donor;
