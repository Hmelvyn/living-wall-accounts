import "dotenv/config";
import express from "express";
import cors from "cors";
import Router from "./views/router.js";

const port = process.env.PORT || 3000;
const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
  })
);
app.use(express.json());
app.use(Router);
app.use((err, req, res, next) => {
  console.error(err);
  const statusCode =
    Number.isInteger(err.status) && err.status >= 400 && err.status < 500
      ? err.status
      : 500;
  res
    .status(statusCode)
    .json({ message: "An unexpected server error occurred" });
});

async function startServer() {
  try {
    app.listen(port, () => console.log(`🤖 Listening on Port: ${port}`));
  } catch (err) {
    console.log("🤖 Oh no something went wrong", err);
  }
}

startServer();
