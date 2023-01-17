const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const jwt = require("jsonwebtoken");
var http = require("http");
var spauth = require("node-sp-auth");
var requestprom = require("request-promise");
const imageToBase64 = require("image-to-base64");
// Site and User Creds
var url = process.env.SITE;
var username = process.env.CLIENT_ID;
var password = process.env.CLIENT_SECRET;

exports.login = asyncHandler(async (req, res, next) => {
  const userId = req.body.userID;
  const passcode = req.body.passcode;
  //validate email & password
  if (!userId || !passcode) {
    return next(
      new ErrorResponse("Please Provide an UserId and Passcode", 400)
    );
  }
  // Authenticate with hardcoded credentials
  spauth
    .getAuth(url, {
      clientId: username,
      clientSecret: password,
    })
    .then(function (options) {
      // Headers
      var headers = options.headers;
      headers["Accept"] = "application/json;odata=verbose";
      // Pull the SharePoint list items
      requestprom
        .get({
          url:
            url +
            `/_api/web/lists/getByTitle('Candidate')/items?$filter=((UserId eq '${userId}') and (RawPasscode eq '${passcode}'))`,
          headers: headers,
          json: true,
        })
        .then(function (listresponse) {
          var items = listresponse.d.results;
          if (items.length <= 0) {
            return next(new ErrorResponse("Invalid credentials", 401));
          }
          var user = {};
          items.forEach(function (item) {
            if (item) {
              user = {
                ID: item.ID,
                Title: item.Title,
                PhoneNumber: item.PhoneNumber,
                Email: item.Email,
                DateOfBirth: item.DateOfBirth,
                MaritalStatus: item.MaritalStatus,
                Sex: item.Sex,
                YearsOfExperience: item.YearsOfExperience,
                Firstname: item.Firstname,
                Batch: item.Batch,
                Passport: item.Passport,
                Middlename: item.Middlename,
                Lastname: item.Lastname,
                Fullname: item.Fullname,
              };
            }
          }, this);

          // Print / Send back the data
          sendTokenResponse(user, 200, res);
        })
        .catch(function (err) {
          return next(new ErrorResponse(err, 500));
        });
    })
    .catch(function (err) {
      return next(new ErrorResponse(err, 500));
    });
});

const sendTokenResponse = (user, statusCode, res) => {
  //create token
  const token = jwt.sign({ id: user.ID }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token,
  });
};

// @desc    Get current logged in user
// @route   POST/api/v1/auth/me
// @access   Private

exports.getMe = asyncHandler(async (req, res, next) => {
  spauth
    .getAuth(url, {
      clientId: username,
      clientSecret: password,
    })
    .then(function (options) {
      // Headers
      var headers = options.headers;
      headers["Accept"] = "application/json;odata=verbose";
      // Pull the SharePoint list items
      requestprom
        .get({
          url:
            url +
            `/_api/web/lists/getByTitle('Candidate')/items?$filter=ID eq '${req.user}'`,
          headers: headers,
          json: true,
        })
        .then(function (listresponse) {
          var items = listresponse.d.results;

          var user = {};

          items.forEach(function (item) {
            // const image = await imageToBase64(item.Passport); // Image URL

            // console.log(image);
            if (item) {
              user = {
                ID: item.ID,
                Title: item.Title,
                PhoneNumber: item.PhoneNumber,
                Email: item.Email,
                DateOfBirth: item.DateOfBirth,
                MaritalStatus: item.MaritalStatus,
                Sex: item.Sex,
                YearsOfExperience: item.YearsOfExperience,
                Firstname: item.Firstname,
                Batch: item.Batch,
                Passport: item.Passport,
                Middlename: item.Middlename,
                Lastname: item.Lastname,
                Fullname: item.Fullname,
              };
            }
          }, this);

          // Print / Send back the data
          res.status(200).json({
            success: true,
            data: user,
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

exports.updateProfile = asyncHandler(async (req, res, next) => {
  if (Object.keys(req.body).length <= 0) {
    return next(new ErrorResponse("Fields cannot be empty.", 400));
  }
  spauth
    .getAuth(url, {
      clientId: username,
      clientSecret: password,
    })
    .then(function (options) {
      // Headers
      var headers = options.headers;
      headers["Accept"] = "application/json;odata=verbose";
      requestprom
        .put({
          url: url + `/_api/contextinfo`,
          headers: headers,
          json: true,
        })
        .then(function (listresponses) {
          const digest =
            listresponses.d.GetContextWebInformation.FormDigestValue;

          var headers = options.headers;
          headers["Accept"] = "application/json;odata=verbose";
          headers["X-HTTP-Method"] = "MERGE";
          headers["X-RequestDigest"] = digest;
          headers["IF-MATCH"] = "*";
          // update user profile
          requestprom
            .post({
              url:
                url +
                `/_api/web/lists/getByTitle('Candidate')/items(${req.user})`,
              headers: headers,
              body: req.body,
              json: true,
            })
            .then(function (listresponse) {
              // Print / Send back the data
              res.status(200).json({
                success: true,
              });
            })
            .catch(function (err) {
              return next(new ErrorResponse(err, 500));
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
