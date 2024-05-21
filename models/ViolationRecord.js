const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ViolationRecordSchema = new Schema({
    customer: {type: Schema.Types.ObjectId, ref: "Customer", require: true},
    timeStamp: {type: Date, require: true},
})


module.exports = mongoose.model('ViolationRecord', ViolationRecordSchema);