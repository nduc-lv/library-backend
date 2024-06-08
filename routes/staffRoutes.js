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
router.get("/listbook", staffControllers.getAllBooks)
router.get("/listbook/:bookId", staffControllers.getBookDetails)
router.post("/addbook",upload.single('bookcover'), staffControllers.postAddBook)
router.post("/updatebook/:bookId",upload.single('bookcover') , staffControllers.postUpdateBook)
router.post("/deletebook", staffControllers.postDeleteBook)
router.post("/updateBookSingle/:bookId/:type", staffControllers.postUpdateBookSingle);
//record
router.get("/listcustomer", staffControllers.getAllCustomer)
router.get("/listcustomer/:customerId", staffControllers.getCustomerDetail)
router.get("/listrecord/:customerId",staffControllers.getCustomerRecord)
router.post("/addrecord",staffControllers.postAddRerord)
router.post("/updaterecord/:recordId",staffControllers.postUpdateRecord)
router.post("/deleterecord",staffControllers.postDeleteRecord)
router.get("/getAllRecords", staffControllers.getAllRecords)
router.post("/returnBook", staffControllers.postReturnBook)
router.post("/borrowBook", staffControllers.postBorrowBook)
router.get("/numberOfBooks/:bookId", staffControllers.getNumberOfBooks);
//genre
router.get("/listgenre", staffControllers.getAllGenres)
router.post("/addgenre",  staffControllers.authen, staffControllers.postAddGenre)
router.post("/updategenre/:genreId", staffControllers.authen,staffControllers.postUpdateGenre)
router.post("/deletegenre", staffControllers.authen, staffControllers.postDeleteGenre)

//author
router.get("/listauthor", staffControllers.getAllAuthors)
router.post("/addauthor", staffControllers.authen, staffControllers.postAddAuthor)
router.post("/updateauthor/:authorId", staffControllers.authen, staffControllers.postUpdateAuthor)
router.post("/deleteauthor",  staffControllers.authen, staffControllers.postDeleteAuthor)

module.exports = router