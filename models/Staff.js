const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Staff = new Schema({
    Username: String,
    Password: String
})


module.exports = mongoose.model('Staff', Staff);