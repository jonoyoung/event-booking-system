const editProfileRouter = require('express').Router();
const SqlString = require('sqlstring');
const checkAuth = require('../../util/auth/checkAuth');
const bcrypt = require('bcrypt');
const SALT_ROUNDS = require('../../constants/defaultConstants');

/**
 * Edit Profile GET
 * Render the edit profile page for current user.
 */
editProfileRouter.get('/edit-profile', checkAuth, (req, res) => {
  db.getConnection((err, connection) => {
    connection.query(
      'SELECT username, firstName, lastName FROM users WHERE username = ?',
      [req.session.username],
      (error, result) => {
        connection.release();

        if (result.length > 0) {
          res.render('edit-profile.ejs', {
            loggedIn: req.session.loggedin,
            username: result[0].username,
            firstName: result[0].firstName,
            lastName: result[0].lastName,
            expressFlash: req.flash('error'),
            sessionFlash: res.locals.sessionFlash,
          });
        } else {
          res.redirect('/');
        }
      },
    );
  });
});

/**
 * Edit Profile POST
 * Update the current user's profile with the form data.
 */
editProfileRouter.post('/edit-profile', (req, res) => {
  if (!req.body.username && !req.body.firstName && !req.body.lastName) {
    res.redirect('/profile');
  }

  // Update the event based on the parameters in the form.
  const selectQuery = `SELECT username FROM users WHERE username = ${SqlString.escape(
    req.body.username,
  )};`;

  db.getConnection((err, connection) => {
    connection.query(selectQuery, (error, result) => {
      if (result) {
        if (result.username == req.body.username) {
          // If username exists redirect.
          req.session.sessionFlash = {
            type: 'error',
            message: 'Username already exists.',
          };
          res.redirect('/edit-profile');
        } else {
          // Encrypt the password code.
          const salt = bcrypt.genSaltSync(SALT_ROUNDS);
          const hash = bcrypt.hashSync(req.body.newPassword, salt);
          let updateQuery;

          if (req.body.newPassword.length == 0) {
            updateQuery = `UPDATE users SET username=${SqlString.escape(
              req.body.username,
            )}, firstName=${SqlString.escape(
              req.body.firstName,
            )}, lastName=${SqlString.escape(
              req.body.lastName,
            )} WHERE username=${SqlString.escape(req.session.username)};`;
          } else if (
            req.body.newPassword.length > 0 &&
            req.body.newPassword == req.body.newPasswordConfirm
          ) {
            updateQuery = `UPDATE users SET username=${SqlString.escape(
              req.body.username,
            )}, firstName=${SqlString.escape(
              req.body.firstName,
            )}, lastName=${SqlString.escape(
              req.body.lastName,
            )}, password=${SqlString.escape(
              hash,
            )} WHERE username=${SqlString.escape(req.session.username)};`;
          }

          connection.query(updateQuery, (error, results) => {
            // Add activity.
            const activityQuery = `INSERT INTO activity (userId, title, description, date) VALUES(${SqlString.escape(
              req.session.userId,
            )}, '[Update Profile]', 'You updated your profile.', NOW());`;
            connection.query(activityQuery, (error, results) => {
              if (error) {
                console.log(`[Activity] Insert error: ${error}`);
              }
            });

            // Redirect the user after it has been updated.
            req.session.username = req.body.username;
            res.redirect('/profile');
          });
        }
      }

      connection.release();
    });
  });
});

module.exports = editProfileRouter;
