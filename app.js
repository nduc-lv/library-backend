const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const dotenv = require('dotenv').config()
const db = require('./config/db/connect');
const cors = require("cors")
const schedule = require("./schedule-task/schedule")
//connect DB
db.connect().then(() => {schedule.schedulTask(); console.log("Scheulded Task")}).catch(e => {console.log(e)});

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const customerRouter = require("./routes/customerRoutes");
const staffRouter = require("./routes/staffRoutes");

const app = express();
app.use(cors());
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api/customer', customerRouter);

app.get('/images/:imageName', (req, res, next) => {
  const absPath = path.resolve(`uploads/${req.params.imageName}`);
  res.sendFile(absPath);
})

app.use('/api/staff', staffRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json(err.message);
});


module.exports = app;
