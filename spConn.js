var spauth = require("node-sp-auth");
var requestprom = require("request-promise"); 
const asyncHandler = require("./middleware/async");



exports.testing3 = asyncHandler(async (req, res) => {
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
  headers["X-RequestDigest"] = "allowed";


  // Pull the SharePoint list items
  const listresponse = await requestprom.get({
    // url: url + `/_api/web/lists/getByTitle('ExamSchedule')/items`,
    url: url + `/_api/web/lists/getByTitle('Venue')/items`,
    headers: headers,
    json: true,
  });

  const items = listresponse.d.results;
  console.log({ listresponse });
  // console.log({ items });
  // const responseJSON = [];
  // // process
  // items.forEach(function (item) {
  //   if (item.Title != null) {
  //     responseJSON.push(item.Title);
  //   }
  // }, this);
  // Print / Send back the data
  // res.send(JSON.stringify(responseJSON));
  // res.status(200).json(responseJSON);
  res.status(200).json(items);
});

exports.testing4 = asyncHandler(async (req, res) => {
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

  // // Pull the SharePoint list items
  // const listresponse = await requestprom.get({
  //   // url: url + `/_api/web/lists/getByTitle('ExamSchedule')/items`,
  //   url: url + `/_api/web/lists/getByTitle('Venue')/items`,
  //   headers: headers,
  //   json: true,
  // });

  // Pull the SharePoint list items
  const listresponse = await requestprom.post({
    // url: url + `/_api/web/lists/getByTitle('ExamSchedule')/items`,
    url: url + `/_api/web/lists/getByTitle('Venue')/items`,
    headers: headers,
    json: true,
    body: {
      Title: "Test Title 2",
      Address: "Test Addess 2",
    }
  });

  const items = listresponse.d.results;
  console.log({ listresponse });
  // console.log({ items });
  // const responseJSON = [];
  // // process
  // items.forEach(function (item) {
  //   if (item.Title != null) {
  //     responseJSON.push(item.Title);
  //   }
  // }, this);
  // Print / Send back the data
  // res.send(JSON.stringify(responseJSON));
  // res.status(200).json(responseJSON);
  res.status(200).json(items);
});

// module.exports = testing3