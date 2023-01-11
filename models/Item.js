const mongoose = require('mongoose')


const Item = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
})

module.exports = mongoose.model("Item", Item);