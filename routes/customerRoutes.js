const express = require('express');
const customerControllers = require("../controllers/customerControllers")
const router = express.Router();
router.get("/search",customerControllers.getSearch)
router.post("/reserveBook", customerControllers.postReserveBooks)
router.post("/getBooksByGenres", customerControllers.postBooksByGenres)
router.post("/addComment", customerControllers.postAddComment)
router.post("/changeComment", customerControllers.postChangeComment)
router.post("/deleteComment", customerControllers.postDeleteComment)
router.get("/getComments/:bookId", customerControllers.getAllComments)
router.get("/getBookDetails/:bookId", customerControllers.getBookDetails)
router.post("/updateReservation", customerControllers.postUpdateReservation)
router.post("/deleteReservation", customerControllers.postDeleteReservation)
router.post("/signup", customerControllers.postSignUp);
router.get("/verify-email/:userid", customerControllers.verfiyEmail);
router.post("/login", customerControllers.postLogin)
router.get("/refreshToken", customerControllers.refreshToken)
router.get("/getAllGenres", customerControllers.getAllGenres)
router.get("/getAllBooks", customerControllers.getAllBooks)
router.get("/getAllReservation/:customerid", customerControllers.getAllReseveration)
router.get("/getAllComments/:bookId", customerControllers.getAllComments)
router.get("/getCustomerProfile/:customerId", customerControllers.getCustomerProfile)
router.post("/updateProfile", customerControllers.postUpdateProfile)
module.exports = router