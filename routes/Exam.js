const express = require("express");
const {
  getMyExam,
  getSections,
  getQuestions,
  answerQuestion,
  verifyExamPassCode: verifyExamSchedulePassCode,
} = require("../controllers/Exam");
const { protect } = require("../middleware/auth");
const router = express.Router();

router.route("/").get(protect, getMyExam);
router.route("/:id/passcode-verify").post(protect, verifyExamSchedulePassCode);
router.route("/sections/:id").get(protect, getSections);
router
  .route("/questions/:id")
  .get(protect, getQuestions)
  .put(protect, answerQuestion);

module.exports = router;
