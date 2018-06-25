var createAccounts = require('@dwauth/accounts')

module.exports = function createDwid (db, config) {
  var accounts = createAccounts(db, config)

  var dwid = {
    accounts: accounts
  }

  dwid.register = function (req, res, ctx, callback) {
    if (!ctx || !ctx.body) {
      return callback(new Error('ctx.body.email and ctx.body.password properties required'), 400)
    }

    if (req.method === 'POST') {
      return accounts.register(ctx.body, function (err, account) {
        if (err) return callback(err)
        return callback(null, 201, account)
      })
    } else {
      callback(new Error('Method not allowed'), 405)
    }
  }

  dwid.login = function (req, res, ctx, callback) {
    if (!ctx || !ctx.body) {
      return callback(new Error('ctx.body.email and ctx.body.password properties required'), 400)
    }

    if (req.method === 'POST') {
      accounts.login(ctx.body, function (err, account) {
        if (err) return callback(err)
        return callback(null, 200, account)
      })
    } else {
      callback(new Error('Method not allowed'), 405)
    }
  }

  dwid.logout = function (req, res, ctx, callback) {
    if (req.method === 'POST') {
      var token = dwid.getToken(req)

      accounts.logout(token, function (err) {
        if (err) return callback(err)
        return callback(null, 200, { message: 'account logged out' })
      })
    } else {
      callback(new Error('Method not allowed'), 405)
    }
  }

  dwid.destroy = function (req, res, ctx, callback) {
    if (req.method === 'DELETE') {
      dwid.verify(req, function (err, tokenData, token) {
        if (err) return callback(err)
        accounts.destroy(tokenData.auth.key, function (err) {
          if (err) return callback(err)
          return callback(null, 200, { message: 'account destroyed' })
        })
      })
    } else {
      callback(new Error('Method not allowed'), 405)
    }
  }

  dwid.updatePassword = function (req, res, ctx, callback) {
    if (req.method === 'POST') {
      dwid.verify(req, function (err, token, rawToken) {
        if (err) return callback(err, 400)
        ctx.body.token = rawToken
        accounts.updatePassword(ctx.body, function (err, account) {
          if (err) return callback(err, 400)
          return callback(null, 200, account)
        })
      })
    } else {
      callback(new Error('Method not allowed'), 405)
    }
  }

  dwid.verify = function verify (req, callback) {
    var token = dwid.getToken(req)

    accounts.verifyToken(token, function (err, tokenData, token) {
      if (err) return callback(err)
      accounts.findByEmail(tokenData.auth.basic.email, function (err, account) {
        if (err) return callback(new Error('Account not found'))
        callback(null, tokenData, token)
      })
    })
  }

  dwid.getToken = function getToken (req) {
    var authHeader = req.headers.authorization
    if (authHeader && authHeader.indexOf('Bearer') > -1) {
      return authHeader.split('Bearer ')[1]
    }
  }

  return dwid
}
