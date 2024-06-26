const Book = require("../models/Book");
const Genre = require("../models/Genre")
const Author = require("../models/Author");
const Customer = require("../models/Customer")
const Comment = require("../models/Comment");
const Record = require("../models/Record");
const Staff = require("../models/Staff");

const asyncHandler = require("express-async-handler");
const { validator, body, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken")
require('dotenv').config()
// -------STAFFS------- //

//[post] login
exports.postStaffLogin = asyncHandler(async (req, res, next) =>{
    const Username = req.body.username;
    const Password = req.body.password;
    const account = await Staff.findOne({username: Username}).exec();
 
    if(!account){
        return res.status(404).json({
            message: "Tai khoan khong ton tai"
        })
    }
    if(Password != account.password){
        return res.status(400).json({
            message: "Mat khau khong dung"
        })
    }
 
 
    const accessToken = jwt.sign({id: account._id}, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1d"
    })
    const refreshToken = jwt.sign({id: account._id}, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '30d'
    })
  
    await Staff.updateOne({_id: account._id}, {$set:
                                                {accessToken: accessToken , 
                                                refreshToken: refreshToken 
                                            }
                                        })
    return res.status(200).json({
        accessToken,
        refreshToken,
        message: "Dang nhap thanh cong"
    })
})

exports.authen = (req, res, next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1];
   
    if (!token ) return res.sendStatus(401);
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({
                message: "ERR ACCESS TOKEN"
            })
        }
        res.locals.staffId = user.id;
        next()
    })
}

exports.refreshToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    console.log(process.env.ACCESS_TOKEN_SECRET)
    if (token == null){
        return res.status(403).json({
            message: "ERR REFRESH TOKEN"
        })
    }
    else{
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
            console.log(err);
            console.log(user);
            if (err) {
                return res.status(403).json({
                    message: "ERR REFERSH TOKEN"
                })
            }
            const newToken = jwt.sign({id: user.id}, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: "1d"
            })
            return res.status(200).json({
                accessToken: newToken
            })
        })
    }
}
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

//[post] addBook
exports.postAddBook = asyncHandler(async (req, res, next) => {
    const book = await Book.findOne({$and:[{name: req.body.name} ,{authors: req.body.authors}]}).exec();
    if(book){
        return res.status(400).json({
            message: "Book Existed",
        })
    
    }
    console.log(req.body.genres)
    console.log(req.body.authors)
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
        image: req.file.originalname,
    });

    res.status(200).json({
    
        message: "Update book success",
    })
})
exports.postUpdateBookSingle = asyncHandler(async (req, res, next) => {
    const bookId = req.params.bookId;
    const type = req.params.type;
    console.log(req.body.name);
    const books = await Book.find({name: req.body.name}).exec();
    console.log(books);
    if (books && books.length > 0 && books[0]._id != bookId){
        return res.status(400).json({
            message: "Book Existed"
        })
    }
    switch (type) {
        case "review":
            await Book.updateOne({_id: bookId}, {review: req.body.review});
            break;
        case "title": 
            await Book.updateOne({_id: bookId}, {name: req.body.name, genres: req.body.genres, authors: req.body.authors})
            break;
        case "quantity":
            await Book.updateOne({_id: bookId}, {quantity: req.body.quantity});
            break;
        
        default:
            return res.status(404).json({
                message: "Not found"
            })
            
    }
    return res.status(200).json({
        message: "Success"
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
    await delBook(bookId);
    return res.status(200).json({
        message: "Delete Book Success"
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

exports.getAllRecords = asyncHandler(async (req, res, next) => {
    const records = await Record.find().populate("book").populate("customer").exec();
    return res.status(200).json({
        records
    })
})

exports.unlockCustomer = asyncHandler(async (req, res,netx) => {
    const customerId = req.body.customerId;

    const customer = await Customer.findById(customerId).exec();
    if (!customer){
        return res.status(404).json({
            message: "Khong tim thay khach hang"
        })
    }
    await Customer.findByIdAndUpdate(customerId, {reputation: 11});
    return res.status(200).json({
        message: "success"
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
    const customer = await Customer.findOne({email: req.body.email}).exec();
    if (!customer){
        return res.status(404).json({
            message: "Customer not found"
        })
    }
    if(!book){
        return res.status(404).json({
            message: "Book not found",
        }) 
    }
    //kiem tra so luong sach con lai
    const quantity= book.quantity;
 
    if(quantity < req.body.numberOfBooks * 1){
        return res.status(400).json({
            message: "Out of book"
        })
    }
    if(customer.reputation <= 10){
        return res.status(400).json({
            message: "Customer not enough reputation"
        })
    }
    await Book.updateOne({_id: req.body.bookId} , {quantity: quantity - req.body.numberOfBooks * 1});
    await Customer.updateOne({_id: req.body.customerId} , {reputation: customer.reputation*1 - 10});

    const date = new Date();
    const newRecord = new Record({
        book: req.body.bookId,
        customer: customer._id,
        status: "Đang mượn",
        numberOfBooks: req.body.numberOfBooks,
        timeStart: date.toISOString(),
        timeEnd: req.body.timeEnd,
    })
    await newRecord.save();
    return res.status(200).json({
        message: "Add record success",
    })
})

exports.getNumberOfBooks = asyncHandler(async (req, res, next) => {
    const bookId = req.params.bookId;
    try {
        const records = await Record.find({book: bookId, status: {$not: /Đã trả/}}).exec();
        
        if (!records || records.length == 0) {
            return res.status(200).json({
                borrowedBooks: 0,
                reservedBooks: 0,
                outdatedBooks: 0
            })
        }
        console.log(records)
        const borrowedBooks = records.reduce((accumulator, record) => {
            if (record.status == "Đang mượn"){
                return accumulator + record.numberOfBooks;
            };
            return accumulator;
        }, 0);
        const reservedBooks = records.reduce((accumulator, record) => {
            if (record.status == "Đặt trước"){
                return accumulator + record.numberOfBooks;
            };
            return accumulator;
        }, 0)
        const outdatedBooks = records.reduce((accumulator, record) => {
            if (record.status == "Quá hạn"){
                return accumulator + record.numberOfBooks;
            }
            return accumulator;
        }, 0)
        return res.status(200).json({
            borrowedBooks,
            reservedBooks,
            outdatedBooks
        })
    }
    catch (e){
        console.log(e);
        throw e;
    }
})

//[post] updateCustomerRecord
exports.postUpdateRecord = asyncHandler(async (req, res, next) => { //thay doi noi dung cua ban ghi muon sach cua khach hang
    const recordId = req.params.recordId;
    const bookId = req.body.bookId;
    const customerId = req.body.customerId;
    const NumberOfBooks = req.body.numberOfBooks;
    const Status = req.body.status;

    const [customer, book, record] = await Promise.all([
        Customer.findById(customerId).exec(),
        Book.findById(bookId).select('quantity').exec(),
        Record.findById(recordId).exec()
    ])
    if(record.status == "Đã trả"){
        return res.status(400).json({
            message: "Record returned, Can not Fix"
        })
    }
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
  
    const oldbook = await Book.findById(record.book).select('quantity').exec() ;
   
    await Book.updateOne({ _id: oldbook._id }, { quantity: oldbook.quantity + record.numberOfBooks })
    let count = book.quantity;
    if ((count - NumberOfBooks ) > 0) {

        await Promise.all(
            [
                Book.updateOne({ _id: bookId }, { $set:{quantity: count - NumberOfBooks } }),
                Record.updateOne({ _id: recordId }, { $set: {
                                                            book: bookId , 
                                                            customer: customerId , 
                                                            numberOfBooks: NumberOfBooks , 
                                                            status: Status 
                                                        }
                                                    })
            ]
        );
        return res.status(200).json({
            message: "Update successfully",
        });
    }
    else {
        res.status(400).json({
      
            message: "Out of books"
        })
    }


})

exports.postReturnBook = (asyncHandler(async (req, res, next) => {
    const recordId = req.body.recordId;
    const record = await Record.findById(recordId).exec();
    if (!record) {
        return res.status(404).json({
            message: "Record not found"
        })
    }
    const currentDate = new Date();
    await Promise.all([
        Book.updateOne({_id: record.book}, {$inc: {quantity: record.numberOfBooks}}),
        Record.updateOne({_id: recordId}, {status: "Đã trả", timeEnd: currentDate.toISOString()})
    ]).catch((e) => {
        console.log(e);
    })
    return res.status(200).json({
        message: "Success"
    })
}))

exports.postBorrowBook = asyncHandler(async (req, res, next) => {
    const recordId = req.body.recordId;
    const record = await Record.findById(recordId).exec();
    if (!record) {
        return res.status(404).json({
            message: "Record not found"
        })
    }
    const timeEnd = req.body.timeEnd;
    await Record.updateOne({_id: recordId}, {status: "Đang mượn",timeEnd: timeEnd, timeStart: new Date().toISOString()})
    return res.status(200).json({
        message: "Success"
    })
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
 
    // trả lại sách
    const book = await Book.findById(record.book).select('quantity').exec();
    // xóa bản ghi
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
    if(req.body.name == "Chưa có thể loại"){
        return res.status(400).json({
            message: "This Genre can't be deleted"})
    }
    const genre = await Genre.findOne({name:req.body.name}).exec();
    
    if(!genre){
           return res.status(404).json({
             message: "Genre not found"
    }) 
    }
    await delGenre(genre._id);
   
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
    await delAuthor(author._id)
    return res.status(200).json({
        message: "Delete Author success"
    })
 
 })

// -------- FUNCTION ------- //

// delBook
const delBook = async (bookId) =>{
    await Comment.deleteMany({book: bookId})
    await Record.deleteMany({book: bookId})
    await Book.deleteOne({_id: bookId})
}

//delAuthor
const delAuthor = async (authorId) =>{
    const books = await Book.find({authors:{$in: authorId}}).exec();

    books.map(async (book) =>{
        const oldAuthors = book.authors
        const newAuthors = oldAuthors.filter(author => author != authorId);
        if (newAuthors.length == 0){
            delBook(book._id);
        }
        await Book.updateOne({_id: book._id}, {
            authors: newAuthors
        });
    });
    await Author.deleteOne({ _id:authorId })
}

//delGenre
const delGenre = async (genreId) => {
    const books =await Book.find({genres: {$in: genreId}}).select('genres').exec()
    books.map(async book =>{
        const oldGenre = book.genres
        const newGenre = oldGenre.filter( gen => !gen.equals(genreId ) );
        if(newGenre.length == 0) newGenre.push("663e4e3dde29fd6a43f8d6af");
        await Book.updateOne({_id: book._id},{
            $set:{
                genres: newGenre
            }
        })
        }
    )
    await Genre.deleteOne({ _id:genreId })
}
