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

const localUserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  mobile: {
    type: Number,
    required: true,
  },
  bloodgroup: {
    type: String,
    required: true,
  },
  verified: {
    type: Boolean,
    default: false,
  },
});

const LocalUser = mongoose.model("LocalUser", localUserSchema);

export default LocalUser;
