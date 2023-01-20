const express = require("express");
const { getLib } = require("../controllers/Doc");
const { protect } = require("../middleware/auth");
const router = express.Router();

router.route("/").get(protect, getLib);

module.exports = router;
