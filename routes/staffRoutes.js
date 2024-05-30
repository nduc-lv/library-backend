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
router.post("/addbook", staffControllers.authen, upload.single('bookcover'), staffControllers.postAddBook)
router.post("/updatebook/:bookId", staffControllers.authen, upload.single('bookcover'),staffControllers.postUpdateBook)
router.post("/deletebook", staffControllers.authen, staffControllers.postDeleteBook)

//record
router.get("/listcustomer", staffControllers.getAllCustomer)
router.get("/listcustomer/:customerId", staffControllers.getCustomerDetail)
router.get("/listrecord/:customerId",staffControllers.getCustomerRecord)
router.post("/addrecord", staffControllers.authen, staffControllers.postAddRerord)
router.post("/updaterecord/:recordId", staffControllers.authen,staffControllers.postUpdateRecord)
router.post("/returnBook", staffControllers.authen,staffControllers.postReturnBook)
router.post("/listrecord/checkrecord",staffControllers.postCheckAllRecord)

router.post("/deleterecord", staffControllers.authen, staffControllers.postDeleteRecord)

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