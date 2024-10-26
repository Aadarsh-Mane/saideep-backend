import mongoose from "mongoose";
const dbURI =
  "mongodb+srv://20sdeveloper4209:vijay207@cluster0.yxnl8.mongodb.net/doctor?retryWrites=true&w=majority&appName=doctorEcosystem";

export const connectDB = async () => {
  try {
    await mongoose.connect(dbURI);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.log(dbURI);
    console.error("Failed to connect to MongoDB", err.message);
    process.exit(1);
  }
};
