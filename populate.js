#! /usr/bin/env node

console.log(
    'This script populates some dummy data to your database. Specified database as argument - e.g.: node populatedb "mongodb+srv://cooluser:coolpassword@cluster0.lz91hw2.mongodb.net/local_library?retryWrites=true&w=majority"'
);
  
// Get arguments passed on command line
const userArgs = process.argv.slice(2);

const Author = require("./models/Author");
const Book = require("./models/Book");
const Customer = require("./models/Customer");
const Genre = require("./models/Genre");
const Record = require("./models/Record");
const Staff = require("./models/Staff");
const Comment = require("./models/Comment");

const authors = [];
const books = [];
const customers = [];
const genres = [];

const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

const mongoDB = userArgs[0];

main().catch((err) => console.log(err));

async function main(){
    console.log("Debug: About to connect");
    await mongoose.connect(mongoDB);
    console.log("Debug: Should be connected");
    await createGenres();
    await createAuthors();
    await createBooks();
    await createCustomers();
    await createComments();
    await createStaffs();
    await createRecords();
    console.log("Debug: Closing mongoose");
    mongoose.connection.close();
}

async function authorCreate(index, name){
    const authorDetail = {
        name
    }
    const author = new Author(authorDetail);
    await author.save();
    authors[index] = author;
    console.log(`Added author: ${name}`);
}

async function genreCreate(index, name){
    const genreDetail = {
        name
    }
    const genre = new Genre(genreDetail);
    await genre.save();
    genres[index] = genre;
    console.log(`Added genre: ${name}`);
}

async function bookCreate(index, name, image, genres, authors, review, quantity){
    const bookDetail = {
        name,
        image,
        authors: authors,
        genres: genres,
        review,
        quantity,
    }
    const book = new Book(bookDetail);
    await book.save();
    books[index] = book;
    console.log(`Added book: ${name}`);
}

async function customerCreate(index, name, phone, email, password, dateOfBirth, address, reputation, refreshToken, accessToken){
    const customerDetail = {
        name,
        phone,
        email,
        password,
        dateOfBirth,
        address,
        reputation,
        refreshToken,
        accessToken
    }
    const customer = new Customer(customerDetail);
    await customer.save();
    customer[index] = customer;
    console.log(`Added customer: ${name}`);
}

async function commentCreate(customer, book, content, timeStamp){
    const commentDetail = {
        customer,
        book,
        content,
        timeStamp
    }
    const comment = new Comment(commentDetail);
    await comment.save();
    console.log(`Added comment ${content}`);
}

async function recordCreate(customer, book, numberOfBooks, timeStart, timeEnd, status){
    const recordDetail = {
        customer,
        book,
        numberOfBooks,
        timeStart,
        timeEnd,
        status
    }
    const record = new Record(recordDetail);
    await record.save();
    console.log(`Added record`);
}
async function staffCreate(username, password, refreshToken, accessToken){
    const staffDetail = {
        username,
        password,
        refreshToken,
        accessToken
    }
    const staff = new Staff(staffDetail);
    await staff.save();
    console.log("Added staff");
}

async function createGenres(){
    console.log("Adding genres");
    await Promise.all([
        genreCreate(0, "Kinh dị"),
        genreCreate(1, "Viễn tưởng"),
        genreCreate(2, "Khoa học"),
        genreCreate(3, "Giáo dục"),
        genreCreate(4, "Hư cấu"),
        genreCreate(5, "Phi hư cấu"),
        genreCreate(6, "Thiếu nhi"),
        genreCreate(7, "Thanh thiếu niên"),
        genreCreate(8, "Trinh thám"),
    ])
}
async function createAuthors(){
    console.log("Adding authors");
    await Promise.all([
        authorCreate(0, "J. K. Rowling"),
        authorCreate(1, "Nguyễn Nhật Ánh"),
        authorCreate(2, "Tô Hoài"),
        authorCreate(3, "Stephen King"),
        authorCreate(4, "Yuval Noah Harari"),
        authorCreate(5, "J. D. Salinger"),
        authorCreate(6, "Agatha Christie")
    ])
}
async function createBooks(){
    console.log("Adding books");
    await Promise.all([
        bookCreate(0, "Harry Potter và Bảo bối Tử thần", 
        "https://upload.wikimedia.org/wikipedia/vi/4/4d/HARRY-7.jpg",
        [genres[4]],
        [authors[0]],
        "Harry Potter",
        10
    ),
        bookCreate(1, "Sapiens: Lược sử loài người",
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQLDpVp6EfkFqzoTRl4TGGmSbMmf3IFjrebEoctILCutg&s",
        [genres[2]],
        [authors[4]]
    )
    ])
}

async function createCustomers(){
    console.log("Adding customers");
    await Promise.all([
        customerCreate(0, "Hoàng Quốc Việt", "010101010101", "viet007113@gmail.com", "viet123", "01/01/2003", "phố X, đường Y, thành phố Z", 99, "a", "a"),
        customerCreate(1, "Nguyễn Đức Long Vũ", "01010101010", "longvunguyen2003@gmail.com", "longvu", "01/01/2003", "pho X, duong Y, thanh pho Z", 99, "a", "a"),
        customerCreate(2, "Lê Xuân Việt", "01010101010", "lexuanviet@gmail.com", "lexuanviet", "01/01/2003", "pho X, duong Y, thanh pho Z", 99, "a", "a"),
    ])
}
async function createRecords(){
    console.log("Adding records");
    await Promise.all([
        recordCreate(customers[0], books[0], 2, "2024-04-01T14:10:30.000+00:00", "2024-04-08T17:12:30.000+00:00", "Đã trả")
    ])
}
async function createStaffs(){
    console.log("Adding staff"),
    await Promise.all([
        staffCreate("admin", "admin", "a", "a"),
    ])
}
async function createComments(){
    console.log("Adding comments");
    await Promise.all([
        commentCreate(customers[1], books[1], "This is a good book", "2024-04-01T14:10:30.000+00:00")
    ])
}