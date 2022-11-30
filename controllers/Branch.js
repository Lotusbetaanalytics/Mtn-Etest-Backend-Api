const path = require("path");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Branch = require("../models/Branch");
const Company = require("../models/Company");

// @desc    Create Branch/
// @route   POST/api/v1/branch/
// @access   Private/Artist
exports.createBranch = asyncHandler(async (req, res, next) => {
  const checkBranch = await Branch.find({ name: req.body.name });

  if (checkBranch.length > 0) {
    return next(new ErrorResponse("Branch already exist", 400));
  }
  req.body.user = req.user.id;
  req.body.company = req.user.company;
  const data = await Branch.create(req.body);

  // update company branch
  const company = await Company.findById(req.user.company);
  const branches = company.branch;
  branches.push(data._id);
  await Company.findByIdAndUpdate(
    company._id,
    { branch: branches },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(201).json({
    success: true,
    data,
  });
});

// @desc    Get All Genre
// @route   POST/api/v1/branch/
// @access   Private/Admin
exports.getBranch = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Update Branch
// @route   PUT/api/v1/branch
// @access   Private

exports.updateBranch = asyncHandler(async (req, res, next) => {
  const branch = await Branch.findById(req.params.id);

  if (!branch) {
    return next(new ErrorResponse("Branch not found", 404));
  }
  const data = await Branch.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    success: true,
    data,
  });
});

// @desc    Delete Branch
// @route   DELTE/api/v1/branch
// @access   Private/Admin
exports.deleteBranch = asyncHandler(async (req, res, next) => {
  await Branch.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    data: {},
  });
});
