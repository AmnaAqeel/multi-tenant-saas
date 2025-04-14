import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";

import { connectDB } from "./config/db.js";
import { setupSocket } from "./socket/index.js";
import { allowedOrigins } from "./config/cors.js";
import app from "./app.js";

const PORT = process.env.PORT || 5000;

dotenv.config();
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

setupSocket(io); // this is where you'll define connection logic

// Export if needed elsewhere
export { io };

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB(); // connect to MongoDB
});
