const Book = require("../models/Book");
const Genre = require("../models/Genre")
const Author = require("../models/Author");
const Customer = require("../models/Customer")
const Comment = require("../models/Comment");
const Record = require("../models/Record");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt")
const {validator, body, validationResult} = require("express-validator");
const {sendingMail} = require("../util/mailling")
const jwt = require("jsonwebtoken")

//  GENRES //
exports.getAllGenres = asyncHandler(async (req, res, next) => {
    const genres = await Genre.find();
    return res.status(200).json({
        genres
    })
})
// BOOK //
// get books by genre
exports.getAllBooks = asyncHandler(async (req, res, next) => {
    const {limit, page} = req.query;
    const [books, count] = await Promise.all([
        Book.find().skip((page - 1) * limit).populate("authors").populate("genres").limit(limit*1).exec(),
        Book.countDocuments()
    ])
    return res.status(200).json({
        books,
        totalPages: Math.ceil(count / limit),
        currentPage: page
    })
})
exports.postBooksByGenres = asyncHandler(async (req, res, next) => {
    // get a list of genres
    const genres = req.body.genres;
    const {limit, page} = req.query;
    
    const [books, count] = await Promise.all([
        Book.find(
            {genres: {$in: genres}}
        ).skip((page -1) * limit).populate("authors").populate("genres").limit(limit * 1).exec(),
        Book.countDocuments({genres: {$in: genres}})
    ])
    return res.status(200).json({
        books,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
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
    const [books, count] = await Promise.all([
        Book.find({
            $or: [
                {name: {$regex: ".*" + q + ".*", $options: 'i'}},
                {authors: {$in: authors}}
            ]
        }).skip((page -1) * limit).populate("authors").populate("genres").limit(limit * 1).exec(),
        Book.countDocuments({
            $or: [
                {name: {$regex: ".*" + q + ".*", $options: 'i'}},
                {authors: {$in: authors}}
            ]
        })
    ])
    return res.status(200).json({
        books,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
    })
    
})

// reserve book -> need to set a timer
const addRecord = async (customerId, bookId, action, numberOfBooks) => {
    // reserved
    const date = new Date();
    if (action === 1) {
        const newRecord = new Record({
            book: bookId,
            customer: customerId,
            status: "Đặt cọc",
            numberOfBooks: numberOfBooks,
            timeStart: date.toISOString(),
            timeEnd: date.setDate(date.getDate() + 7)
        })
        await newRecord.save();
    }
}
exports.getAllReseveration = asyncHandler(async (req, res, next) => {
    const {type,limit, page} = req.query;
    const customerId = res.locals.customerId // will be replaced
    switch (type * 1) {
        case 1:
            {
                const [reservation, count] = await Promise.all(
                    [
                        Record.find({customer: customerId})
                        .skip((page - 1) * limit).populate({path: "book", populate: {path: "authors"}}).populate({path: "book", populate: {path: "genres"}}).exec(),
                        Record.countDocuments({customer: customerId})
                    ]
                )
                return res.status(200).json({
                    reservation,
                    currentPage: page,
                    totalPages: Math.ceil(count / limit),
                })
            }
        case 2:
            {
                const [reservation, count] = await Promise.all(
                    [
                        Record.find({customer: customerId, status: "Đặt cọc"})
                        .skip((page - 1) * limit).populate({path: "book", populate: {path: "authors"}}).populate({path: "book", populate: {path: "genres"}}).exec(),
                        Record.countDocuments({customer: customerId})
                    ]
                )
                return res.status(200).json({
                    reservation,
                    currentPage: page,
                    totalPages: Math.ceil(count / limit),
                })
            }
        case 3:
            {
                const [reservation, count] = await Promise.all(
                    [
                        Record.find({customer: customerId, status: "Đã trả"})
                        .skip((page - 1) * limit).populate({path: "book", populate: {path: "authors"}}).populate({path: "book", populate: {path: "genres"}}).exec(),
                        Record.countDocuments({customer: customerId})
                    ]
                )
                return res.status(200).json({
                    reservation,
                    currentPage: page,
                    totalPages: Math.ceil(count / limit),
                })
            }
        default:
            break;
    }
})
exports.postReserveBooks = asyncHandler(async (req, res, next) => {
    // get the id of the book the user want to reserve
    const bookId = req.body.bookId;
    const customerId = res.locals.customerId;
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
    const customerId = res.locals.customerId;
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
             Record.updateOne({_id: recordId}, {numberOfBooks: numberOfBooks})
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
        res.status(400).json({
            status: -1,
            message: "Out of books"
        })
    }
})

exports.postDeleteReservation = asyncHandler(async (req, res, next) => {
    const bookId = req.body.bookId;
    const customerId = res.locals.customerId;
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
        status: 1,
        message: "Success"
    })
})

// COMMENT
exports.postAddComment = asyncHandler(async (req, res, next) => {
    // get params
    const customerId = res.locals.customerId;
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
    const customerId = res.locals.customerId;
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
    const customerId = res.locals.customerId;
   
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
    const {limit, page} = req.query
    const bookId = req.params.bookId;
    const [comments, count] = await Promise.all([
        Comment.find({book: bookId}).skip((page - 1) * limit).populate("customer").limit(limit*1).sort({timeStamp: 'desc'}).exec(),
        Comment.countDocuments({book: bookId})
    ])
    return res.status(200).json({
        comments,
        totalPages:  Math.ceil(count / limit),
        currentPage: page
    })
})

// PROFILE

// login
exports.postSignUp  = [
    body("name")
    .trim()
    .isLength({min: 1})
    .escape()
    .isAlphanumeric('vi-VN', {ignore: ' '})
    .withMessage("Ten khong bao gom cac ky ty dac biet"),
    body("email")
    .trim()
    .isEmail()
    .escape()
    .withMessage("Email is not valid"),
    body("dateOfBirth", "Invalid date of birth")
    .optional({values: "falsy"})
    .isISO8601()
    .toDate(),
    body("address")
    .trim()
    .isLength({min: 1})
    .escape()
    .withMessage("Dia chi ko hop le"),
    body("phonenumber")
    .trim()
    .isLength({min: 9})
    .escape()
    .withMessage("so dien thoai khong hop le")
    .isNumeric()
    .withMessage("so dien thoai khong hop le"),
    body("password")
    .trim()
    .isStrongPassword({
        minLength: 8,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
        returnScore: false
    })
    .withMessage("Mat khau it nat 8 ky tu, bao gom it nhat 1 ky tu in hoa, 1 ky tu in thuong, 1 chu so va 1 ky tu dac biet"),
    asyncHandler(async (req, res, next) => {
        const error = validationResult(req);
        const email = req.body.email
        if (!error.isEmpty()){
            return res.status(422).json({
                error
            })
        }
        // check if the email already existed?
        const user = await Customer.findOne({email: email})
        if (user){
            return res.status(409).json({
                message: "Tai khoan da ton tai"
            })
        }

        // save the user, but set isVerified to false
        const info = {
            name: req.body.name,
            email: req.body.email,
            password: await bcrypt.hash(req.body.password, 10),
            isVerified: false,
            dateOfBirth: req.body.dateOfBirth,
            address: req.body.address,
            reputation: 99,
            accessToken: null,
            refreshToken: null,
            phone: req.body.phonenumber
        }
        const newCustomer = new Customer(info);
        await newCustomer.save();
        if (newCustomer) {
            sendingMail({
                from: "no-reply@gmail.com",
                to: `${req.body.email}`,
                subject: "Account Verification Link",
                text: `Xin chao, ${req.body.name}. Xac thuc tai khoan cua ban bang cach nhan vao duong link sau: http://localhost:3001/api/customer/verify-email/${newCustomer._id}` 
            })
        }
        return res.status(200).json({
            message: "Success"
        })
    })

]

exports.verfiyEmail =  asyncHandler(async (req, res, next) => {
    const userId = req.params.userid;
    // find user
    const customer = await Customer.findById(userId)
    if (!customer){
        return res.status(400).json({
            message: "not valid"
        })
    }
    else if (customer.isVerified){
        return res.status(400).json({
            message: "Already verified"
        })
    }
    await Customer.updateOne({_id: userId}, {isVerified: true});
})

exports.postLogin = [
    body("email")
    .trim()
    .isEmail()
    .escape()
    .withMessage("Email khong hop le"),
    body("password")
    .trim()
    .isStrongPassword({
        minLength: 8,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
        returnScore: false
    })
    .withMessage("Mat khau it nat 8 ky tu, bao gom it nhat 1 ky tu in hoa, 1 ky tu in thuong, 1 chu so va 1 ky tu dac biet"),
    asyncHandler(async (req, res, next) => {
        const {email, password} = req.body;
        const customer = await Customer.findOne({email: email, isVerified: true});
        if (!customer){
            return res.status(404).json({
                message: "Tai khoan khong ton tai"
            })
        }
        const isSame = await bcrypt.compare(password, customer.password);
        if (isSame){
            let accessToken = jwt.sign({id: customer._id}, process.env.key, {
                expiresIn: "1d"
            })
            let refreshToken = jwt.sign({id: customer._id}, process.env.key, {
                expiresIn: '30d'
            })
            await Customer.updateOne({_id: customer._id}, {accessToken, refreshToken})
            // res.cookie("ACCESS_TOKEN", accessToken, {httpOnly: true, path:"/"});
            // res.cookie("REFRESH_TOKEN", refreshToken, {httpOnly: true});
            return res.status(200).json({
                accessToken,
                refreshToken
            })
        }
        else {
            return res.status(403).json({
                message: "Sai mat khau"
            })
        }
    })
]

exports.authen = (req, res, next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);
    jwt.verify(token, process.env.key, (err, user) => {
        console.log(user);
        if (err) {
            return res.status(401).json({
                message: "ERR ACCESS TOKEN"
            })
        }
        res.locals.customerId = user.id;
        next()
    })
}
exports.getCustomerId = (req, res, next) => {
    // const customerId = req.locals.customerId;
    const customerId = res.locals.customerId;
    if (customerId){
        return res.status(200).json({
            customerId
        })
    }
    return res.status(404).json({
        message: "id not exist"
    })
}
exports.refreshToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    console.log(process.env.key)
    if (token == null){
        return res.status(401).json({
            message: "ERR REFRESH TOKEN"
        })
    }
    else{
        jwt.verify(token, process.env.key, (err, user) => {
            console.log(err);
            console.log(user);
            if (err) {
                return res.status(401).json({
                    message: "ERR REFERSH TOKEN"
                })
            }
            const newToken = jwt.sign({id: user.id}, process.env.key, {
                expiresIn: "1d"
            })
            return res.status(200).json({
                accessToken: newToken
            })
        })
    }
}

// update profile
exports.postUpdateProfile = [
    body("name")
    .trim()
    .isLength({min: 1})
    .escape()
    .isAlphanumeric('vi-VN', {ignore: ' '})
    .withMessage("Ten khong bao gom cac ky ty dac biet"),
    body("dateOfBirth", "Invalid date of birth")
    .optional({values: "falsy"})
    .isISO8601()
    .toDate(),
    body("address")
    .trim()
    .isLength({min: 1})
    .escape()
    .withMessage("Dia chi ko hop le"),
    body("phonenumber")
    .trim(),
    body("name")
    .trim()
    .isLength({min: 1})
    .escape()
    .isAlphanumeric('vi-VN', {ignore: ' '})
    .withMessage("Ten khong bao gom cac ky ty dac biet"),
    body("dateOfBirth", "Invalid date of birth")
    .optional({values: "falsy"})
    .isISO8601()
    .toDate(),
    body("address")
    .trim()
    .isLength({min: 1})
    .escape()
    .withMessage("Dia chi ko hop le"),
    body("phonenumber")
    .trim()
    .isLength({min: 9})
    .escape()
    .withMessage("so dien thoai khong hop le")
    .isNumeric()
    .withMessage("so dien thoai khong hop le")
    .isLength({min: 9})
    .escape()
    .withMessage("so dien thoai khong hop le")
    .isNumeric()
    .withMessage("so dien thoai khong hop le"),
    asyncHandler(async (req, res, next) => {
        const error = validationResult(req);
        if (!error.isEmpty()){
            return res.status(422).json({
                error
            })
        }
        const id = res.locals.customerId;
        const user = await Customer.findById(id);
        if (!user){
            return res.status(404).json({
                message: "User not found"
            })
        }
        const newInfo = {
            name: req.body.name,
            dateOfBirth: req.body.dateOfBirth,
            address: req.body.address,
            phone: req.body.phonenumber
        }
        await Customer.findByIdAndUpdate(id, newInfo);
        return res.status(200).json({
            message: "success"
        })
    })
]
// get profile
exports.getCustomerProfile = asyncHandler(async (req, res, next) => {
    const customerId = res.locals.customerId;
    console.log(customerId);
    const user = await Customer.findById(customerId);
    if (!user) {
        return res.status(404).json({
            message: "Customer not found"
        })
    }
    return res.status(200).json({
        customer: user
    })
})

// get genre
exports.getGenre =  asyncHandler(async (req, res, next) => {
    const genreId = req.params.genreId;
    const genre = await Genre.findById(genreId).exec();
    if (!genre) {
        return res.status(404).json({
            message: "The loai khong hop le"
        })
    }
    return res.status(200).json({
        genre
    })
})