const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Author = new Schema({
    ID_author: String,
    Name: String
})


module.exports = mongoose.model('Author', Author);