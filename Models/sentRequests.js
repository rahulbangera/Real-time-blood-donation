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

const sentrequestschema = new mongoose.Schema({
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
  donorCount: {
    type: Number,
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
  satisfied:{
    type: Boolean,
    default: false,
  },
  DateRequested: {
    type: Date,
    default: Date.now,
  },
});

const sentRequest = mongoose.model(
  "sentRequest",
  sentrequestschema
);

export default sentRequest;
