const loginRouter = require('express').Router();
const SqlString = require('sqlstring');
const bcrypt = require('bcrypt');

/**
 * Login GET
 * Render the login page.
 */
loginRouter.get('/login', (req, res) => {
  // Send the login page with error message setup.
  return res.render('login.ejs', {
    loggedIn: req.session.loggedin,
    expressFlash: req.flash('error'),
    sessionFlash: res.locals.sessionFlash,
  });
});

/**
 * Login POST
 * Create the user from the given form data.
 */
loginRouter.post('/login', (req, res) => {
  // If the user tries to login then select the username and password.
  const userQuery = `SELECT id, username, password FROM users WHERE username = ${SqlString.escape(
    req.body.username,
  )};`;

  db.query(userQuery, (error, results) => {
    if (results.length > 0) {
      // If the password matches the hashed DB password.
      if (bcrypt.compareSync(req.body.password, results[0].password)) {
        req.session.loggedin = true;
        req.session.username = results[0].username;
        req.session.userId = results[0].id;
        res.redirect('/profile');

        // Add activity.
        const activityQuery = `INSERT INTO activity (userId, title, description, date) VALUES(${SqlString.escape(
          req.session.userId,
        )}, '[Login]', 'You logged in.', NOW());`;
        db.query(activityQuery, (error, results) => {
          if (error) {
            console.log(`[Activity] Insert error: ${error}`);
          }
        });
      } else {
        // Redirect if password wrong.
        req.session.sessionFlash = {
          type: 'error',
          message: 'Username or password was incorrect.',
        };
        res.redirect('/login');
      }
    } else {
      // If username doesn't exist redirect.
      req.session.sessionFlash = {
        type: 'error',
        message: 'Username or password was incorrect.',
      };
      res.redirect('/login');
    }
  });
});

module.exports = loginRouter;
