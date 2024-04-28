const Book = require("../models/Book");
const Genre = require("../models/Genre")
const Author = require("../models/Author");
const Customer = require("../models/Customer")
const Comment = require("../models/Comment");
const Record = require("../models/Record");

const asyncHandler = require("express-async-handler");
const { validator, body, validationResult } = require("express-validator");

// -------BOOK------- //

//[get] Allbook
exports.getAllBooks = asyncHandler(async (req, res, next) => {
    const { limit, page } = req.query;
    const [books, count] = await Promise.all([
        Book.find().skip((page - 1) * limit).populate("authors").populate("genres").limit(limit * 1).exec(),
        Book.countDocuments()
    ])
    return res.status(200).json({
        books,
        totalPages: Math.ceil(count / limit),
        currentPage: page
    })
})

//[get] Detailbook
exports.getBookDetails = asyncHandler(async (req, res, next) => {
    const bookId = req.params.bookId;
    const book = await Book.findById(bookId).populate("genres").populate("authors").exec();
    if (!book) {
        return res.status(404).json({
            message: "Book not found"
        })
    }
    return res.status(200).json({
        book
    })
})

//[post] add book
exports.postAddBook = asyncHandler(async (req, res, next) => {

    // add book
    const newBook = new Book(req.body);
    await newBook.save();

    return res.status(200).json({
        status: 1,
        message: "Add book success"
    })
})
//[post] updateBook 
exports.postUpdateBook = asyncHandler(async (req, res, next) => {
    const bookId = req.params.bookId;
    // check book
    const book = await Book.findById(bookId).exec();
    if (!book) {
        return res.status(404).json({
            message: "book not found"
        })
    }

    await Book.updateOne({ _id: bookId }, req.body);

    res.status(200).json({
        status: 1,
        message: "Update book success",
    })
})

//[post] delete book
exports.postDeleteBook = asyncHandler(async (req, res, next) => {
    const bookId = req.body.bookId;

    // find book
    const book = await Book.findById(bookId).exec();
    if (!book) {
        return res.status(404).json({
            message: "book not found"
        })
    }

    await Book.deleteOne({ _id: bookId })

    return res.status(200).json({
        status: 1,
        message: "Success"
    })
})

// ------ Record ------- //

// [get] allCustomer
exports.getAllCustomer = asyncHandler(async (req, res, next) => {
    const { limit, page } = req.query;
    const [customers, count] = await Promise.all([
        Customer.find().skip((page - 1) * limit).limit(limit * 1).exec(),
        Customer.countDocuments()
    ])
    return res.status(200).json({
        customers,
        totalPages: Math.ceil(count / limit),
        currentPage: page
    })
})

//[get] customerDetail
exports.getCustomerDetail = asyncHandler(async (req, res, next) => {
    const customerId = req.params.customerId;
    const customer = await Customer.findById(customerId);
    if (!customer) {
        return res.status(404).json({
            message: "Customer not found"
        })
    }
    return res.status(200).json({
        customer
    })
})

//[get] customerRecord
exports.getCustomerRecord = asyncHandler(async (req, res, next) => {
    const customerId = req.params.customerId;
    const records = Record.find({ customer: customerId })
        .populate("book").exec();

    if (!records) {
        return res.status(404).json({
            message: "Customer has no record"
        })
    }

    return res.status(200).json({
        records
    })
})

//[post] updateCustomerRecord
exports.postUpdateRecord = asyncHandler(async (req, res, next) => {
    const recordId = req.params.recordId;

    const bookId = req.body.bookId;
    const customerId = req.body.customerId;
    const NumberOfBooks = req.body.numberOfBooks;
    const Status = req.body.status;

    const [customer, book, record] = await Promise.all([
        Customer.findById(customerId).exec(),
        Book.findById(bookId).select('quantity').exec(),
        Record.findOne({ _id: recordId, customer: customerId }).populate("book").exec()
    ])
    if (!customer) {
        return res.status(404).json({
            message: "Customer not found"
        })
    }
    if (!book) {
        return res.status(404).json({
            message: "Book not found"
        })
    }
    if (!record) {
        return res.status(404).json({
            message: "Record not found"
        })
    }

    const oldbook = Book.find({ _id: record.book }).exec();

    Book.updateOne({ _id: oldbook._id }, { quantity: oldbook.quatity + record.numberOfBooks })

    let count = book.quantity;

    if ((count - NumberOfBooks * 1) > 0) {

        await Promise.all(
            [
                Book.updateOne({ _id: bookId }, { quantity: count - NumberOfBooks * 1 }),
                Record.updateOne({ _id: recordId }, { book: bookId }, { customer: customerId }, { numberOfBooks: NumberOfBooks }, { status: Status })
            ]
        );
        return res.status(200).json({
            status: 1,
            message: "Update successfully"
        });
    }
    else {
        res.status(200).json({
            status: -1,
            message: "Out of books"
        })
    }
})


//[post] deleteCustomerRecord
exports.postDeleteRecord = asyncHandler(async (req, res, next) => {
    const recordId = req.params.recordId;

    const record = await Record.findById(recordId).exec();
    if (!record) {
        return res.status(404).json({
            message: "Record not found"
        })
    }

    await Comment.deleteOne({ _id: recordId })
    return res.status(200).json({
        status: 1,
        message: "Delete record successful"
    })
})

