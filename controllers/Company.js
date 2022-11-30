const path = require("path");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Company = require("../models/Company");
const User = require("../models/User");

// @desc    Create Company/
// @route   POST/api/v1/Company/
// @access   Private/Artist
exports.createCompany = asyncHandler(async (req, res, next) => {
  req.body.role = "SuperAdmin";
  const thumb = req.files.logo;
  if (!thumb) {
    return next(new ErrorResponse(`Please upload company logo`, 400));
  }
  //Make sure the image is a photo
  if (!thumb.mimetype.startsWith("image")) {
    return next(new ErrorResponse(`Please Upload an Image`, 400));
  }

  // Check filesize
  if (thumb.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please Upload an image less than ${process.env.MAX_FILE_UPLOAD}`,
        400
      )
    );
  }
  //crete custom filename
  thumb.name = `${req.body.name}_${thumb.name}${path.parse(thumb.name).ext}`;
  thumb.mv(`${process.env.FILE_UPLOAD_PATH}/${thumb.name}`, async (err) => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse(`An error occured while uploading`, 500));
    }
  });
  req.body.logo = `/uploads/${thumb.name}`;

  const data = await Company.create(req.body);
  if (!data)
    return next(
      new ErrorResponse("Something went wrong, Please try again later", 500)
    );
  req.body.company = data._id;
  const user = await User.create(req.body);
  res.status(201).json({
    success: true,
    data,
    user,
  });
});

// @desc    Get All Company
// @route   POST/api/v1/Company/
// @access   Private/Admin
exports.getCompany = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Update Company
// @route   PUT/api/v1/Company
// @access   Private

exports.updateCompany = asyncHandler(async (req, res, next) => {
  const Company = await Company.findById(req.params.id);

  if (!Company) {
    return next(new ErrorResponse("Company not found", 404));
  }
  const data = await Company.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    success: true,
    data,
  });
});

// @desc    Delete Company
// @route   DELTE/api/v1/Company
// @access   Private/Admin
exports.deleteCompany = asyncHandler(async (req, res, next) => {
  await Company.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Get All Company
// @route   POST/api/v1/Company/
// @access   Private/Admin
exports.checkCompany = asyncHandler(async (req, res, next) => {
  const company = await Company.find();
  if (company.length === 0) {
    return next(new ErrorResponse("Company not found", 404));
  }

  res.status(200).json({
    success: true,
    company: true,
  });
});
