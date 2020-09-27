const registerRouter = require('express').Router();
const SqlString = require('sqlstring');
const bcrypt = require('bcrypt');
const SALT_ROUNDS = require('../../constants/defaultConstants');

/**
 * Register GET
 * Render the register page.
 */
registerRouter.get('/register', (req, res) => {
  return res.render('register.ejs', {
    loggedIn: req.session.loggedin,
    expressFlash: req.flash('error'),
    sessionFlash: res.locals.sessionFlash,
  });
});

/**
 * Register POST
 * Create the user from the form data.
 */
registerRouter.post('/register', (req, res) => {
  // If the passwords match select the user from the table based on username provided.
  if (req.body.password == req.body.passwordConfirm) {
    const query = `SELECT username FROM users WHERE username = ${SqlString.escape(
      req.body.username,
    )};`;

    // If the user exists then don't let them register with that username.
    db.getConnection((err, connection) => {
      connection.query(query, (err, result) => {
        if (err) {
          console.log(
            '[Server] [DB]: You cannot have that username, it is already in use.',
          );
        }

        // Encrypt the password code.
        const salt = bcrypt.genSaltSync(SALT_ROUNDS);
        const hash = bcrypt.hashSync(req.body.password, salt);

        // If the user doesn't exist then INSERT the user into the table based on their supplied attributes.
        if (result.length != 0) {
          if (result[0].username == req.body.username) {
            req.session.sessionFlash = {
              type: 'error',
              message: 'That username already exists.',
            };
            res.redirect('/register');
          }
        } else if (result.length == 0) {
          const insertQuery = `INSERT INTO users (username, firstName, lastName, password) VALUES(${SqlString.escape(
            req.body.username,
          )}, ${SqlString.escape(req.body.firstName)}, ${SqlString.escape(
            req.body.lastName,
          )}, ${SqlString.escape(hash)});`;
          connection.query(insertQuery, function (err, result) {
            if (err) {
              console.log(err);
            }

            // Send the alert that it was created.
            req.session.sessionFlash = {
              type: 'success',
              message: 'Created account successfully, please log in now.',
            };
            req.session.username = req.body.username;
            res.redirect('/login');
          });
        }

        connection.release();
      });
    });
  } else {
    // Send the alert that passwords don't match.
    req.session.sessionFlash = {
      type: 'error',
      message: 'Your passwords did not match.',
    };
    res.redirect('/register');
  }
});

module.exports = registerRouter;
