const router = require("express").Router();
const Item = require("../models/Item");
const {createItem, getAllItems, getItem, updateItem, deleteItem, populateItem, deleteAllItems} = require("../controllers/item");
const {verifyToken, authorize} = require("../middleware/auth");
const advancedResults = require("../middleware/advancedResults");


router.post("/", verifyToken, authorize("Admin",), createItem); // create a item
router.get("/", advancedResults(Item, populateItem), getAllItems); // get all items
router.get("/:id", verifyToken, getItem); // get item details by id
router.patch("/:id", verifyToken, authorize("Admin",), updateItem); // update item details by id
router.delete("/:id", verifyToken, authorize("Admin",), deleteItem); // delete item by id
router.delete("/delete/all/items", verifyToken, authorize("Admin"), deleteAllItems); // delete response by id

module.exports = router;
