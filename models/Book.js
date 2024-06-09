const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BookSchema = new Schema({
    name: {type: String, require: true},
    image: {type: String},
    genres: [{type: Schema.Types.ObjectId, ref: "Genre"}],
    authors: [{type: Schema.Types.ObjectId, ref: "Author"}],
    review: {type: String},
    quantity: {type: Number}
});

module.exports = mongoose.model('Book', BookSchema);