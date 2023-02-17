const express = require("express");
const { getExamMessages } = require("../controllers/Message");
const { protect } = require("../middleware/auth");
const router = express.Router();

router.route("/:examSchedId").post(protect, getExamMessages).get(protect, getExamMessages);

module.exports = router;
