const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Book = new Schema({
    ID_book: String,
    Name: String,
    Image: String,
    Genre: String,
    Author: String,
    Review: String
});

module.exports = mongoose.model('Book', Book);