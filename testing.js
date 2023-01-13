var http = require("http");
var spauth = require("node-sp-auth");
var requestprom = require("request-promise");

// var request = require("request-promise");
const express = require("express");
const colors = require("colors");
const dotenv = require("dotenv");
const asyncHandler = require("./middleware/async")

//load env vars
dotenv.config({ path: "./config/.env" });

// configure express
const app = express();

// //connection to the db
// connectDB();

// set up app
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



const testing3 = asyncHandler(async (req, res) => {
  // Site and User Creds
  // var url = process.env.SITE_URL;
  var url = "https://mtncloud.sharepoint.com/sites/UATApplications/e-test/";
  var username = process.env.ACCOUNT_USERNAME;
  var password = process.env.ACCOUNT_PASSWORD;

  console.log("this starts");
  console.log({ username, password });

  const options = await spauth.getAuth(url, { username, password });
  console.log({ options });
  // Headers
  const headers = options.headers;
  headers["Accept"] = "application/json;odata=verbose";

  // Pull the SharePoint list items
  const listresponse = await requestprom.get({
    url: url + "/_api/web/lists/getByTitle('ExamSchedule')/items",
    headers: headers,
    json: true,
  });

  const items = listresponse.d.results;
  console.log({ listresponse, items });
  const responseJSON = [];
  // process
  items.forEach(function (item) {
    if (item.Title != null) {
      responseJSON.push(item.Title);
    }
  }, this);
  // Print / Send back the data
  res.send(JSON.stringify(responseJSON));
})

// const connRequest = async (options, res) => {
//   // Headers
//   const headers = options.headers;
//   headers["Accept"] = "application/json;odata=verbose";
//   // Pull the SharePoint list items
//   const listresponse = await requestprom
//     .get({
//       url: url + "/_api/web/lists/getByTitle('ExamSchedule')/items",
//       headers: headers,
//       json: true,
//     })

//   const items = listresponse.d.results;
//   console.log({ listresponse, items });
//   const responseJSON = [];
//   // process
//   items.forEach(function (item) {
//     if (item.Title != null) {
//       responseJSON.push(item.Title);
//     }
//   }, this);
//   // Print / Send back the data
//   res.send(JSON.stringify(responseJSON));
// }


// const testing2 = (req, res, next) => {
//   const result  = spauth
//     .getAuth(url, {
//       username: username,
//       password: password,
//     })
//     .then(function (options) {
//       // Headers
//       var headers = options.headers;
//       headers["Accept"] = "application/json;odata=verbose";
//       // Pull the SharePoint list items
//       requestprom
//         .get({
//           url: url + "/_api/web/lists/getByTitle('ExamSchedule')/items",
//           headers: headers,
//           json: true,
//         })
//         .then(function (listresponse) {
//           console.log({ listresponse });
//           var items = listresponse.d.results;
//           var responseJSON = [];
//           // process
//           items.forEach(function (item) {
//             if (item.Title != null) {
//               responseJSON.push(item.Title);
//             }
//           }, this);
//           // Print / Send back the data
//           res.send(JSON.stringify(responseJSON));
//         });
//     });
//     res.status(200).send(result)
// };

app.use("/", testing3);

// Error handling
app.use((req, res) => {
  res.status(400).json({
    success: false,
    message: 'Page not found!'
  });
});

console.log("first")

const PORT = process.env.PORT || 5000;

console.log({PORT})

const server = app.listen(
  PORT,
  console.log(`Server running on port ${PORT}`.yellow)
);

//Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`.red);

  server.close(() => process.exit(1));
});

// function testing (request, response) {
//   // Authenticate with hardcoded credentials
//   spauth
//     .getAuth(url, {
//       username: username,
//       password: password,
//     })
//     .then(function (options) {
//       // Headers
//       var headers = options.headers;
//       headers["Accept"] = "application/json;odata=verbose";
//       // Pull the SharePoint list items
//       requestprom
//         .get({
//           url: url + "/_api/web/lists/getByTitle('ExamSchedule')/items",
//           headers: headers,
//           json: true,
//         })
//         .then(function (listresponse) {
//           console.log({listresponse})
//           var items = listresponse.d.results;
//           var responseJSON = [];
//           // process
//           items.forEach(function (item) {
//             if (item.Title != null) {
//               responseJSON.push(item.Title);
//             }
//           }, this);
//           // Print / Send back the data
//           response.end(JSON.stringify(responseJSON));
//         });
//     });
// }
