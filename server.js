const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const xss = require("xss-clean");
const morgan = require("morgan");
const colors = require("colors");
const dotenv = require("dotenv");
const cors = require("cors");
const errorHandler = require("./middleware/error");
const rateLimit = require("express-rate-limit");
const express = require("express");
const connectDB = require("./config/db");

//load env vars
dotenv.config({ path: "./config/.env" });

// import routes
const item  = require("./routes/item")

// configure express
const app = express();

//connection to the db
connectDB();

// set up app
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("tiny"))

//Sanitize data
app.use(mongoSanitize());

//set security headers
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

// Prevent XSS attacks
app.use(xss());

//Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 100000,
});
app.use(limiter);
app.use(cors());

// configure routes
app.use("/api/v1/item", item)


app.use(errorHandler);

// 
app.engine('.html', require('ejs').__express);
app.set('view engine', 'html');
app.set('views', __dirname + '/public');
app.set('view engine', 'html');

app.get('/*', function(req, res) {
  if (req.xhr) {
    var pathname = url.parse(req.url).pathname;
    res.sendfile('index.html', {root: __dirname + '/public' + pathname});
  } else {
    res.render('index');
  }
});


// Error handling
app.use((req, res) => {
  res.status(400).json({
    success: false,
    message: 'Page not found!'
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(`Server running on port ${PORT}`.yellow)
);

//Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`.red);

  server.close(() => process.exit(1));
});
