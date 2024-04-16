const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Record = new Schema({
    ID_record: String,
    ID_book: String,
    ID_customer: String,
    Number_of_books: String,
    TimeStart: Date,
    TimeEnd: Date,
    Status: String
})


module.exports = mongoose.model('Record', Record);