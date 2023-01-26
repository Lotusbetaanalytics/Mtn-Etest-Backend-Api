const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const colors = require("colors");
const fileupload = require("express-fileupload");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const cors = require("cors");
const errorHandler = require("./middleware/error");
const socket = require("socket.io");

//load env vars
dotenv.config({ path: "./config/.env" });

// Routes Files
const candidate = require("./routes/Candidate");
const exam = require("./routes/Exam");
const timer = require("./routes/timer.route");
const question = require("./routes/Question");
const result = require("./routes/Result");
const doc = require("./routes/Doc");

//connect to database

const app = express();

//Boy Parser
app.use(express.json());

// Dev logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
//file uploads
app.use(fileupload());

//set security headers
app.use(helmet());

// Prevent XSS attacks
app.use(xss());

//Rate limiting
const limiter = rateLimit({
  windowMs: 20 * 60 * 1000, // 20 mins
  max: 300,
});
app.use(limiter);

//prevent http param pollution
app.use(hpp());

//enable CORS
app.use(cors());

//Mount Routers

app.use("/api/v1/auth/", candidate);
app.use("/api/v1/exam/", exam);
app.use("/api/v1/timer/", timer);
app.use("/api/v1/question/", question);
app.use("/api/v1/result/", result);
app.use("/api/v1/doc/", doc);

app.use(errorHandler);

//Set static folder
app.use(express.static(path.join(__dirname, "public")));

app.get("/*", function (req, res) {
  res.sendFile(path.join(__dirname, "public/index.html"), function (err) {
    if (err) {
      res.status(500).send(err);
    }
  });
});

const PORT = process.env.PORT || 8000;
const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow
  )
);

//Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // close Server & exit Process

  server.close(() => process.exit(1));
});

const io = socket(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "https://mtncloud.sharepoint.com",
      // "https://mtncloud.sharepoint.com/sites/UATApplications/e-test",
    ],
    credentials: true,
  },
});

global.onlineUsers = new Map();
io.on("connection", (socket) => {
  global.chatSocket = socket;
  socket.on("add-user", (userId) => {
    console.log("connected");
    onlineUsers.set(userId, socket.id);
  });

  socket.on("send-msg", (data) => {
    console.log(data.receiver, "rec");
    const sendUserSocket = onlineUsers.get(data.receiver);
    console.log(data, "send");
    if (sendUserSocket) {
      console.log("Yes");
      socket.to(sendUserSocket).emit("msg-receive", data.message);
    }
  });
});
