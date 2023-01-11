var http = require("http");
var spauth = require("node-sp-auth");
var requestprom = require("request-promise");
const dotenv = require("dotenv");

dotenv.config({ path: "./config/.env" });

// Site and User Creds
var url = process.env.SITE_URL
var username = process.env.ACCOUNT_USERNAME
var password = process.env.ACCOUNT_PASSWORD
var server = http.createServer(function (request, response) {
  // Authenticate with hardcoded credentials
  spauth
    .getAuth(url, {
      username: username,
      password: password,
    })
    .then(function (options) {
      // Headers
      var headers = options.headers;
      headers["Accept"] = "application/json;odata=verbose";
      // Pull the SharePoint list items
      requestprom
        .get({
          url: url + "/_api/web/lists/getByTitle('ExamSchedule')/items",
          headers: headers,
          json: true,
        })
        .then(function (listresponse) {
          var items = listresponse.d.results;
          var responseJSON = [];
          // process
          items.forEach(function (item) {
            if (item.Title != null) {
              responseJSON.push(item.Title);
            }
          }, this);
          // Print / Send back the data
          response.end(JSON.stringify(responseJSON));
        });
    });
});

var port = process.env.PORT || 1337;
server.listen(port);
