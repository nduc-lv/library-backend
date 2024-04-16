const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
    book: {type: Schema.Types.ObjectId, ref: "Book", require: true},
    customer: {type: Schema.Types.ObjectId, ref: "Customer", require: true},
    content: {type: String, require: true},
    timeStamp: {type: Date}
})

module.exports = mongoose.model('Comment', CommentSchema);