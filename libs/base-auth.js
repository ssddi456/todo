var basicAuth = require('basic-auth');

// Create server
module.exports = function (req, res, next) {
  var credentials = basicAuth(req)

  // Check credentials
  // The "check" function will typically be against your user store
  if (!credentials || !check(credentials.name, credentials.pass)) {
    res.statusCode = 401
    res.setHeader('WWW-Authenticate', 'Basic realm="example"')
    res.end('Access denied')
  } else {
    next();
  }
}

// Basic function to validate credentials for example
function check (name, pass) {
  var valid = true

  // Simple method to prevent short-circut and use timing-safe compare
  valid = valid && (name === 'ssddi456');
  valid = valid && (pass === 'Asdfqwer1234');

  return valid;
}
