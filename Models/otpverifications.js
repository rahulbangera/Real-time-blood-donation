import mongoose from "mongoose";

try {
  mongoose.connect(
    "mongodb+srv://myAtlasDBUser:Hero123456@test1.bu7v6.mongodb.net/bloodDonation?retryWrites=true&w=majority&appName=Test1"
  );

} catch (error) {
  console.error("Error connecting to MongoDB:", error);
}

const otpSchema = new mongoose.Schema({
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
  emailOtp: {
    type: Number,
    required: true,
  },
});

const Otps = mongoose.model("Otp", otpSchema);

export default Otps;
