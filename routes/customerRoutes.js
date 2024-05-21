const express = require('express');
const customerControllers = require("../controllers/customerControllers")
const router = express.Router();
router.get("/search",customerControllers.getSearch)
router.post("/reserveBook", customerControllers.authen,customerControllers.postReserveBooks)
router.post("/getBooksByGenres", customerControllers.postBooksByGenres)
router.post("/addComment", customerControllers.authen ,customerControllers.postAddComment)
router.post("/changeComment", customerControllers.authen,customerControllers.postChangeComment)
router.post("/deleteComment", customerControllers.authen,customerControllers.postDeleteComment)
router.get("/getComments/:bookId", customerControllers.getAllComments)
router.get("/getBookDetails/:bookId", customerControllers.getBookDetails)
router.post("/updateReservation", customerControllers.authen,customerControllers.postUpdateReservation)
router.post("/deleteReservation", customerControllers.authen,customerControllers.postDeleteReservation)
router.post("/signup", customerControllers.postSignUp);
router.get("/verify-email/:userid", customerControllers.verfiyEmail);
router.post("/login", customerControllers.postLogin)
router.get("/refreshToken", customerControllers.refreshToken)
router.get("/getAllGenres", customerControllers.getAllGenres)
router.get("/getAllBooks", customerControllers.getAllBooks)
router.get("/getAllReservation", customerControllers.authen,customerControllers.getAllReseveration)
router.get("/getAllComments/:bookId", customerControllers.getAllComments)
router.get("/getCustomerProfile", customerControllers.authen, customerControllers.getCustomerProfile)
router.post("/updateProfile", customerControllers.authen, customerControllers.postUpdateProfile)
router.get("/getGenre/:genreId", customerControllers.getGenre);
router.get("/getCustomerId", customerControllers.authen, customerControllers.getCustomerId);
router.post("/resetPassword", customerControllers.resetPassword)
router.post("/setNewPassword", customerControllers.setNewPassword)
module.exports = router