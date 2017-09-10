'use strict'

var path = process.cwd()

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
  res.render('login', { message: req.flash('loginMessage') })
})

  app.route('/logout')
		.get(function (req, res) {
  req.logout()
  res.redirect('/')
})

  app.route('/profile')
		.get(isLoggedIn, function (req, res) {
  res.render('profile', { user: req.user })
})

  app.route('/signup')
    .get(function (req, res) {
      res.render('signup', {message: req.flash('signupMessage')})
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
