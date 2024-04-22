const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CustomerSchema = new Schema({
    name: {type: String, require: true},
    phone: {type: String},
    email: {type: String, require: true},
    password: {type: String, require: true},
    dateOfBirth: {type: Date, require: true},
    address: {type: String},
    reputation: {type: Number, require: true},
    refreshToken: {type: String},
    accessToken: {type: String},
    isVerified: {type: Boolean}
})


module.exports = mongoose.model('Customer', CustomerSchema);