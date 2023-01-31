const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
var spauth = require("node-sp-auth");
var requestprom = require("request-promise");
// Site and User Creds
var url = process.env.SITE;
var username = process.env.CLIENT_ID;
var password = process.env.CLIENT_SECRET;

exports.getAnsweredQuestions = asyncHandler(async (req, res, next) => {
  const options = await spauth.getAuth(url, {
    clientId: username,
    clientSecret: password,
  });

  const headers = options.headers;
  headers["Accept"] = "application/json;odata=verbose";
  const listResponses = await requestprom.get({
    url:
      url +
      `/_api/web/lists/getByTitle('CandidateExamQuestionChoice')/items?$filter=CandidateId eq '${req.user}' and ExamScheduleId eq '${req.params.id}'`,
    headers: headers,
    json: true,
  });
  var items = listResponses.d.results;

  var response = [];
  items.forEach(function (item) {
    if (item) {
      response.push({
        QuestionId: item.CandidateExamQuestionIdId,
        SelectedChoice: item.SelectedChoice,
        SubmitId: item.ID,
        examID: item.ExamScheduleIdId,
        Score: item.Score,
      });
    }
  }, this);

  res.status(200).json({
    success: true,
    data: response,
  });
});
