const express = require('express');
const staffControllers = require("../controllers/staffControllers")
const router = express.Router();


var multer = require('multer');
//khai bao upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})
const upload = multer({ storage })
//staff
router.post("/login",staffControllers.postStaffLogin)

//book
router.get("/listbook", staffControllers.authen,staffControllers.getAllBooks)
router.get("/listbook/:bookId", staffControllers.authen,staffControllers.getBookDetails)
router.post("/addbook",staffControllers.authen,upload.single('bookcover'), staffControllers.postAddBook)
router.post("/updatebook/:bookId", staffControllers.authen,upload.single('bookcover') , staffControllers.postUpdateBook)
router.post("/deletebook", staffControllers.authen,staffControllers.postDeleteBook)
router.post("/updateBookSingle/:bookId/:type", staffControllers.authen ,staffControllers.postUpdateBookSingle);
//record
router.get("/listcustomer", staffControllers.authen,staffControllers.getAllCustomer)
router.get("/listcustomer/:customerId", staffControllers.authen,staffControllers.getCustomerDetail)
router.get("/listrecord/:customerId", staffControllers.authen,staffControllers.getCustomerRecord)
router.post("/addrecord", staffControllers.authen,staffControllers.postAddRerord)
router.post("/updaterecord/:recordId", staffControllers.authen ,staffControllers.postUpdateRecord)
router.post("/deleterecord",staffControllers.authen ,staffControllers.postDeleteRecord)
router.get("/getAllRecords", staffControllers.authen,staffControllers.getAllRecords)
router.post("/returnBook", staffControllers.authen,staffControllers.postReturnBook)
router.post("/borrowBook", staffControllers.authen,staffControllers.postBorrowBook)
router.get("/numberOfBooks/:bookId", staffControllers.authen,staffControllers.getNumberOfBooks);
//genre
router.get("/listgenre", staffControllers.authen ,staffControllers.getAllGenres)
router.post("/addgenre",  staffControllers.authen, staffControllers.postAddGenre)
router.post("/updategenre/:genreId", staffControllers.authen,staffControllers.postUpdateGenre)
router.post("/deletegenre", staffControllers.authen, staffControllers.postDeleteGenre)

//author
router.get("/listauthor", staffControllers.authen,staffControllers.getAllAuthors)
router.post("/addauthor", staffControllers.authen,staffControllers.authen, staffControllers.postAddAuthor)
router.post("/updateauthor/:authorId", staffControllers.authen ,staffControllers.authen, staffControllers.postUpdateAuthor)
router.post("/deleteauthor", staffControllers.authen ,staffControllers.authen, staffControllers.postDeleteAuthor)

router.get("/refresh", staffControllers.refreshToken);
router.post("/unlock", staffControllers.authen, staffControllers.unlockCustomer);
module.exports = router