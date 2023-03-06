const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const {
  shuffleArray,
  isEqualDateTime,
  isEligible,
  splitInstructions,
  disableItem,
} = require("../utils/generalUtils");

var spauth = require("node-sp-auth");
var requestprom = require("request-promise");
const { sectionStartEnd } = require("../utils/sectionTimeUtils");
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
            `/_api/web/lists/getByTitle('CandidateExam')/items?$filter=CandidateId eq '${req.user}' and ExamScheduleId/Status eq 'Scheduled' or ExamScheduleId/Status eq 'Re-Scheduled' &$select=*, ExamScheduleId/MaxStartDateTime, ExamScheduleId/Status, ExamScheduleId/Duration, ExamScheduleId/StartDateTime&$expand=ExamScheduleId`,
          headers: headers,
          json: true,
        })
        .then(async function (listresponse) {
          var items = listresponse.d.results.filter((it) =>
            isEligible(
              it.ExamScheduleId.MaxStartDateTime,
              it.ExamScheduleId.StartDateTime
            )
          );

          var response = [];
          await items.forEach(async function (item) {
            if (item) {
              console.log({item})
              // try {
              //   // Pull the SharePoint list items
              //   const examSched  = await requestprom
              //     .get({
              //       url:
              //         url +
              //         `/_api/web/lists/getByTitle('ExamSchedule')/items?$filter=ID eq '${req.user}'`,
              //       headers: headers,
              //       json: true,
              //     })
              // } catch (error) {
                
              // }
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
                Duration: item.ExamScheduleId.Duration,
                Mark: item.Mark,
                Status: item.Status,
                // Instruction: item.Instruction || "N/A",
                Instruction: splitInstructions(item.ExamScheduleId.Instruction) || "N/A",
                disabled: disableItem(
                  item.ExamScheduleId.MaxStartDateTime,
                  item.ExamScheduleId.StartDateTime
                ),
              });
            }
          });

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

exports.getSingleExam = asyncHandler(async (req, res, next) => {
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
            `/_api/web/lists/getByTitle('CandidateExam')/items(${req.params.id})`,
          headers: headers,
          json: true,
        })
        .then(function (listresponse) {
          // Print / Send back the data

          res.status(200).json({
            success: true,
            data: listresponse?.d?.Status,
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
exports.getSectionDetails = asyncHandler(async (req, res, next) => {
  // Authenticate with hardcoded credentials
  const options = await spauth.getAuth(url, {
    clientId: username,
    clientSecret: password,
  });

  let headers = options.headers;
  headers["Accept"] = "application/json;odata=verbose";
  const result = await requestprom.get({
    url:
      url + `/_api/web/lists/getByTitle('ExamSection')/items(${req.params.id})`,
    headers: headers,
    json: true,
  });

  res.status(200).json({
    success: true,
    data: {
      Instruction: splitInstructions(result?.d.Description),
      Duration: result.d.Duration * 60000,
    },
  });
});
exports.getQuestionDetails = asyncHandler(async (req, res, next) => {
  // Authenticate with hardcoded credentials
  const options = await spauth.getAuth(url, {
    clientId: username,
    clientSecret: password,
  });

  let headers = options.headers;
  headers["Accept"] = "application/json;odata=verbose";
  const result = await requestprom.get({
    url: url + `/_api/web/lists/getByTitle('Question')/items(${req.params.id})`,
    headers: headers,
    json: true,
  });

  res.status(200).json({
    success: true,
    data: {
      Instruction: splitInstructions(result.d.Description),
      Image: result.d.ImageB64,
      Body: result.d.Body,
    },
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
            )}'&$select=*, ExamSectionId/Duration&$expand=ExamSectionId`,
          headers: headers,
          json: true,
        })
        .then(function (listresponse) {
          var items = listresponse.d.results;

          var response = [];
          items.forEach(async function (item) {
            if (item) {
              response.push({
                ExamSectionIdId: item.ExamSectionIdId,
                ExamSection: item.ExamSection,
                Duration: item.ExamSectionId?.Duration * 60000,
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
  const checker = new Set();
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
            `/_api/web/lists/getByTitle('ExamQuest')/items?$filter=((ExamSectionId eq '${parseInt(
              req.params.id
            )}'))&$select=Question, QuestionId/Answers, QuestionId/ID,QuestionId/Category,QuestionId/QuestionType,QuestionId/Image,QuestionId/Description, ExamSectionId/Duration&$expand=QuestionId, ExamSectionId`,
          headers: headers,
          json: true,
        })
        .then(function (listresponse) {
          var items = listresponse.d.results;

          var response = [];
          items.forEach(function (item) {
            if (item) {
              response.push({
                Question: item.Question,
                QuestionID: item.QuestionId.ID,
                Category: item.QuestionId.Category,
                Type: item.QuestionId.QuestionType,
                Answers: JSON.parse(item.QuestionId.Answers),
                Image: item.QuestionId.Image,
                Duration: item.ExamSectionId.Duration,
                Instruction: splitInstructions(item.QuestionId.Description) || "N/A",
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

exports.getExamQuestions = asyncHandler(async (req, res, next) => {
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
        // .get({
        //   url:
        //     url +
        //     `/_api/web/lists/getByTitle('ExamQuest')/items?$filter=((ExamSectionId eq '${parseInt(
        //       req.params.id
        //     )}'))&$select=Question, QuestionId/Answers, QuestionId/ID,QuestionId/Category,QuestionId/QuestionType,QuestionId/Image, ExamSectionId/Duration&$expand=QuestionId, ExamSectionId`,
        //   headers: headers,
        //   json: true,
        // })
        .get({
          url:
            url +
            `/_api/web/lists/getByTitle('ExamQuest')/items?$filter=((ExamSectionId eq '${parseInt(
              req.params.id
            )}') and (ExamScheduleId eq '${parseInt(
              req.params.examSchedId
            )}'))&$select=Question, QuestionId/Answers, QuestionId/ID,QuestionId/Category,QuestionId/QuestionType,QuestionId/Image,QuestionId/Description, ExamSectionId/Duration&$expand=QuestionId, ExamSectionId`,
          headers: headers,
          json: true,
        })
        .then(async function (listresponse) {
          await sectionStartEnd(req, res, next, req.params.id, req.params.examSchedId)
          var items = listresponse.d.results;

          var response = [];
          items.forEach(function (item) {
            if (item) {
              response.push({
                Question: item.Question,
                QuestionID: item.QuestionId.ID,
                Category: item.QuestionId.Category,
                Type: item.QuestionId.QuestionType,
                Answers: JSON.parse(item.QuestionId.Answers),
                Image: item.QuestionId.Image,
                Duration: item.ExamSectionId.Duration,
                Instruction: splitInstructions(item.QuestionId.Description) || "N/A",
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
          console.log(err.message)
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

const getUserSubmissions = asyncHandler(async (req) => {
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
  // function toHoursAndMinutes(totalMinutes) {
  //   const hours = Math.floor(totalMinutes * 60);
  //   // const minutes = totalMinutes % 60;
  //   return hours;
  // }

  if (examtime) {
    const time = (examtime + 1) * 60000;
    const timer = Date.now() + time;
    res.data = { timer: timer, id: req.params.id };

    await saveTimer(req, res, next);
  }
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
  headers["X-HTTP-Method"] = "POST";
  headers["X-RequestDigest"] = digest;
  headers["IF-MATCH"] = "*";

  await requestprom
    .post({
      url: url + `/_api/web/lists/getByTitle('ExamTimer')/items`,
      headers: headers,
      body: {
        CandidateId: req.user,
        ExamId: req.params.id,
        StartTime: res?.data?.timer.toString(),
      },
      json: true,
    })
    .catch(function (err) {
      return next(new ErrorResponse(err, 500));
    });
  res.status(200).json({
    success: true,
    data: res.data.id,
  });
});

exports.getExamInstruction = asyncHandler(async (req, res, next) => {
  const options = await spauth.getAuth(url, {
    clientId: username,
    clientSecret: password,
  });

  const headers = options.headers;
  headers["Accept"] = "application/json;odata=verbose";
  const listResponses = await requestprom.get({
    url:
      url +
      `/_api/web/lists/getByTitle('ExamSchedule')/items(${req.params.id})`,
    headers: headers,
    json: true,
  });

  const instruction = listResponses.d.Instruction || "N/A";

  res.status(200).json({
    success: true,
    instruction,
  });
});

exports.startExam = asyncHandler(async (req, res, next) => {
  Score.startExam(req, res, next);
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

            if (!req.query.submitId) {
              return next(new ErrorResponse("No id found", 400));
            }

            requestprom
              .post({
                url:
                  url +
                  `/_api/web/lists/getByTitle('CandidateExamQuestionChoice')/items(${req.query.submitId})`,
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

  static startExam(req, res, next) {
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
                  `/_api/web/lists/getByTitle('CandidateExam')/items(${req.params.id})`,
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
}
