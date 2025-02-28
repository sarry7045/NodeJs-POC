import mongoose, { Schema } from "mongoose";

const weatherSchema = new Schema({
  weather: {
    type: String,
  },
});
