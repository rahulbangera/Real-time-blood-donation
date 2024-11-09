import mongoose from "mongoose";

try {
  mongoose.connect(
    "mongodb+srv://myAtlasDBUser:Hero123456@test1.bu7v6.mongodb.net/bloodDonation?retryWrites=true&w=majority&appName=Test1"
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
