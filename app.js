const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const multer  = require('multer');
const config = require('./config/database')

mongoose.connect(config.database);
let db  = mongoose.connection;

//Init App
const app = express();

//Check Connection
db.once('open', () =>{
    console.log('Connected to MongoDB');
});


//Check for DB errors
db.on('error', (err) =>{
    console.log(err);
});



//Load View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//Body Parse Middleware
app.use(bodyParser.urlencoded({ extended: false }));
//parse application/json
app.use(bodyParser.json());


//Set Public folder
app.use(express.static(path.join(__dirname, 'public')));

//Express Session Middleware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
  }));

//Express Mesages Middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

//Express Validator Middleware
app.use(expressValidator({
    errorFormatter: function(param, msg, value) {
        var namespace = param.split('.')
        , root    = namespace.shift()
        , formParam = root;

      while(namespace.length) {
        formParam += '[' + namespace.shift() + ']';
      }
      return {
        param : formParam,
        msg   : msg,
        value : value
      };
    }
  }));

//Passport Config
require('./config/passport')(passport);
//Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', (req, res, next)=>{
  res.locals.client = req.client || null;
  res.locals.cleaner = req.cleaner || null;
  next();
});

//Home route
app.get('/', (req, res) =>{
    res.render('index');
});

//Route Files
let cleaner = require('./routes/cleaner');
let client = require('./routes/client');
let public = require('./routes/public');
let requests = require('./routes/requests');
app.use('/cleaner', cleaner);
app.use('/client', client);
app.use('/public', public);
app.use('/requests', requests);

//Start Server
app.listen(5000, () => {
    console.log('Server started on port 5000...')
});