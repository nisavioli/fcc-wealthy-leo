'use strict';

const express       = require('express');
const bodyParser    = require('body-parser');
const fccTesting    = require('./freeCodeCamp/fcctesting.js');
const mongo         = require('mongodb').MongoClient;
// const ObjectID      = require('mongodb').ObjectID;
// const pug           = require('pug');
// const session       = require('express-session');
// const passport      = require('passport');
// const LocalStrategy = require('passport-local');
// const bcrypt        = require('bcrypt');
const dotEnv        = require('dotenv');
const routes        = require('./Routes.js');
const auth          = require('./Auth.js');
dotEnv.config();
const app = express();





fccTesting(app); //For FCC testing purposes
app.use('/public', express.static(process.cwd() + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'pug');



mongo.connect(process.env.DATABASE, (err, db) =>
{
  if(err)
  {
    console.log('Database error: ' + err);
  }
  else
  {
    console.log('Successful database connection')
    auth(app, db);
    routes(app, db);
    
    app.listen(process.env.PORT || 3000, () => {
      console.log("Listening on port " + (process.env.PORT || 3000));
    });
  }
});