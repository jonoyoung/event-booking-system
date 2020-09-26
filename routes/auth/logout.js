const logoutRouter = require('express').Router();

/**
 * Logout
 * Log the current user out.
 */
logoutRouter.get('/logout', (req, res) => {
  // Logout the user and destroy the session they have.
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        return false;
      }
      return res.redirect('/login');
    });
  }
});

module.exports = logoutRouter;
