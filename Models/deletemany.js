import mongoose from "mongoose";

// try {
//   mongoose.connect(
//     "mongodb+srv://myAtlasDBUser:Hero123456@test1.bu7v6.mongodb.net/bloodDonation?retryWrites=true&w=majority&appName=Test1"
//   );

// } catch (error) {
//   console.error("Error connecting to MongoDB:", error);
// }

const mongoUrl =
  "mongodb+srv://myAtlasDBUser:Hero123456@test1.bu7v6.mongodb.net/bloodDonation?retryWrites=true&w=majority&appName=Test1";

const deleteCollections = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(mongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to MongoDB");

    // Get the connection to the database
    const db = mongoose.connection.db;

    // Get the list of collections
    const collections = await db.listCollections().toArray();

    // Delete each collection
    for (const collection of collections) {
      await db.collection(collection.name).drop();
      console.log(`Deleted collection: ${collection.name}`);
    }

    console.log("All collections deleted successfully");
  } catch (error) {
    console.error("Error deleting collections:", error);
  } finally {
    // Close the MongoDB connection
    mongoose.connection.close();
  }
};

// Run the function
deleteCollections();
