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

const acceptedRequestsSchema = new mongoose.Schema({
  requestorUsername: {
    type: String,
    required: true,
  },
  requestorMobile: {
    type: Number,
    required: true,
  },
  acceptorUsername: {
    type: String,
    required: true,
    unique: true,
  },
  acceptorMobile: {
    type: Number,
    required: true,
  },
  acceptorBloodGroup: {
    type: String,
    required: true,
  },
  hospitalPlaceId: {
    type: String,
    required: true,
  },
  hospitalName: {
    type: String,
    required: true,
  },
  dateAccepted: {
    type: Date,
    default: Date.now,
  },
});

const AcceptedRequests = mongoose.model(
  "AcceptedRequest",
  acceptedRequestsSchema
);

export default AcceptedRequests;
