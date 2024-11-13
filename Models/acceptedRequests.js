import mongoose from "mongoose";

try {
  mongoose.connect(
    "mongodb+srv://myAtlasDBUser:Hero123456@test1.bu7v6.mongodb.net/bloodDonation?retryWrites=true&w=majority&appName=Test1"
  );

} catch (error) {
  console.error("Error connecting to MongoDB:", error);
}

const acceptedRequestsSchema = new mongoose.Schema({
requestorUsername: {
    type: String,
    required: true,
    unique: true,
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
dateAccepted: {
    type: Date,
    default: Date.now,
  },
});

const AcceptedRequests = mongoose.model("AcceptedRequest", acceptedRequestsSchema);

export default AcceptedRequests;
