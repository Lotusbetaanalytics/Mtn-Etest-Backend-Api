const express = require("express");
const {
  createCompany,
  getCompany,
  updateCompany,
  deleteCompany,
  checkCompany,
} = require("../controllers/Company");
const Company = require("../models/Company");
const { protect, authorize } = require("../middleware/auth");
const advancedResults = require("../middleware/advancedResults");

const router = express.Router();

router
  .route("/")
  .post(createCompany)
  .get(protect, advancedResults(Company), getCompany);
router
  .route("/:id")
  .delete(protect, authorize("SuperAdmin"), deleteCompany)
  .put(protect, authorize("SuperAdmin"), updateCompany);
router.route("/created").get(checkCompany);
module.exports = router;
