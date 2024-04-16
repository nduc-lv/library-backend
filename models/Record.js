const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RecordSchema = new Schema({
    book: {type: Schema.Types.ObjectId, ref: "Book", require: true},
    customer: {type: Schema.Types.ObjectId, ref: "Customer", require: true},
    numberOfBooks: {type: Number, require: true},
    timeStart: {type: Date, require: true},
    timeEnd: {type: Date},
    status: {type: String, require: true},
})


module.exports = mongoose.model('Record', RecordSchema);