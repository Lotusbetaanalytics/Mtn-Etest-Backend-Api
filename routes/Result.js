const express = require("express");
const { submitExam } = require("../controllers/Result");
const { protect } = require("../middleware/auth");
const router = express.Router();

router.route("/").post(protect, submitExam);

module.exports = router;
