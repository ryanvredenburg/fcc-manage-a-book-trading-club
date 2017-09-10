'use strict'

var mongoose = require('mongoose')

var requestSchema = mongoose.Schema({

  fromUser: String,
  toUser: String,
  book: String,
  isAccepted: { type: Boolean, default: false }

}, { collection: 'fccBookTradingRequest' })

module.exports = mongoose.model('Request', requestSchema)
