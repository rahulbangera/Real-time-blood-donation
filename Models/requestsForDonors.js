import mongoose from "mongoose";
import dotenv from "dotenv"

dotenv.config()

const DB_URL = process.env.DATABASE_URL || "";

try {
  mongoose.connect(
    DB_URL
  );  
} catch (error) {
  console.error("Error connecting to MongoDB:", error);
}

const requestsForDonorsSchema = new mongoose.Schema({
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
  requestorUsername: {
    type: String,
  },
  hospitalName: {
    type: String,
    required: true,
  },
  hospitalPlaceId: {
    type: String,
  },
  DateRequested: {
    type: Date,
    default: Date.now,
  },
  accepted: {
    type: Boolean,
    default: false,
  },
});

const RequestsForDonor = mongoose.model(
  "RequestsForDonor",
  requestsForDonorsSchema
);

export default RequestsForDonor;
