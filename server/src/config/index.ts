import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: Number(process.env.PORT || 5000),
  jwtSecret: process.env.JWT_SECRET || "secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1h",
  mongodbUri: process.env.DATABASE_URL || "mongodb://localhost:27017/taskify",
  nodeEnv: process.env.NODE_ENV || "development",
};