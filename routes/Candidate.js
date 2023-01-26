const express = require("express");
const {
  login,
  getMe,
  updateProfile,
  logout,
} = require("../controllers/Candidate");
const { protect } = require("../middleware/auth");
const router = express.Router();

router.route("/").post(login).get(protect, getMe).put(protect, updateProfile);
router.route("/logout").post(protect, logout);

module.exports = router;
