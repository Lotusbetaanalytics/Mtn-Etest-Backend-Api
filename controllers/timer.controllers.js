const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");

var spauth = require("node-sp-auth");
var requestprom = require("request-promise");
// Site and User Creds
var url = process.env.SITE;
var username = process.env.CLIENT_ID;
var password = process.env.CLIENT_SECRET;

exports.getExamTimer = asyncHandler(async (req, res, next) => {
  const options = await spauth.getAuth(url, {
    clientId: username,
    clientSecret: password,
  });

  const headers = options.headers;
  headers["Accept"] = "application/json;odata=verbose";
  const listResponses = await requestprom.get({
    url:
      url +
      `/_api/web/lists/getByTitle('ExamSchedule')/items(${req.params.examId})`,
    headers: headers,
    json: true,
  });

  res.status(200).json({
    success: true,
    timer: listResponses.d.Duration,
  });
});
