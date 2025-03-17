const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");
const weatherRoutes = require("./routes/weatherRoutes");  // ✅ Import Weather Routes

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// ✅ Use authentication & weather routes
app.use("/api/auth", authRoutes);
app.use("/api/weather", weatherRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
