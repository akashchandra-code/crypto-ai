import express from "express";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes.js";
import chatRouter from "./routes/chat.routes.js";
import morgan from "morgan";
import cors from "cors";
import path from "path";

const app = express();
const _dirname = path.resolve();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));
app.use(cors({
    origin: "https://crypto-ai-gq4m.onrender.com",
    credentials: true,
    methods: [ "GET", "POST", "PUT", "DELETE" ],
}))
app.use(express.static(path.join(_dirname, "frontend", "dist")));

// Health check
app.get("/", (req, res) => {
    res.json({ message: "Server is running" });
});

app.use("/api/auth", authRouter);
app.use("/api/chats", chatRouter);



app.get(/^(?!\/api).*/, (_, res) => {
  res.sendFile(
    path.resolve(_dirname, "frontend", "dist", "index.html")
  );
});

export default app;