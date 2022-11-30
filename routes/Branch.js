const express = require("express");
const {
  createBranch,
  getBranch,
  updateBranch,
  deleteBranch,
} = require("../controllers/Branch");
const Branch = require("../models/Branch");
const { protect, authorize } = require("../middleware/auth");
const advancedResults = require("../middleware/advancedResults");

const router = express.Router();

router
  .route("/")
  .post(protect, authorize("SuperAdmin"), createBranch)
  .get(protect, advancedResults(Branch), getBranch);
router
  .route("/:id")
  .delete(protect, authorize("SuperAdmin"), deleteBranch)
  .put(protect, authorize("SuperAdmin"), updateBranch);
module.exports = router;
