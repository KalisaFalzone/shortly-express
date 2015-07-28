var express = require('express');
var session = require('express-session');
var util = require('./lib/utility');
var partials = require('express-partials');
var bodyParser = require('body-parser');
var bcrypt = require('bcrypt-nodejs');

var db = require('./app/config');
var Users = require('./app/collections/users');
var User = require('./app/models/user');
var Links = require('./app/collections/links');
var Link = require('./app/models/link');
var Click = require('./app/models/click');

var app = express();

// middleware
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(partials());
// Parse JSON (uniform resource locators)
app.use(bodyParser.json());
// Parse forms (signup/login)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.use(session({
  secret: 'lolly lops',
  resave: false,
  // saveUninitialized: true,
  // cookie: { secure: true }
}));
// end middlware

// route: index
app.get('/', util.isUserLoggedIn, function (req, res) {
  res.render('index');
});

// route: login
app.get('/login', function (req, res) {
  res.render('login');
});
app.post('/login', function (req, res) {
  // store user/pass as plain text locally (bad practice)
  //if username exsits
    //if password matches direct to home page
    // session.set()
    //if password doesn't match redirect to login/or create user
  //if username doesn't exist redirect to login
});

// route: signup
app.get('/signup', function (req, res) {
  res.render('signup');
});
app.post('/signup', function (req, res) {
  var username = req.body.username;
  var password = req.body.password;

  console.log('WERE IN SHORTLY.JS', username, password);

  new User({ username: username }).fetch().then(function(found) {
    // CHECK THE DB/COLLECTION TO SEE IF USER EXISTS
    if (found) {
      console.log('username already exists');
      res.send(200, found.attributes);
    } else {
      console.log('username not found');
      bcrypt.hash(password, null, null,
        function (err, hashedPassword) {
          if (err) {
            console.log('ERRORED:', err);
            return;
          }

          var user = new User({
            username: username,
            password: hashedPassword,
            session_id: req.sessionID,
          });

          user.save().then(function(user) {
            Users.add(user);
            res.send(200, user);
          });
        }
      );
    }
  });
}); // app.post

// route: create
app.get('/create', util.isUserLoggedIn, function (req, res) {
  res.render('index');
}); // app.get

// route: links
app.get('/links', util.isUserLoggedIn, function (req, res) {
  Links.reset().fetch().then(function (links) {
    res.send(200, links.models);
  });
}); // app.get
app.post('/links', util.isUserLoggedIn, function (req, res) {
  // REPLACE UP THERE WITH THIS STUFF HERE
  // REPLACE UP THERE WITH THIS STUFF HERE
  // REPLACE UP THERE WITH THIS STUFF HERE

  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.send(404);
  }

  new Link({ url: uri }).fetch().then(function(found) {
    if (found) {
      res.send(200, found.attributes);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.send(404);
        }

        var link = new Link({
          url: uri,
          title: title,
          base_url: req.headers.origin
        });

        link.save().then(function(newLink) {
          Links.add(newLink);
          res.send(200, newLink);
        });
      });
    }
  });
});



//create logout option that deletes session

/************************************************************/
// Write your authentication routes here
/************************************************************/




/************************************************************/
// Handle the wildcard route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/*', function(req, res) {
  new Link({ code: req.params[0] }).fetch().then(function(link) {
    if (!link) {
      // console.log('\nWE REDIRECTED!!!');
      res.redirect('/');
    } else {
      var click = new Click({
        link_id: link.get('id')
      });

      click.save().then(function() {
        db.knex('urls')
          .where('code', '=', link.get('code'))
          .update({
            visits: link.get('visits') + 1,
          }).then(function() {
            return res.redirect(link.get('url'));
          });
      });
    }
  });
});

console.log('Shortly is listening on 4568');
app.listen(4568);
