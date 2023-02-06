const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const jwt = require("jsonwebtoken");
var http = require("http");
var spauth = require("node-sp-auth");
var requestprom = require("request-promise");
// Site and User Creds
var url = process.env.SITE;
var username = process.env.CLIENT_ID;
var password = process.env.CLIENT_SECRET;

exports.submitExam = asyncHandler(async (req, res, next) => {
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
            `/_api/web/lists/getByTitle('CandidateExamQuestionChoice')/items?$filter=((CandidateId eq '${req.user}') and (ExamScheduleId eq '${req.body.examID}'))`,
          headers: headers,
          json: true,
        })
        .then(function (listresponse) {
          var items = listresponse.d.results;
          if (items.length <= 0) {
            return next(new ErrorResponse("Not Available", 404));
          }
          var score = [];
          items.forEach(function (item) {
            if (item) {
              score.push(item.Score);
            }
          }, this);

          //sum up score
          updateExamStatus(req, res, next);
          const TotalScore = score.reduce((acc, item) => item + acc, 0);

          // Print / Send back the data
          res.status(200).json({
            success: true,
            data: TotalScore,
          });
        })
        .catch(function (err) {
          return next(new ErrorResponse(err, 500));
        });
    })
    .then(async (_result) => {
      await updateExamStatus(req, res, next)
    })
    .catch(function (err) {
      return next(new ErrorResponse(err, 500));
    });
});

const updateExamStatus = asyncHandler(async (req, res, next) => {
  const options = await spauth.getAuth(url, {
    clientId: username,
    clientSecret: password,
  });

  const headers = options.headers;
  headers["Accept"] = "application/json;odata=verbose";
  const context = await requestprom.put({
    url: url + `/_api/contextinfo`,
    headers: headers,
    json: true,
  });
  const digest = context.d.GetContextWebInformation.FormDigestValue;

  const getID = await requestprom.get({
    url:
      url +
      `/_api/web/lists/getByTitle('CandidateExam')/items?$filter=CandidateIdId eq '${req.user}' and ExamScheduleIdId eq '${req.body.examID}'`,
    headers: headers,
    json: true,
  });
  const listID = getID?.d?.results?.[0].ID;

  headers["Accept"] = "application/json;odata=verbose";
  headers["X-HTTP-Method"] = "MERGE";
  headers["X-RequestDigest"] = digest;
  headers["IF-MATCH"] = "*";

  await requestprom
    .post({
      url: url + `/_api/web/lists/getByTitle('CandidateExam')/items(${listID})`,
      headers: headers,
      body: { Status: "Completed" },
      json: true,
    })
    .catch(function (err) {
      return next(new ErrorResponse(err, 500));
    });
});
