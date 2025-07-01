import mongoose from "mongoose";
import dotenv from "dotenv"

dotenv.config()

const DB_URL = process.env.DATABASE_URL || "";

const mongoUrl = DB_URL;

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
