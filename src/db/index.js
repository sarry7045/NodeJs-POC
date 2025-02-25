import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.SQL_URL}/${DB_NAME}`
    );
    console.log("connectionInstance", connectionInstance);
  } catch (error) {
    console.error("ERROR", error);
    throw error;
  }
};

export default connectDB;


// We have to Change this code for SQL Connection
