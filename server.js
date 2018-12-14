'use strict';

const express     = require('express');
const bodyParser  = require('body-parser');
const fccTesting  = require('./freeCodeCamp/fcctesting.js');
const mongodb     = require('mongodb').MongoClient;
const ObjectID    = require('mongodb').ObjectID;
const pug         = require('pug');
const session     = require('express-session');
const passport    = require('passport');
const dotEnv      = require('dotenv');
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


mongodb.connect(process.env.DATABASE, (err, db) =>
{
  if(err)
  {
    console.log('Database error: ' + err);
  }
  else
  {
    passport.serializeUser((user, done) =>
    {
      done(null, user._id);
    });
    passport.deserializeUser((id, done) =>
    {
      db.collection('users').findOne(
        {_id: new ObjectID(id)},
        (err, doc) => 
        {
          done(null, doc);
        }
      );
    });
    app.listen(process.env.PORT || 3000, () => {
      console.log("Listening on port " + process.env.PORT);
    });
  }
});