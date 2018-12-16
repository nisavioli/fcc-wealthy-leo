const mongo			= require ('mongodb').MongoClient;
const passport      = require('passport');
const bcrypt        = require('bcrypt');
const dotEnv        = require('dotenv');
dotEnv.config();
module.exports = function (app, db) 
{
//#region delays for testing -------------------------------------
    // Delays need to be added for tests to pass
    if (process.env.ENABLE_DELAYS) app.use((req, res, next) =>
    {
      switch (req.method) 
      {
        case 'GET':
          switch (req.url) 
          {
            case '/logout': return setTimeout(() => next(), 500);
            case '/profile': return setTimeout(() => next(), 700);
            default: next();
          }
        break;
        case 'POST':
          switch(req.url)
          {
            case '/login': return setTimeout(() => next(), 900);
            default: next();
          }
        break;
        default: next();
      }
    });
    //#endregion
    //----------------------------------------------------------------
    app.route('/')
      .get((req, res) => 
      {
        res.render(process.cwd() + '/views/pug/index.pug',
          {
            title: 'Home Page',
            message: 'Please Login',
            showLogin: true,
            showRegistration: true
          }
        );
      });
    let passportAuthOpts = 
    {
      failureRedirect: '/'
    };

    function ensureAuthenticated(req, res, next)
    {
      if (req.isAuthenticated()) { return next(); }
      res.redirect('/');
    };

    app.route('/login')
      .post(passport.authenticate('local', passportAuthOpts), 
        (req, res) =>
        {
          res.redirect('/profile');
        }
      );

    app.route('/profile')
      .get(
        ensureAuthenticated,
        (req, res) =>
        {
          // console.log(req.user);
          const username = req.user.username;
          res.render(process.cwd() + '/views/pug/profile.pug', {username: username});
        }
      );
    app.route('/logout')
      .get((req, res) =>
      {
        req.logout();
        res.redirect('/');
      }
    );
    app.route('/register')
      .post((req, res, next) =>
      {
        db.collection('users')
          .findOne( {username: req.body.username }, 
          (err, user) =>
          {
            if(err) { next(err); }
            else if (user) { res.redirect('/'); }
            else
            {
              const hash = bcrypt.hashSync(req.body.password, 12);
              db.collection('users')
                .insertOne(
                {username: req.body.username,
                 password: hash},
                 (err, doc) =>
                 {
                   if(err) { res.redirect('/'); }
                   else { next(null, user); }
                 }
              );
            }
          })},
          passport.authenticate('local', { failureRedirect: '/'}),
          (req, res, next) =>
          {
            req.session.username = req.user.username;
            res.redirect('/profile');
          }
      );

    app.use((req, res, next) =>
    {
      res.status(404)
        .type('text')
        .send('Not Found');
    });
};