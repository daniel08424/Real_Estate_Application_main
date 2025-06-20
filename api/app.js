import express from "express";
import userAuth from "./routes/auth.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import testRoutes from "./routes/test.js";
import userRoute from "./routes/user.js";
import postRoute from "./routes/post.js";
import chatRoutes from "./routes/chat.js";
import messageRoutes from "./routes/message.js";

const app = express();

const corsOptions = {
    origin: 'http://localhost:5173',
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
    allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization"]
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Preflight request handling

app.use(express.json());
app.use(cookieParser());

// Your routes
app.use("/api/auth/", userAuth);
app.use("/api/testroute", testRoutes);
app.use("/api/users", userRoute);
app.use("/api/posts", postRoute);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);

app.listen(8000, () => {
    console.log("Server running on 8000");
});
