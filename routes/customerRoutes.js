const express = require('express');
const customerControllers = require("../controllers/customerControllers")
const router = express.Router();
router.get("/search", customerControllers.getSearch)
router.post("/reserveBook", customerControllers.postReserveBooks)
router.post("/getBooksByGenres", customerControllers.postBooksByGenres)
router.post("/addComment", customerControllers.postAddComment)
router.post("/changeComment", customerControllers.postChangeComment)
router.post("/deleteComment", customerControllers.postDeleteComment)
router.get("/getComments/:bookId", customerControllers.getAllComments)
router.get("/getBookDetails/:bookId", customerControllers.getBookDetails)
router.post("/updateReservation", customerControllers.postUpdateReservation)
router.post("/deleteReservation", customerControllers.postDeleteReservation)
module.exports = router