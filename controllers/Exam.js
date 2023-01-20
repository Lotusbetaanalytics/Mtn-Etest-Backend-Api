const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const { shuffleArray } = require("../utils/generalUtils");

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
            `/_api/web/lists/getByTitle('CandidateExam')/items?$filter=CandidateId eq '${req.user}'&$select=*, ExamScheduleId/MaxStartDateTime, ExamScheduleId/StartDateTime&$expand=ExamScheduleId`,
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
                MaxStartTime: item.ExamScheduleId.MaxStartDateTime,
                StartTime: item.ExamScheduleId.StartDateTime,
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
  // get shuffle from request query
  const { shuffle = false } = req.query;

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
          // Randomize questions if shuffle is true
          if (shuffle || shuffle === "true") shuffleArray(response);

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

  const userSubmissions = await getUserSubmissions(req);

  if (userSubmissions.length) {
    Score.updateScore(req, res, next);
    return;
  }
  Score.createScore(req, res, next);
});

getUserSubmissions = asyncHandler(async (req) => {
  const options = await spauth.getAuth(url, {
    clientId: username,
    clientSecret: password,
  });

  const headers = options.headers;
  headers["Accept"] = "application/json;odata=verbose";
  const listResponses = await requestprom.get({
    url:
      url +
      `/_api/web/lists/getByTitle('CandidateExamQuestionChoice')/items?$filter=CandidateIdId eq '${req.params.candidateId}' and CandidateExamQuestionIdId eq '${req.params.questionId}' and ExamScheduleIdId eq '${req.params.examId}'`,
    headers: headers,
    json: true,
  });

  return listResponses?.d?.results || [];
});

exports.verifyExamPassCode = asyncHandler(async (req, res, next) => {
  if (!Object.keys(req.body).length) {
    return next(new ErrorResponse("Please enter the exam passcode", 400));
  }

  const options = await spauth.getAuth(url, {
    clientId: username,
    clientSecret: password,
  });

  const headers = options.headers;
  headers["Accept"] = "application/json;odata=verbose";
  const listResponses = await requestprom.get({
    url:
      url +
      `/_api/web/lists/getByTitle('CandidateExam')/items?$filter=Passcode eq '${req.body.Passcode}' and ExamScheduleIdId eq '${req.params.id}'&$select=*, ExamScheduleId/Duration&$expand=ExamScheduleId`,
    headers: headers,
    json: true,
  });

  if (!listResponses.d.results.length) {
    return next(new ErrorResponse("No exam with this passcode found", 400));
  }
  const examtime = listResponses?.d?.results?.[0]?.ExamScheduleId.Duration;
  function toHoursAndMinutes(totalMinutes) {
    const hours = Math.floor(totalMinutes / 60);
    // const minutes = totalMinutes % 60;
    return hours;
  }

  const time = toHoursAndMinutes(examtime + 1) * 60 * 60 * 1000;
  const timer = Date.now() + time;

  await saveTimer(req, res, next);

  res.status(200).json({
    success: true,
    data: req.params.id,
  });
});

const saveTimer = asyncHandler(async (req, res, next) => {
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
  headers["Accept"] = "application/json;odata=verbose";
  headers["X-HTTP-Method"] = "MERGE";
  headers["X-RequestDigest"] = digest;
  headers["IF-MATCH"] = "*";

  await requestprom
    .post({
      url: url + `/_api/web/lists/getByTitle('ExamTimer')/items`,
      headers: headers,
      body: { CandidateId: req.user, ExamId: req.params.id, StartTime: "m" },
      json: true,
    })
    .catch(function (err) {
      return next(new ErrorResponse(err, 500));
    });
});

class Score {
  constructor(req, res) {
    this.req = req;
    this.res = res;
  }

  static updateScore(req, res, next) {
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
                  `/_api/web/lists/getByTitle('CandidateExamQuestionChoice')/items(${req.params.submitId})`,
                headers: headers,
                body: req.body,
                json: true,
              })
              .then(function (listresponse) {
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
    return;
  }

  static createScore(req, res, next) {
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
                  CandidateExamQuestionIdId: req.params.questionId,
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
  }
}
