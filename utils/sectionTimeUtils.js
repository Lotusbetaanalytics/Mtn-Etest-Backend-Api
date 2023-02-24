const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const jwt = require("jsonwebtoken");
var http = require("http");
var spauth = require("node-sp-auth");
var requestprom = require("request-promise");
const { simpleAsync } = require("../utils/generalUtils");
// Site and User Creds
var url = process.env.SITE;
var username = process.env.CLIENT_ID;
var password = process.env.CLIENT_SECRET;


// exports.sectionStartEnd = simpleAsync(async (req, res, next, CandidateIdId, ExamScheduleIdId, SectionId, type = "start") => {
// exports.sectionStartEnd = simpleAsync(async (req, res, next, ExamScheduleIdId, SectionId, type = "start") => {
exports.sectionStartEnd = async (req, res, next, ExamScheduleIdId, SectionId, type = "start") => {
  const options = await spauth.getAuth(url, {
    clientId: username,
    clientSecret: password,
  });

  const payload = {
    CandidateIdId: req.user,
    ExamScheduleIdId,
    SectionId,
    Score: 0,
    SelectedChoice: type,
    SectionTitle: type,
  }

  const headers = options.headers;
  headers["Accept"] = "application/json;odata=verbose";
  const context = await requestprom.put({
    url: url + `/_api/contextinfo`,
    headers: headers,
    json: true,
  });
  const digest = context.d.GetContextWebInformation.FormDigestValue;

  try {
    const getQuestionChoice = await requestprom.get({
      url:
        url +
        `/_api/web/lists/getByTitle('CandidateExamQuestionChoice')/items?$filter=CandidateIdId eq '${req.user}' and ExamScheduleIdId eq '${ExamScheduleIdId}' and SectionId eq '${SectionId}' and SectionTitle eq '${type}'`,
      headers: headers,
      json: true,
    });
    // const questionChoice = getQuestionChoice?.d?.results?.[0].ID;
    const questionChoice = getQuestionChoice?.d?.results?.[0];
    // console.log({questionChoice})

    // const getScheduledExam = await requestprom.get({
    //   url:
    //     url +
    //     `/_api/web/lists/getByTitle('ExamSchedule')/items?$filter=ID eq '${req.body.examID}'`,
    //   headers: headers,
    //   json: true,
    // });
    // const scheduledExam = getScheduledExam?.d?.results?.[0]
    // const scheduledExamTotalMark = scheduledExam.TotalExamMark;
    // const cutOffMark = scheduledExam.CutOffMark
    // const displayResult = scheduledExam.DisplayExamResult

    // let percentageScore;
    // percentageScore = (score / scheduledExamTotalMark) * 100;
    // percentageScore = Number(percentageScore.toFixed(2))
    // const remark = percentageScore >= cutOffMark ? "Pass" : "Fail"
    // // console.log({percentageScore, remark, score, scheduledExamTotalMark, cutOffMark})
    // console.log({percentageScore, remark, score, scheduledExamTotalMark, cutOffMark})

    if (questionChoice) return

    headers["Accept"] = "application/json;odata=verbose";
    // headers["X-HTTP-Method"] = "MERGE";
    headers["X-HTTP-Method"] = "POST";
    headers["X-RequestDigest"] = digest;
    headers["IF-MATCH"] = "*";

    await requestprom
      .post({
        url: url + `/_api/web/lists/getByTitle('CandidateExamQuestionChoice')/items`,
        headers: headers,
        body: { ...payload },
        json: true,
      })
      // .catch(function (err) {
      //   return next(new ErrorResponse(err, 500));
      // });
  } catch (err) {
    console.log(`Error creating start response: ${err.message}`)
    return false
  }

  

  return true
  // return {
  //   score: percentageScore,
  //   remark: remark,
  //   displayResult: displayResult
  // }
};
// });