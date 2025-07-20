import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import sequelize from "./models/database.js";
import userRoutes from "./routes/user.route.js";
import authRoutes from "./routes/auth.route.js";
import eventRoutes from "./routes/event.route.js";
import initializeAdmin from "./initializeAdmin.js";

dotenv.config();
const __dirname = path.resolve();
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "/client/dist")));

app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/event", eventRoutes);

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(statusCode).json({ success: false, statusCode, message });
});

(async () => {
  try {
    await sequelize.authenticate();
    console.log("MySQL AWS Instance connected successfully.");

    await sequelize.sync({ alter: true });
    await initializeAdmin();
  } catch (error) {
    console.error("Initialization error:", error.message);
    process.exit(1);
  }

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
})();
