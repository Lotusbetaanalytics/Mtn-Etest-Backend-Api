const express = require("express");
const { getAnsweredQuestions } = require("../controllers/Question");
const { protect } = require("../middleware/auth");
const router = express.Router();

router.route("/answered/:id").get(protect, getAnsweredQuestions);

module.exports = router;
