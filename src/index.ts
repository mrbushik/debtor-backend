import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import mongoose from "mongoose";
import router from "./router/router";
import { errorMiddleware } from "./middlewares/errorMiddleware";
import cors from "cors";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
console.log(process.env.PORT);
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || '',
    credentials: true,
  }),
);
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", process.env.FRONTEND_URL || '');
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});
const logger = morgan("combined");
app.use(logger);
app.use(cookieParser());
app.use(router);
app.use(errorMiddleware);

const testSchema = new mongoose.Schema({
  news: String,
});

const TestModel = mongoose.model("test", testSchema);
mongoose
  .connect(process.env.MONGO_URI || "")
  .then(() => console.log("MongoDb connected"))
  .catch((err) => console.log(err));

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
