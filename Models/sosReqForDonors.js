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

const sosReqForDonors = new mongoose.Schema({
  donorName: {
    type: String,
    required: true,
  },
  donorUsername: {
    type: String,
    required: true,
  },
  bloodGroup: {
    type: String,
    required: true,
  },
  requestorPhone: {
    type: String,
    required: true,
  },
  hospitalName: {
    type: String,
    required: true,
  },
  hospitalPlaceId: {
    type: String,
    required: true,
  },
  DateRequested: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    default: Date.now,
  },
});

sosReqForDonors.index({ expiresAt: 1 }, { expireAfterSeconds: 86400 });

const sosReqForDonor = mongoose.model(
  "sosReqForDonor",
  sosReqForDonors
);

export default sosReqForDonor;
