const Book = require("../models/Book");
const Genre = require("../models/Genre")
const Author = require("../models/Author");
const Customer = require("../models/Customer")
const Comment = require("../models/Comment");
const Record = require("../models/Record");
const asyncHandler = require("express-async-handler");
const validator = require("express-validator");


// BOOK //
// get books by genre
exports.postBooksByGenres = asyncHandler(async (req, res, next) => {
    // get a list of genres
    const genres = req.body.genres;
    const books = await Book.find(
        {genres: {$in: genres}}
    ).populate("authors").populate("genres").exec();
    res.status(200).json({
        books
    })
})
// get book details
exports.getBookDetails = asyncHandler(async (req, res, next) => {
    const bookId = req.params.bookId;
    const book = await Book.findById(bookId).populate("genres").populate("authors").exec();
    if (!book){
        return res.status(404).json({
            message: "Book not found"
        })
    }
    return res.status(200).json({
        book
    })
})
// search books
exports.getSearch = asyncHandler(async (req, res, next) => {
    // get query
    const {q, limit, page} = req.query;

    // find {limit} book collections that name == q or author == q
    const authors = await Author.find(
        {name: {$regex: ".*" + q + ".*", $options: 'i'}}
    ).select({_id: 1}).exec();
    const books = await Book.find({
        $or: [
            {name: {$regex: ".*" + q + ".*", $options: 'i'}},
            {authors: {$in: authors}}
        ]
    }).skip((page -1) * limit).populate("authors").populate("genres").limit(limit * 1).exec();
    const count = await Book.countDocuments({
        $or: [
            {name: {$regex: ".*" + q + ".*", $options: 'i'}},
            {authors: {$in: authors}}
        ]
    })
    return res.status(200).json({
        books,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
    })
    
})

// reserve book -> need to set a timer
const addRecord = async (customerId, bookId, action, numberOfBooks) => {
    // reserved
    if (action === 1) {
        const newRecord = new Record({
            book: bookId,
            customer: customerId,
            status: "Đặt cọc",
            numberOfBooks: numberOfBooks
        })
        await newRecord.save();
    }
}
exports.postReserveBooks = asyncHandler(async (req, res, next) => {
    // get the id of the book the user want to reserve
    const bookId = req.body.bookId;
    const customerId = req.body.customerId;
    const numberOfBooks = req.body.numberOfBooks;
    // get the current quantity of the book
    const book = await Book.findById(bookId).select('quantity').exec();
    let count;
    if (book){
        count = book.quantity
    }
    else{
        return res.status(404).json({
            message: "Book not found"
        })
    }
    if ((count - numberOfBooks * 1) > 0){
        // update quantity
        await Promise.all(
            [Book.updateOne({_id: bookId}, {quantity: count - numberOfBooks * 1}),
             addRecord(customerId, bookId, 1,numberOfBooks)
            ]   
        );
        /* notify the staff using socket

        */
        return res.status(200).json({
            status: 1,
            message: "Reserved successfully"
        });   
    }
    else{
        res.status(200).json({
            status: -1,
            message: "Out of books"
        })
    }
})

// update reservation
exports.postUpdateReservation = asyncHandler(async(req, res, next) => {
    const bookId = req.body.bookId;
    const customerId = req.body.customerId;
    const numberOfBooks = req.body.numberOfBooks;
    const recordId = req.body.recordId;
    // get the current quantity of the book
    const [book, record] = await Promise.all([
        Book.findById(bookId).select('quantity').exec(),
        Record.findOne({_id: recordId, customer: customerId, status: {$regex: ".*Đặt cọc*.", $options: 'i'}}).populate("book").exec() 
    ]) 
    let count;
    if (book){
        count = book.quantity
    }
    else{
        return res.status(404).json({
            message: "Book not found"
        })
    }
    if (!record){
        return res.status(404).json({
            message: "Record not found"
        })
    }
    if ((count + record.numberOfBooks - numberOfBooks * 1) > 0){
        // update quantity
        await Promise.all(
            [Book.updateOne({_id: bookId}, {quantity: count + record.numberOfBooks - numberOfBooks * 1}),
             Record.updateOne({_id: recordId}, {quantity: numberOfBooks})
            ]   
        );
        /* notify the staff using socket

        */
        return res.status(200).json({
            status: 1,
            message: "Reserved successfully"
        });   
    }
    else{
        res.status(200).json({
            status: -1,
            message: "Out of books"
        })
    }
})

exports.postDeleteReservation = asyncHandler(async (req, res, next) => {
    const bookId = req.body.bookId;
    const customerId = req.body.customerId;
    const recordId = req.body.recordId;
    // get the current quantity of the book
    const [book, record] = await Promise.all([
        Book.findById(bookId).select('quantity').exec(),
        Record.findOne({_id: recordId, customer: customerId, status: {$regex: ".*Đặt cọc*.", $options: 'i'}}).populate("book").exec() 
    ]) 
    let count;
    if (book){
        count = book.quantity
    }
    else{
        return res.status(404).json({
            message: "Book not found"
        })
    }
    if (!record){
        return res.status(404).json({
            message: "Record not found"
        })
    }
    await Promise.all(
        [Book.updateOne({_id: bookId}, {quantity: count + record.numberOfBooks * 1}),
         Record.deleteOne({_id: recordId})
        ]   
    );
    return res.status(200).json({
        status: -1,
        message: "Out of books"
    })
})

// COMMENT
exports.postAddComment = asyncHandler(async (req, res, next) => {
    // get params
    const customerId = req.body.customerId;
    const bookId = req.body.bookId;
    const content = req.body.content;

    const date = new Date;
    const now = date.toISOString();
    // add comment
    const newComment = new Comment({
        customer: customerId,
        book: bookId,
        content: content,
        timeStamp: now
    })
    await newComment.save();
    /*
        Notify all users using socket
    */
    return res.status(200).json({
        status: 1,
        message: "Success"
    })
})

exports.postChangeComment = asyncHandler(async (req, res, next) => {
    const commentId = req.body.commentId;
    const customerId = req.body.customerId;
    const newContent = req.body.content;
    // find this comment
    const comment = await Comment.findById(commentId).exec();
    if (!comment){
        return res.status(404).json({
            message: "Comment not found"
        })
    }
    if (customerId != comment.customer){
        return res.status(403).json({
            status: 2,
            message: "Unauthorized"
        })
    }
    await Comment.updateOne({_id: commentId}, {content: newContent});
    /*
        Notify all users using socket
    */
    return res.status(200).json({
        status: 1,
        message: "Success"
    })
})

exports.postDeleteComment = asyncHandler(async (req, res, next) => {
    const commentId = req.body.commentId;
    const customerId = req.body.customerId;
   
    // find this comment
    const comment = await Comment.findById(commentId).exec();
    if (!comment){
        return res.status(404).json({
            message: "Comment not found"
        })
    }
    if (customerId != comment.customer){
        return res.status(403).json({
            status: 2,
            message: "Unauthorized"
        })
    }
    await Comment.deleteOne({_id: commentId})
    return res.status(200).json({
        status: 1,
        message: "Success"
    })
})

exports.getAllComments = asyncHandler(async (req, res, next) => {
    const bookId = req.params.bookId;
    const comments = await Comment.find({
        book: bookId
    }).populate("customer").exec();
    return res.status(200).json({
        comments
    })
})

