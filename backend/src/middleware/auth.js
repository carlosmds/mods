const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const token = req.cookies.jwt;

  if (!token) {
    return res.status(401).json({ error: req.t('auth.no_token') });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: req.t('auth.invalid_token') });
    }
    req.user = user;
    next();
  });
};

module.exports = {
  authenticateToken
}; 