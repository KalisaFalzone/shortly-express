var request = require('request');
var session = require('express-session');
var express = require('express');
var app = express();
var db = require('../app/config');

var sessionList = {};


exports.getUrlTitle = function(url, cb) {
  request(url, function(err, res, html) {
    if (err) {
      // console.log('Error reading url heading: ', err);
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
  // console.log(url);
  return url.match(rValidUrl);
};

/************************************************************/
// Add additional utility functions below
/************************************************************/

var userExists = function(username){
  new User({ username: username }).fetch().then(function(found) {
    // CHECK THE DB/COLLECTION TO SEE IF USER EXISTS
    if (found) {
      // console.log('username already exists');
      return true;
    } else {
      // console.log('New username');
      return false;
    }
  });
};

var authenticatedSession = 'mkP6aUV4HiyH9GZ_XGxkB9r0dw3cgrWC';

exports.createSession = function(req, res, newUser) {
  // console.log('creating session');
  return req.session.regenerate(function() {
    req.session.user = newUser;
    res.redirect('/');
  });
};

exports.isUserLoggedIn = function (req, res, next) {
  if (exports.isLoggedIn(req)) {
    // console.log('Youre logged in, you have access!');
    next();
  } else {
    // console.log('Youre not logged in, kicking you to login page');
    res.redirect('/login');
  }
};

exports.isLoggedIn = function(req){
  // return req.session ? !!req.session.user : false; //code in solution, more clear code below:
  return !!req.session.user;
};


