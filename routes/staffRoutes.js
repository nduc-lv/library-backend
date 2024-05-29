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
//book
router.get("/listbook", staffControllers.getAllBooks)
router.get("/listbook/:bookId", staffControllers.getBookDetails)
router.post("/addbook",upload.single('bookcover'), staffControllers.postAddBook)
router.post("/updatebook/:bookId",upload.single('bookcover') , staffControllers.postUpdateBook)
router.post("/deletebook", staffControllers.postDeleteBook)

//record
router.get("/listcustomer", staffControllers.getAllCustomer)
router.get("/listcustomer/:customerId", staffControllers.getCustomerDetail)
router.get("/listrecord/:customerId",staffControllers.getCustomerRecord)
router.post("/addrecord",staffControllers.postAddRerord)
router.post("/updaterecord/:recordId",staffControllers.postUpdateRecord)
router.post("/returnBook",staffControllers.postReturnBook)
router.post("/listrecord/checkrecord",staffControllers.postCheckAllRecord)

router.post("/deleterecord",staffControllers.postDeleteRecord)

//genre
router.get("/listgenre", staffControllers.getAllGenres)
router.post("/addgenre", staffControllers.postAddGenre)
router.post("/updategenre/:genreId",staffControllers.postUpdateGenre)
router.post("/deletegenre", staffControllers.postDeleteGenre)

//author
router.get("/listauthor", staffControllers.getAllAuthors)
router.post("/addauthor", staffControllers.postAddAuthor)
router.post("/updateauthor/:authorId",staffControllers.postUpdateAuthor)
router.post("/deleteauthor", staffControllers.postDeleteAuthor)

module.exports = router