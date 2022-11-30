const express = require("express");
const {
  createUser,
  login,
  getMe,
  getUser,
  updateProfile,
  deleteUser,
  forgotPassword,
  resetPassword,
} = require("../controllers/User");
const User = require("../models/User");
const { protect, authorize } = require("../middleware/auth");
const advancedResults = require("../middleware/advancedResults");

const router = express.Router();

router.route("/").post(createUser).get(protect, advancedResults(User), getUser);
router.route("/:id").delete(protect, authorize("SuperAdmin"), deleteUser);

router.route("/login").post(login);

router.route("/me").get(protect, getMe).put(protect, updateProfile);
router.post("/forgotpassword", forgotPassword);
router.put("/resetpassword/:resettoken", resetPassword);

module.exports = router;
