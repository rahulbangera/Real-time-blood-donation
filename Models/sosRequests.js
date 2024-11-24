import mongoose from "mongoose";

try {
  mongoose.connect(
    "mongodb+srv://myAtlasDBUser:Hero123456@test1.bu7v6.mongodb.net/bloodDonation?retryWrites=true&w=majority&appName=Test1"
  );
} catch (error) {
  console.error("Error connecting to MongoDB:", error);
}

const sosRequestsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  bloodGroup: {
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

sosRequestsSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 86400 });

const sosRequest = mongoose.model("sosRequest", sosRequestsSchema);

export default sosRequest;
