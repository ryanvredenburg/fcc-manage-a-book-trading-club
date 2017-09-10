'use strict'

var mongoose = require('mongoose')

var bookSchema = mongoose.Schema({

  title: String,
  thumbnail: String,
  owner: String

}, { collection: 'fccBookTradingBook' })

module.exports = mongoose.model('Book', bookSchema)
