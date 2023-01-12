const express = require("express");
const { login, getMe, updateProfile } = require("../controllers/Candidate");
const { protect } = require("../middleware/auth");
const router = express.Router();

router.route("/").post(login).get(protect, getMe).put(protect, updateProfile);

module.exports = router;
