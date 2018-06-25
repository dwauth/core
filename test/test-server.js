var memdb = require('memdb')
var createApp = require('appa')
var send = require('appa/send')
var error = require('appa/error')

var dwid = require('../index.js')

module.exports = function testserver (config) {
  var app = createApp({log: {level: 'silent'}})
  var db = memdb()
  app.db = db
  var DWAUTH = dwid(db, config)

  app.on('/register', function (req, res, ctx) {
    DWAUTH.register(req, res, ctx, function (err, code, data) {
      if (err) return error(code, err.message).pipe(res)
      send(code, data).pipe(res)
    })
  })

  app.on('/login', function (req, res, ctx) {
    DWAUTH.login(req, res, ctx, function (err, code, data) {
      if (err) return error(code, err.message).pipe(res)
      send(code, data).pipe(res)
    })
  })

  app.on('/logout', function (req, res, ctx) {
    DWAUTH.logout(req, res, ctx, function (err, code, data) {
      if (err) return error(code, err.message).pipe(res)
      send(code, data).pipe(res)
    })
  })

  app.on('/destroy', function (req, res, ctx) {
    DWAUTH.destroy(req, res, ctx, function (err, code, data) {
      if (err) return error(code, err.message).pipe(res)
      send(code, data).pipe(res)
    })
  })

  app.on('/updatepassword', function (req, res, ctx) {
    DWAUTH.updatePassword(req, res, ctx, function (err, code, data) {
      if (err) return error(code, err.message).pipe(res)
      send(code, data).pipe(res)
    })
  })

  app.on('/verifytoken', function (req, res, ctx) {
    DWAUTH.verify(req, function (err, token, rawToken) {
      if (err) return error(400, err.message).pipe(res)
      var body = {
        token: token,
        message: 'Token is valid',
        rawToken: rawToken
      }
      send(200, body).pipe(res)
    })
  })

  app.DWAUTH = DWAUTH
  return app
}
