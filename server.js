'use strict';

const express     = require('express');
const bodyParser  = require('body-parser');
const fccTesting  = require('./freeCodeCamp/fcctesting.js');
const pug = require('pug');
const session = require('express-session');
const passport = require('passport');
const dotEnv = require('dotenv');
dotEnv.config();


const app = express();
app.use(session(
  {
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUnitialized: true
  }));
app.use(passport.initialize());
app.use(passport.session());



app.set('view engine')


fccTesting(app); //For FCC testing purposes
app.use('/public', express.static(process.cwd() + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.route('/')
  .get((req, res) => {
    res.render(process.cwd() + '/views/pug/index.pug', {title: 'Hello', message: 'Please Login'});
  });

app.listen(process.env.PORT || 3000, () => {
  console.log("Listening on port " + process.env.PORT);
});
