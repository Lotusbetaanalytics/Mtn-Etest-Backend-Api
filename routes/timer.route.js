const express = require("express");
const { getExamTimer } = require("../controllers/timer.controllers");
const { protect } = require("../middleware/auth");
const router = express.Router();

router.route("/:examId").get(protect, getExamTimer);

module.exports = router;
