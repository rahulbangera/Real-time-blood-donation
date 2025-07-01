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

const tokenUserSchema = new mongoose.Schema({
    username: {
    type: String,
    required: true,
    },
    email: {
    type: String,
    required: true,
    },
    tokenId: {
    type: String,
    required: true,
    },
});

const TokenUser = mongoose.model("TokenUser", tokenUserSchema);

export default TokenUser;
