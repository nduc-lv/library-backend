const Customer = require("../models/Customer");
const Record = require("../models/Record");
const Book = require("../models/Book")
const ViolationRecord = require("../models/ViolationRecord")
const {sendingMail} = require("../util/mailling")
const schedule = require('node-schedule');


const getNotifcationRecords = async () => {
    try {
        const currentDate = new Date();
        const reservations = await Record.find({status: "Đặt trước"}).populate('customer').populate("book").exec();
        const notficationRecords = reservations.filter((record) => {
            const timeEnd = record.timeEnd;
            const differenceInTime = new Date(timeEnd).getTime() - currentDate.getTime();
            const dateDiff =  Math.round(differenceInTime / (1000 * 3600 * 24));
            if (0 <= dateDiff && dateDiff <= 2) {
                return record
            }
        })
        return notficationRecords   
    }
    catch(e) {
        throw e
    }
}

const getViolatedRecords = async () => {
    try {
        const currentDate = new Date();
        const reservations = await Record.find({status: "Đặt trước"}).exec();
        const violatedRecords = reservations.filter((record) => {
            const timeEnd = record.timeEnd;
            const differenceInTime = new Date(timeEnd).getTime() - currentDate.getTime();
            const dateDiff =  Math.round(differenceInTime / (1000 * 3600 * 24));
            if (dateDiff < 0) {
                return record
            }
        })
        return violatedRecords  
    }
    catch (e) {
        throw e
    }
}

const getOutdatedRecords = async () => {
    try {
        const currentDate = new Date();
        const reservations = await Record.find({status: "Đang mượn"}).exec();
        const violatedRecords = reservations.filter((record) => {
            const timeEnd = record.timeEnd;
            const differenceInTime = new Date(timeEnd).getTime() - currentDate.getTime();
            const dateDiff =  Math.round(differenceInTime / (1000 * 3600 * 24));
            if (dateDiff < 0) {
                return record
            }
        })
        return violatedRecords  
    }
    catch (e) {
        throw e
    }
}
const getAlmostOutdateRecords = async () => {
    try {
        const currentDate = new Date();
        const reservations = await Record.find({status: "Đang mượn"}).populate('customer').populate("book").exec();
        const violatedRecords = reservations.filter((record) => {
            const timeEnd = record.timeEnd;
            const differenceInTime = new Date(timeEnd).getTime() - currentDate.getTime();
            const dateDiff =  Math.round(differenceInTime / (1000 * 3600 * 24));
            if (dateDiff > 0 && dateDiff < 4) {
                return record
            }
        })
        return violatedRecords  
    }
    catch (e) {
        throw e
    }
}
const getIncreaseList = async () => {
    try {
        const currentDate = new Date();
        const violatedList = await ViolationRecord.find().exec()
        const increaseList = violatedList.filter((record) => {
            const timeStamp = record.timeStamp;
            const differenceInTime = -new Date(timeStamp).getTime() + currentDate.getTime();
            const dateDiff = Math.round(differenceInTime / (1000 * 3600 * 24));
            if (dateDiff >= 7) {
                return record;
            }
        })
        return increaseList  
    }
    catch (e) {
        throw e
    }
}

const task = async () => {
    try {
        const notficationRecords = await getNotifcationRecords();
        const violatedRecords = await getViolatedRecords();
        const outdatedRecords = await getOutdatedRecords();
        const increaseList = await getIncreaseList();
        const almostOutDateRecords = await getAlmostOutdateRecords();
        // send notfication
        notficationRecords.forEach(async (record) => {
            const customerEmail = record.customer.email;
            await sendingMail({
                from: "no-reply@gmail.com",
                to: `${customerEmail}`,
                subject: "ĐƠN SÁCH SẮP HẾT HẠN",
                text: `Xin chao, ${record.customer.name}. Bạn có 1 đơn đặt trước sách "${record.book.name}" sắp hết hạn, vui lòng đến lấy tại thư viện`
            })
        })
        almostOutDateRecords.forEach(async (record) => {
            const customerEmail = record.customer.email;
            await sendingMail({
                from: "no-reply@gmail.com",
                to: `${customerEmail}`,
                subject: "ĐƠN SÁCH SẮP HẾT HẠN",
                text: `Xin chao, ${record.customer.name}. Bạn có 1 đơn mượn sách "${record.book.name}" sắp hết hạn, vui lòng đến trả tại thư viện`
            })
        })
        // delete and penalty violated record
        violatedRecords.forEach(async (record) => {
            await Book.findOneAndUpdate({_id: record.book}, {$inc: {quantity: record.numberOfBooks}});
            await Record.findByIdAndDelete({_id: record._id});
            await Customer.findOneAndUpdate({_id: record.customer, reputation: {$gt: 10}}, {$inc: {reputation: -10}});
            await ViolationRecord.findOneAndUpdate({customer: record.customer}, {timeStamp: new Date().toISOString()}, { upsert: true, new: true, setDefaultsOnInsert: true })
        })
        
        // banned account
        outdatedRecords.forEach(async (record) => {
            await Record.findOneAndUpdate({_id: record._id}, {status: "Quá hạn"});
            await Customer.findOneAndUpdate({_id: record.customer}, {reputation: 1})
            await ViolationRecord.findOneAndUpdate({customer: record.customer}, {timeStamp: new Date().toISOString()}, { upsert: true, new: true, setDefaultsOnInsert: true })
        })

        // update customer score
        increaseList.forEach(async (record) => {
            await Customer.findOneAndUpdate({$and:[{_id: record.customer}, {reputation: {$gt: 10}}, {reputation: {$lt: 90}}]} ,{$inc: {reputation: 10}});
            await ViolationRecord.findOneAndUpdate({_id: record._id}, {timeStamp: new Date().toISOString()}, { upsert: true, new: true, setDefaultsOnInsert: true })
        })
    }
    catch (e) {
        console.log(e)
    }
}

exports.schedulTask = () => {
    schedule.scheduleJob({hour: 6, minute: 0}, task)
}