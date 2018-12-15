'use strict';

const express       = require('express');
const bodyParser    = require('body-parser');
const fccTesting    = require('./freeCodeCamp/fcctesting.js');
const mongo         = require('mongodb').MongoClient;
const ObjectID      = require('mongodb').ObjectID;
const pug           = require('pug');
const session       = require('express-session');
const passport      = require('passport');
const LocalStrategy = require('passport-local');
const dotEnv        = require('dotenv');
dotEnv.config();
const app = express();





fccTesting(app); //For FCC testing purposes
app.use('/public', express.static(process.cwd() + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'pug');

app.use(session(
  {
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUnitialized: true
  }));
app.use(passport.initialize());
app.use(passport.session());

mongo.connect(process.env.DATABASE, (err, db) =>
{
  if(err)
  {
    console.log('Database error: ' + err);
  }
  else
  {
    console.log('Successful database connection')
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

    passport.use(new LocalStrategy(
      (username, password, done) =>
      {
        db.collection('users').findOne({username: username}, 
        (err, user) =>
        {
          console.log('User ' + username + ' attempted to log in.');
          if (err) { return done(err); }
          if (!user) { return done(null, false); }
          if (password !== user.password) { return done(null, false); }
          return done(null, user);
        });
      }
    ));

    app.route('/')
      .get((req, res) => 
      {
        res.render(process.cwd() + '/views/pug/index.pug',
          {
            title: 'Hello',
            message: 'Please Login',
            showLogin: true
          }
        );
      });
    let passportAuthOpts = 
    {
      failureRedirect: '/',
      failureFlash: true
    };

    app.route('/login')
      .post(passport.authenticate('local', passportAuthOpts), 
        (req, res) =>
        {
          res.redirect(`/profile/${req.user._id}`);
        }
      );

    app.route('/profile/:userId')
        .get((req, res) =>
        {
          passport.deserializeUser(req.params.userId, 
          (err, user) => 
          {
            if (err) 
            { 
              console.log('Failed to deserilize user with id ' + req.params.userId);
              res.redirect('/');
            }
            else
            {
              res.render(process.cwd() + '/views/pug/profile.pug', user);
            }
          });
          // db.collection('users').findOne({_id: req.params.user})
        });
    app.listen(process.env.PORT || 3000, () => {
      console.log("Listening on port " + (process.env.PORT || 3000));
    });
  }
});