import mongoose from "mongoose";

try {
  mongoose.connect(
    "mongodb+srv://myAtlasDBUser:Hero123456@test1.bu7v6.mongodb.net/bloodDonation?retryWrites=true&w=majority&appName=Test1"
  );
} catch (error) {
  console.error("Error connecting to MongoDB:", error);
}

const tokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  token: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});

const resetToken = mongoose.model(
  "resetToken",
  tokenSchema
);

export default resetToken;
