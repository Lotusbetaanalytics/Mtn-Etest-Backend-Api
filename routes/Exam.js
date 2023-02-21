const express = require("express");
const {
  getMyExam,
  getSections,
  getQuestions,
  getExamQuestions,
  answerQuestion,
  verifyExamPassCode: verifyExamSchedulePassCode,
  getExamInstruction,
  getSingleExam,
  startExam,
  getSectionDetails,
  getQuestionDetails,
} = require("../controllers/Exam");
const { protect } = require("../middleware/auth");
const router = express.Router();

router.route("/").get(protect, getMyExam);
router.route("/single/:id").get(protect, getSingleExam);
router.route("/:id/passcode-verify").post(protect, verifyExamSchedulePassCode);
router.route("/sections/:id").get(protect, getSections);
router.route("/section-detail/:id").get(protect, getSectionDetails);
router.route("/questions/:id").get(protect, getQuestions);
router.route("/question-details/:id").get(protect, getQuestionDetails);
router.route("/questions/:id/:examSchedId").get(protect, getExamQuestions);
router.route("/:id/instruction").get(protect, getExamInstruction);
router.route("/start/:id").put(protect, startExam);

router
  .route("/questions/:questionId/candidates/:candidateId/exams/:examId/")
  .put(protect, answerQuestion);

module.exports = router;
