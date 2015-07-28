var request = require('request');
var session = require('express-session');
var bcrypt = require('bcrypt-nodejs');
var express = require('express');
var app = express();
var db = require('../app/config');

exports.getUrlTitle = function(url, cb) {
  request(url, function(err, res, html) {
    if (err) {
      console.log('Error reading url heading: ', err);
      return cb(err);
    } else {
      var tag = /<title>(.*)<\/title>/;
      var match = html.match(tag);
      var title = match ? match[1] : url;
      return cb(err, title);
    }
  });
};

var rValidUrl = /^(?!mailto:)(?:(?:https?|ftp):\/\/)?(?:\S+(?::\S*)?@)?(?:(?:(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[0-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))|localhost)(?::\d{2,5})?(?:\/[^\s]*)?$/i;

exports.isValidUrl = function(url) {
  return url.match(rValidUrl);
};

/************************************************************/
// Add additional utility functions below
/************************************************************/

exports.signUpUser = function (req, res) {
  //???check database to see if user already exists
  ////if so:  if not: redirect to signup, maybe alert user already exists?
  var username = req.body.username;
  var password = req.body.password;
  //capture what was entered in for username
  //capture what was entered in for password hash this with bcrypt
  var hashPassword = bcrypt.hash(
    password,
    username+username[0],
    function(){
      console.log('hashing in progress');
    },
    function(err, res){
      if (err) {
        console.log('ERRORED:', err);
      }
      return res;
    }
  );
  //create a session id and hash that
  var sessionID = exports.createSession();

  //add both hashed password and session id to database???
  // TODO: lezzz add to database
  db.knex('users')

  console.log('signUpUser ran');
};

exports.createSession = function () {
  app.use(session({
    genid: function(req) {
      return genuuid() // use UUIDs for session IDs
    },
    secret: 'guitarCat'
  }));
}; // createSession

exports.isUserLoggedIn = function (req, res, next) {
  // var isClientLoggedIn = false;

  // app.use(session({
  //   genid: function (req) {
  //     return genuuid(); // use UUIDs for session IDs
  //   },
  //   secret: 'keyboard cat'
  // }));
  // // another option here: https://github.com/expressjs/session#reqsession
  // app.use(session({ secret: 'keyboard cat', cookie: { maxAge: 60000 }}));
  // app.use(function(req, res, next) {
  //   var sess = req.session;
  //   if (sess.views) {
  //     sess.views++;
  //     res.setHeader('Content-Type', 'text/html');
  //     res.write('<p>views: ' + sess.views + '</p>');
  //     res.write('<p>expires in: ' + (sess.cookie.maxAge / 1000) + 's</p>');
  //     res.end();
  //   } else {
  //     sess.views = 1;
  //     res.end('welcome to the session demo. refresh!');
  //   }
  // });

  // if (!isClientLoggedIn) {
  //   res.redirect('/login');
  // }
  // else {
  //   next();
  // }
  next();
}; // isUserLoggedIn
