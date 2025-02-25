import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

// app.use(express.json({ limit: "16kb" })); // We can change it, according to our Requirments
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "16kb" })); // for Sapce in URL like - Best Deal - it's Covert to like this Best%Deal
app.use(express.static("public"));
app.use(cookieParser()); // for Access and Set the Cookies of Broswer

export { app };