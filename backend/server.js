const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const app = express();

/* -------- CONNECT DATABASE -------- */

connectDB();

/* -------- MIDDLEWARE -------- */

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use("/uploads", express.static("uploads"));


/* -------- ROUTES -------- */

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/items", require("./routes/itemRoutes"));
app.use("/api/hostels", require("./routes/hostels"));
app.use("/api/orders", require("./routes/orderRoutes"));

/* -------- TEST ROUTE -------- */

app.get("/", (req, res) => {
  res.send("Backend + MongoDB working 🚀");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🔥`);
});