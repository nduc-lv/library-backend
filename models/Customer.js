const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Customer = new Schema({
    ID_customer: String,
    Name: String,
    Phone: String,
    Email: String,
    Age: String,
    Address: String,
    Reputation: String
})


module.exports = mongoose.model('Customer', Customer);