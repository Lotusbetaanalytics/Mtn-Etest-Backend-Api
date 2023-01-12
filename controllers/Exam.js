const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");

var spauth = require("node-sp-auth");
var requestprom = require("request-promise");
// Site and User Creds
var url = process.env.SITE;
var username = process.env.CLIENT_ID;
var password = process.env.CLIENT_SECRET;

exports.getMyExam = asyncHandler(async (req, res, next) => {
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
            `/_api/web/lists/getByTitle('CandidateExam')/items?$filter=CandidateId eq '${req.user}'`,
          headers: headers,
          json: true,
        })
        .then(function (listresponse) {
          var items = listresponse.d.results;
          if (items.length <= 0) {
            return next(new ErrorResponse("Invalid credentials", 401));
          }
          var response = [];
          items.forEach(function (item) {
            if (item) {
              response.push({
                ID: item.ID,
                CandidateIdId: item.CandidateIdId,
                ExamScheduleIdId: item.ExamScheduleIdId,
                Passcode: item.Passcode,
                Batch: item.Batch,
                BatchIdId: item.BatchIdId,
                Candidate: item.Candidate,
                ExamSchedule: item.ExamSchedule,
                SelectedOption: item.SelectedOption,
                DueDate: item.DueDate,
                Mark: item.Mark,
                Status: item.Status,
              });
            }
          }, this);

          // Print / Send back the data
          res.status(200).json({
            success: true,
            data: response,
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

exports.getSections = asyncHandler(async (req, res, next) => {
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
            `/_api/web/lists/getByTitle('ExamQuest')/items?$filter=ExamScheduleId eq '${parseInt(
              req.params.id
            )}'`,
          headers: headers,
          json: true,
        })
        .then(function (listresponse) {
          var items = listresponse.d.results;

          var response = [];
          items.forEach(function (item) {
            if (item) {
              response.push({
                ExamSectionIdId: item.ExamSectionIdId,
                ExamSection: item.ExamSection,
              });
            }
          }, this);
          // Print / Send back the data
          removeDuplicate(response, "ExamSection", res);
        })
        .catch(function (err) {
          return next(new ErrorResponse(err, 500));
        });
    })
    .catch(function (err) {
      return next(new ErrorResponse(err, 500));
    });
});

const removeDuplicate = (arr = [], key, res) => {
  var checker = new Set();
  const data = arr.filter(
    (it) => !checker.has(it[key]) && checker.add(it[key])
  );
  res.status(200).json({
    success: true,
    data,
  });
};

exports.getQuestions = asyncHandler(async (req, res, next) => {
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
            `/_api/web/lists/getByTitle('ExamQuest')/items?$filter=ExamSectionId eq '${parseInt(
              req.params.id
            )}'&$select=Question, QuestionId/Answers, QuestionId/ID,QuestionId/Category&$expand=QuestionId`,
          headers: headers,
          json: true,
        })
        .then(function (listresponse) {
          var items = listresponse.d.results;

          var response = [];
          items.forEach(function (item) {
            if (item) {
              // response.push(item);
              response.push({
                Question: item.Question,
                QuestionID: item.QuestionId.ID,
                Category: item.QuestionId.Category,
                Answers: JSON.parse(item.QuestionId.Answers),
              });
            }
          }, this);
          // Print / Send back the data
          res.status(200).json({
            success: true,
            data: response,
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

exports.answerQuestion = asyncHandler(async (req, res, next) => {
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
          headers["X-HTTP-Method"] = "POST";
          headers["X-RequestDigest"] = digest;
          headers["IF-MATCH"] = "*";
          // update user profile
          requestprom
            .post({
              url:
                url +
                `/_api/web/lists/getByTitle('CandidateExamQuestionChoice')/items`,
              headers: headers,
              body: {
                ...req.body,
                CandidateIdId: req.user,
                CandidateExamQuestionIdId: req.params.id,
              },
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
