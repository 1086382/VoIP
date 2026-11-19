const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const claims = jwt.verify(req.headers.token, process.env.COOKIE_KEY, { algorithms: ['HS256'] });
    if (claims.purpose === 'session' && typeof claims.id === 'string' && claims.id) {
      req.user = claims;
      return next();
    }
  } catch {
    // Missing, expired, or invalid tokens receive the same response.
  }
  return res.status(401).json({ error: 'Unauthorized Access!' });
};
