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
    if (!book){
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
    const book = await Book.findOne({$and:[{name: req.body.name} ,{authors: req.body.authors}]}).exec();
    if(book){
        return res.status(400).json({
            message: "Book Existed",
            book
        })
    
    }
    // add book
    const newBook = new Book({
        name : req.body.name,
        image: req.file.originalname,
        genres: req.body.genres,
        authors: req.body.authors,
        review: req.body.review,
        quantity: req.body.quantity
    });
    await newBook.save();

    return res.status(200).json({
     
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

    await Book.updateOne({ _id: bookId }, {
        name : req.body.name,
        image: req.file.originalname,
        genres: req.body.genres,
        authors: req.body.authors,
        review: req.body.review,
        quantity: req.body.quantity
    });

    res.status(200).json({
    
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
    
        message: "Success"
    })
})

// ------ Record ------- //

// [get] allCustomer
exports.getAllCustomer = asyncHandler(async (req, res, next) => {
    const { limit, page } = req.query;
    const [customers, count] = await Promise.all([
        Customer.find().skip( (page - 1) * limit).limit(limit * 1).exec(),
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
    const records =await Record.find({ customer: customerId })
                        .populate("customer").populate("book").exec();
    
    if (!records.length ) {
        return res.status(404).json({
            message: "Customer has no record"
        })
    }

    return res.status(200).json({
        records
    })
})

//[post] addCustomerRecord
exports.postAddRerord = asyncHandler( async (req, res, next) => {

    const book = await Book.findById(req.body.bookId).exec();
    if(!book){
        return res.status(404).json({
            message: "Book not found",
        }) 
    }

    const quantity= book.quantity;
 
    if(quantity < req.body.numberOfBooks * 1){
        return res.status(400).json({
            message: "Out of book"
        })
    }
   
    await Book.updateOne({_id: req.body.bookId} , {quantity: quantity - req.body.numberOfBooks * 1});

    const date = new Date();
    const newRecord = new Record({
        book: req.body.bookId,
        customer: req.body.customerId,
        status: "Đặt cọc",
        numberOfBooks: req.body.numberOfBooks,
        timeStart: date.toISOString(),
        timeEnd: date.setDate(date.getDate() + 7)
    })
    await newRecord.save();
    return res.status(200).json({
        message: "Add record success",
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

    const oldbook = await Book.find({ _id: record.book }).exec();

    await Book.updateOne({ _id: oldbook._id }, { quantity: oldbook.quatity + record.numberOfBooks })

    let count = book.quantity;

    if ((count - NumberOfBooks * 1) > 0) {

        await Promise.all(
            [
                Book.updateOne({ _id: bookId }, { quantity: count - NumberOfBooks * 1 }),
                Record.updateOne({ _id: recordId }, { book: bookId }, { customer: customerId }, { numberOfBooks: NumberOfBooks }, { status: Status })
            ]
        );
        return res.status(200).json({
    
            message: "Update successfully"
        });
    }
    else {
        res.status(400).json({
      
            message: "Out of books"
        })
    }
})


//[post] deleteRecord
exports.postDeleteRecord = asyncHandler(async (req, res, next) => {
    const recordId = req.body.recordId;

    const record = await Record.findById(recordId).exec();
    if (!record) {
        return res.status(404).json({
            message: "Record not found"
        })
    }

    await Record.deleteOne({ _id: recordId })
    return res.status(200).json({
    
        message: "Delete record successful"
    })
})

// ------ Genres ------- //

//[get] allGenres
exports.getAllGenres = asyncHandler(async (req, res, next) => {
    const { limit, page } = req.query;
    const [genres, count] = await Promise.all([
        Genre.find().skip((page - 1) * limit).limit(limit * 1).exec(),
        Genre.countDocuments()
    ])
    return res.status(200).json({
        genres,
        totalPages: Math.ceil(count / limit),
        currentPage: page
    })
})

//[post] addGenre
exports.postAddGenre = asyncHandler(async (req, res, next) => {

   const genre = await Genre.findOne({name:req.body.name}).exec();
    
   if(!genre ){
        const newGenre= new Genre({
            name:req.body.name
        })
        await newGenre.save();
        return res.status(200).json({
        message: "Add genre success"
        })
    }
    return res.status(400).json({
            message: "Genre existed",
    }) 

})
//[post] updateGenre
exports.postUpdateGenre = asyncHandler(async (req, res, next) =>{
    const genreId= req.params.genreId;
    //find genre
    const genre = await Genre.findById(genreId).exec();
    if(!genre){
        return res.status(404).json({
            message: "Genre not found"
        })
    }
       // check existed new genre
    const genre1 = await Genre.findOne({name: req.body.name}).exec();
    if(genre1){
        return res.status(400).json({
            message: "Genre existed"
        })
    }

    await Genre.updateOne({_id: genreId}, {name: req.body.name});
    return res.status(200).json({
        message: "Update Genre success"
    })
})

//[post] deleteGenre
exports.postDeleteGenre = asyncHandler(async (req, res, next) => {

    const genre = await Genre.findOne({name:req.body.name}).exec();
     
    if(!genre){
           return res.status(404).json({
             message: "Genre not found"
    }) 
    }
    await Genre.deleteOne({ name:req.body.name })
    return res.status(200).json({
        message: "Delete genre success"
    })
 
 })


// ------ Authors ------- //
//[get] allAuthor
exports.getAllAuthors = asyncHandler(async (req, res, next) => {
    const { limit, page } = req.query;
    const [authors, count] = await Promise.all([
        Author.find().skip((page - 1) * limit).limit(limit * 1).exec(),
        Author.countDocuments()
    ])
    return res.status(200).json({
        authors,
        totalPages: Math.ceil(count / limit),
        currentPage: page
    })
})

//[post] addAuthor
exports.postAddAuthor = asyncHandler(async (req, res, next) => {

   const author = await Author.findOne({name:req.body.name}).exec();
    
   if(!author ){
        const newAuthor= new Author({
            name:req.body.name
        })
        await newAuthor.save();
        return res.status(200).json({
        message: "Add author success"
        })
    }
    return res.status(400).json({
            message: "Author existed",
    }) 

})
//[post] updateAuthor
exports.postUpdateAuthor = asyncHandler(async (req, res, next) =>{
    const authorId= req.params.authorId;
    // find author
    const author = await Author.findById(authorId).exec();
    if(!author){
        return res.status(404).json({
            message: "Author not found"
        })
    }
    // check existed new author
    const author1 = await Author.findOne({name: req.body.name}).exec();
    if(author1){
        return res.status(400).json({
            message: "Author existed"
        })
    }

    await Author.updateOne({_id: authorId}, {name: req.body.name});
    return res.status(200).json({
        message: "Update Author success"
    })
})

//[post] deleteAuthor
exports.postDeleteAuthor = asyncHandler(async (req, res, next) => {

    const author = await Author.findOne({name:req.body.name}).exec();
     
    if(!author){
           return res.status(404).json({
             message: "Author not found"
    }) 
    }
    await Author.deleteOne({ name:req.body.name })
    return res.status(200).json({
        message: "Delete Author success"
    })
 
 })