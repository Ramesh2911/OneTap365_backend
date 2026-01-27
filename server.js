import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import db from "./db/db.js";

// create http server
const server = http.createServer(app);

// init socket.io
export const io = new Server(server, {
  cors: {
    origin: "*", // set frontend URL in production
    methods: ["GET", "POST", "PUT"]
  }
});

// socket connection
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("join", (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User joined room: user_${userId}`);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

// DB check + server start
(async () => {
  try {
    const connection = await db.getConnection();
    console.log("Database connected successfully");
    connection.release();

    server.listen(process.env.PORT, () => {
      console.log(`Server running: http://localhost:${process.env.PORT}`);
    });
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
})();
