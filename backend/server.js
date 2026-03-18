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
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));
app.use("/api/chat", require("./routes/chatRoutes"));

/* -------- TEST ROUTE -------- */

app.get("/", (req, res) => {
  res.send("Backend + MongoDB working 🚀");
});

const PORT = process.env.PORT || 5000;

/* -------- SOCKET.IO SETUP -------- */
const http = require("http");
const { Server } = require("socket.io");
const ChatMessage = require("./models/ChatMessage");
const Conversation = require("./models/Conversation");

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // allow all or your specific frontend URL
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join a specific conversation room
  socket.on("join_chat", (conversationId) => {
    socket.join(conversationId);
    console.log(`User ${socket.id} joined chat ${conversationId}`);
  });

  // Handle incoming message
  socket.on("send_message", async (data) => {
    try {
      const { conversationId, senderId, text } = data;
      
      // Save message to DB
      const newMessage = await ChatMessage.create({
        conversationId,
        sender: senderId,
        text,
      });

      // Update Conversation's lastMessage and unread counts
      const conversation = await Conversation.findById(conversationId);
      if (conversation) {
        conversation.lastMessage = newMessage._id;
        
        // Increment unread count for the other participant
        conversation.participants.forEach(pId => {
          const pIdStr = pId.toString();
          if (pIdStr !== senderId.toString()) {
            const currentCount = conversation.unreadCounts.get(pIdStr) || 0;
            conversation.unreadCounts.set(pIdStr, currentCount + 1);
          }
        });

        await conversation.save();
      }

      // Broadcast to users in room
      io.to(conversationId).emit("receive_message", newMessage);
      
      // Also broadcast an update to clients so their navbar badges update immediately
      io.emit("new_unread_message", { conversationId });
      
    } catch (err) {
      console.error("Socket send_message error:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`Server (with Socket.io) running on port ${PORT} 🔥`);
});