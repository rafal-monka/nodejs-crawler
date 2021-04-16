
const mongoose = require('mongoose')

const pimpSchema = new mongoose.Schema({
    category: String,
    id: String, 
    name: String,
    price: Number,
    description: String,
    description2: String
})

module.exports = mongoose.model('Pimp', pimpSchema)
