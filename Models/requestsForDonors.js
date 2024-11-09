import mongoose from "mongoose";

try {
  mongoose.connect(
    "mongodb+srv://myAtlasDBUser:Hero123456@test1.bu7v6.mongodb.net/bloodDonation?retryWrites=true&w=majority&appName=Test1"
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
  hospitalPlaceId: {
    type: String,
  },
});

const RequestsForDonor = mongoose.model(
  "RequestsForDonor",
  requestsForDonorsSchema
);

export default RequestsForDonor;
