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

exports.getExamMessages = asyncHandler(async (req, res, next) => {
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
            `/_api/web/lists/getByTitle('Message')/items?$filter=((ExamScheduleId eq '${req.params.examSchedId}') and (ExamScheduleId eq '${req.body.examID}'))`,
          headers: headers,
          json: true,
        })
        .then(async function (listresponse) {
          var items = listresponse.d.results;
          // if (items.length <= 0) {
          //   return next(new ErrorResponse("Not Available", 404));
          // }
          var messages = [];
          items.forEach(function (item) {
            if (item) {
              const currItem = {
                ID: item.ID,
                Title: item.Title,
                ExamSchedule: item.ExamSchedule,
                ExamScheduleIdId: item.ExamScheduleIdId,
                Message: item.Message,
                TimeAfterStart: item.TimeAfterStart,
              };
              messages.push(currItem);
            }
          }, this);

          //sum up messages
          // const TotalScore = messages.reduce((acc, item) => item + acc, 0);
          // await updateExamStatus(req, res, next, TotalScore);

          // console.log({TotalScore, messages})

          // Print / Send back the data
          res.status(200).json({
            success: true,
            data: messages,
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

// const updateExamStatus = asyncHandler(async (req, res, next, score = 0) => {
//   const options = await spauth.getAuth(url, {
//     clientId: username,
//     clientSecret: password,
//   });

//   const headers = options.headers;
//   headers["Accept"] = "application/json;odata=verbose";
//   const context = await requestprom.put({
//     url: url + `/_api/contextinfo`,
//     headers: headers,
//     json: true,
//   });
//   const digest = context.d.GetContextWebInformation.FormDigestValue;

//   const getID = await requestprom.get({
//     url:
//       url +
//       `/_api/web/lists/getByTitle('CandidateExam')/items?$filter=CandidateIdId eq '${req.user}' and ExamScheduleIdId eq '${req.body.examID}'`,
//     headers: headers,
//     json: true,
//   });
//   const listID = getID?.d?.results?.[0].ID;
//   console.log({listID})

//   const getScheduledExam = await requestprom.get({
//     url:
//       url +
//       `/_api/web/lists/getByTitle('ExamSchedule')/items?$filter=ID eq '${req.body.examID}'`,
//     headers: headers,
//     json: true,
//   });
//   const scheduledExamTotalMark = getScheduledExam?.d?.results?.[0].TotalExamMark;


//   let percentageScore;
//   percentageScore = (score / scheduledExamTotalMark) * 100;
//   console.log({percentageScore, score, scheduledExamTotalMark})

//   headers["Accept"] = "application/json;odata=verbose";
//   headers["X-HTTP-Method"] = "MERGE";
//   headers["X-RequestDigest"] = digest;
//   headers["IF-MATCH"] = "*";

//   await requestprom
//     .post({
//       url: url + `/_api/web/lists/getByTitle('CandidateExam')/items(${listID})`,
//       headers: headers,
//       body: { Status: "Completed", Mark: percentageScore },
//       json: true,
//     })
//     .catch(function (err) {
//       return next(new ErrorResponse(err, 500));
//     });
// });