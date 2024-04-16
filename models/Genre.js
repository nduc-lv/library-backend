const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Genre = new Schema({
    ID_genre: String,
    Name: String
})


module.exports = mongoose.model('Genre', Genre);