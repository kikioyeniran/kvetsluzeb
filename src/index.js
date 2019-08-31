import http from 'http';
import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import logger from 'morgan';
import path from 'path';
import expressValidator from 'express-validator';

const dotnev = require('dotenv');
dotnev.config({path: './config.env'});

// importing the config and routes folders
import config from './config';
import routes from './routes';

let app = express();
app.server = http.createServer(app);

// middleware
// parse application/json
app.use(bodyParser.json({
  limit: process.env.BODYLIMIT
}));
app.use(bodyParser.urlencoded({extended: false}));

// setting public folder
app.use(express.static(path.join(__dirname, 'public')));

// morgan logger
app.use(logger('dev'));

// Express Validator Middleware
app.use(expressValidator({
  errorFormatter: (param, msg, value) =>{
    var namespace = param.split('-')
    , root  = namespace.shift()
    , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param: formParam,
      msg: msg,
      value: value
    };
  }
}));

// routes for API version 1
app.use('/api/v1', routes);

// app.server.listen(process.env.PORT);
app.server.listen(8080);
// console.log(`started on port:${app.server.address().port}`);
console.log(`started on port:${app.server.address().port}`);


export default app;
