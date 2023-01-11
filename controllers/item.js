const asyncHandler = require("../middleware/async")
const Item = require("../models/Item")
const {ErrorResponseJSON, SuccessResponseJSON} = require("../utils/errorResponse")


exports.populateItem = {path: ""}


// @desc    Create Item
// @route  POST /api/v1/item
// @access   Private
exports.createItem = asyncHandler(async (req, res, next) => {
  const existingItem = await Item.find({title: req.body.title})
  if (existingItem.length > 0) {
    return new ErrorResponseJSON(res, "This item already exists, update it instead!", 400)
  }

  const item = await Item.create(req.body)
  return new SuccessResponseJSON(res, item, 201)
})


// @desc    Get all Items
// @route  GET /api/v1/item
// @access   Public
exports.getAllItems = asyncHandler(async (req, res, next) => {
  return res.status(200).json(res.advancedResults)
})


// @desc    Get Item
// @route  GET /api/v1/item/:id
// @access   Private
exports.getItem = asyncHandler(async (req, res, next) => {
  const item = await Item.findById(req.params.id).populate(this.populateItem)
  return new SuccessResponseJSON(res, item)
})


// @desc    Update Item
// @route  PATCH /api/v1/item/:id
// @access   Private
exports.updateItem = asyncHandler(async (req, res, next) => {
  const item = await Item.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })
  await item.save()
  return new SuccessResponseJSON(res, item)
})


// @desc    Delete Item
// @route  DELETE /api/v1/item
// @access   Private
exports.deleteItem = asyncHandler(async (req, res, next) => {
  const item = await Item.findByIdAndDelete(req.params.id)
  return new SuccessResponseJSON(res, item)
})


// @desc    Delete All Items
// @route  DELETE /api/v1/item/:id
// @access   Private
exports.  deleteAllItems = asyncHandler(async (req, res, next) => {
  const item = await Item.deleteMany()
  console.info("All items deleted".bgRed)
  return new SuccessResponseJSON(res, item)
})