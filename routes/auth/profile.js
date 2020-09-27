const profileRouter = require('express').Router();
const checkAuth = require('../../util/auth/checkAuth');

/**
 * Profile
 * Get and render the user's profile.
 */
profileRouter.get('/profile', checkAuth, (req, res) => {
  // If the user is logged in then select all of the attributes of that user and render the profile page.
  db.getConnection((err, connection) => {
    connection.query(
      'SELECT username, firstName, lastName FROM users WHERE username = ?',
      [req.session.username],
      (error, result) => {
        connection.release();

        if (result.length > 0) {
          res.render('profile.ejs', {
            loggedIn: req.session.loggedin,
            id: req.session.userId,
            username: result[0].username,
            firstName: result[0].firstName,
            lastName: result[0].lastName,
          });
        } else {
          res.redirect('/');
        }
      },
    );
  });
});

module.exports = profileRouter;
