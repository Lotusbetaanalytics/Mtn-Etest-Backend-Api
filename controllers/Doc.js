const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
var spauth = require("node-sp-auth");
var requestprom = require("request-promise");

// Site and User Creds
var url = process.env.SITE;
var username = process.env.CLIENT_ID;
var password = process.env.CLIENT_SECRET;

// @desc    Get current logged in user
// @route   POST/api/v1/auth/me
// @access   Private

exports.getLib = asyncHandler(async (req, res, next) => {
  spauth
    .getAuth(url, {
      clientId: username,
      clientSecret: password,
    })
    .then(function (options) {
      // Headers
      var headers = options.headers;
      console.log(headers);
      headers["Accept"] = "application/json;odata=verbose";
      // Pull the SharePoint list items
      requestprom
        .get({
          url: url + `/_api/web/GetFolderByServerRelativeUrl('Passport')/Files`,
          headers: headers,
          json: true,
        })
        .then(function (listresponse) {
          var items = listresponse.d.results;

          // Print / Send back the data
          res.status(200).json({
            success: true,
            data: items,
          });
        })
        .catch(function (err) {
          return next(new ErrorResponse(err, 500));
        });
    })
    .catch(function (err) {
      return next(new ErrorResponse(err, 500));
    });
});
