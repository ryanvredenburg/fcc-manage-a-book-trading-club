'use strict'

var path = process.cwd()
var User = require('../models/users')

module.exports = function (app, passport) {
  function isLoggedIn (req, res, next) {
    if (req.isAuthenticated()) {
      return next()
    } else {
      res.redirect('/login')
    }
  }

  app.route('/')
		.get(function (req, res) {
  res.render('index', {user: req.user})
})

  app.route('/login')
		.get(function (req, res) {
  res.render('login', { message: req.flash('loginMessage'), user: req.user })
})

  app.route('/logout')
		.get(function (req, res) {
  req.logout()
  res.redirect('/')
})

  app.route('/profile')
		.get(isLoggedIn, function (req, res) {
      res.render('profile', { message: '', user: req.user })
  })
    .post(isLoggedIn, function (req, res) {
       User.findOne({_id: req.user}, function (error, user) {
        if (error) return res.send(error)
        user.name = req.body.name
        user.city = req.body.city
        user.state = req.body.state
        user.save( function (error){
          if (error) return res.send(error)
          res.render('profile', { message: 'Profile saved successfully!', user: user })
        })    
    })
  })
        

  app.route('/signup')
    .get(function (req, res) {
      res.render('signup', {message: req.flash('signupMessage'), user: req.user })
    })

  // process the signup form
  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/profile', // redirect to the secure profile section
    failureRedirect: '/signup', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }))

  // process the login form
  app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/profile', // redirect to the secure profile section
    failureRedirect: '/login', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }))
}
