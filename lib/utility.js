var request = require('request');
var session = require('express-session');
var express = require('express');
var app = express();
var db = require('../app/config');

var sessionList = {};


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

var userExists = function(username){
return (db.knex('users').where({
  username: username,
  }).select('id'));
};

var authenticatedSession = 'mkP6aUV4HiyH9GZ_XGxkB9r0dw3cgrWC';

exports.isUserLoggedIn = function (req, res, next) {
  // console.log('IS USER LOGGED IN RUNNING', req.sessionID);
  if (sessionList[res.sessionID]) {
    next();
  } else {
    // console.log('did we redirect?????');
    res.redirect('/login');
  }
};


