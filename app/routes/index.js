'use strict'

var path = process.cwd()
var User = require('../models/users')
var Book = require('../models/books')
var Request = require('../models/requests')
var google = require('google-books-search')

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

  app.route('/search/:searchQuery')
		.get(isLoggedIn, function (req, res) {
  google.search(req.params.searchQuery, function (error, result) {
    var simpleResult = []
    for (let i = 0; i < result.length; i++) {
      simpleResult.push({title: result[i].title, thumbnail: result[i].thumbnail, googleId: result[i].id})
    }
    res.send(simpleResult)
  })
})

  app.route('/mybooks')
		.get(isLoggedIn, function (req, res) {
  Book.find({owner: req.user.id}, function (error, books) {
    if (error) return res.send(error)
    Request.find({toUser: req.user.id}, function (error, requests) {
      if (error) return res.send(error)
      res.render('myBooks', {
        books: books,
        user: req.user,
        requests: requests
      })
    })
  })
})
  app.route('/allbooks')
		.get(isLoggedIn, function (req, res) {
  Book.find({}, function (error, books) {
    if (error) return res.send(error)
    Request.find({fromUser: req.user.id}, function (error, requests) {
      if (error) return res.send(error)
      res.render('allBooks', {
        books: books,
        user: req.user,
        requests: requests
      })
    })
  })
})

  app.route('/addBook/:googleId')
		.get(isLoggedIn, function (req, res) {
  google.lookup(req.params.googleId, function (error, result) {
    var newBook = new Book({title: result.title,
      thumbnail: result.thumbnail,
      owner: req.user.id})
    newBook.save(function (err) {
      if (err) return res.send(err)
      res.redirect('/mybooks')
    })
  })
})

  app.route('/request/:bookId')
		.get(isLoggedIn, function (req, res) {
  Book.findOne({_id: req.params.bookId }, function (error, book) {
    if (error) return res.send(error)
    var newRequest = new Request({
      fromUser: req.user.id,
      toUser: book.owner,
      book: book._id
    })
    newRequest.save(function (error) {
      if (error) return res.send(error)
      res.redirect('/allbooks')
    })
  })
})

  app.route('/toggleaccept/:requestId')
		.get(isLoggedIn, function (req, res) {
  Request.findOne({_id: req.params.requestId}, function (error, request) {
    if (error) return res.send(error)
    if (request.toUser == req.user.id) {
      request.isAccepted = !request.isAccepted
      request.save(function (error) {
        if (error) return res.send(error)
        res.redirect('/mybooks')
      })
    } else {
      return res.send('Error: This request is not for you')
    }
  })
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
        user.save(function (error) {
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
