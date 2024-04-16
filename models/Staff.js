const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StaffSchema = new Schema({
    username: {type: String},
    password: {type: String},
    refreshToken: {type: String},
    accessToken: {type: String}
})


module.exports = mongoose.model('Staff', StaffSchema);