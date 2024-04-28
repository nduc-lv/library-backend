const express = require('express');
const staffControllers = require("../controllers/staffControllers")
const router = express.Router();
//book
router.get("/listbook", staffControllers.getAllBooks)
router.get("/listbook/:bookId", staffControllers.getBookDetails)
router.post("/addbook", staffControllers.postAddBook)
router.post("/updatebook/:bookId", staffControllers.postUpdateBook)
router.post("/deletebook", staffControllers.postDeleteBook)

//record

module.exports = router