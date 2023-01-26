const express = require("express");
const {
  getMyExam,
  getSections,
  getQuestions,
  answerQuestion,
  verifyExamPassCode: verifyExamSchedulePassCode,
  getExamInstruction,
  getSingleExam,
  startExam,
} = require("../controllers/Exam");
const { protect } = require("../middleware/auth");
const router = express.Router();

router.route("/").get(protect, getMyExam);
router.route("/single/:id").get(protect, getSingleExam);
router.route("/:id/passcode-verify").post(protect, verifyExamSchedulePassCode);
router.route("/sections/:id").get(protect, getSections);
router.route("/questions/:id").get(protect, getQuestions);
router.route("/:id/instruction").get(protect, getExamInstruction);
router.route("/start-exam:id").put(protect, startExam);

router
  .route(
    "/questions/:questionId/candidates/:candidateId/exams/:examId/submissions/:submitId"
  )
  .put(protect, answerQuestion);

module.exports = router;
