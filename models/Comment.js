const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Comment = new Schema({
    ID_comment: String,
    ID_book: String,
    ID_customer: String,
    Content: String
})

module.exports = mongoose.model('Comment', Comment);