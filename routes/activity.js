const activityRouter = require('express').Router();
const checkAuth = require('../util/checkAuth');

/**
 * Activity
 * Displays the current users' activity.
 */
activityRouter.get('/activity/:id', checkAuth, (req, res) => {
  if (req.session.userId != req.params.id) {
    res.render('error.ejs', { text: 'You are not authorized to view this.' });
  } else {
    db.query(
      'SELECT * FROM activity WHERE userId = ?',
      [req.params.id],
      (error, result) => {
        if (result.length > 0) {
          res.render('activity.ejs', {
            loggedIn: req.session.loggedin,
            id: req.session.userId,
            username: req.session.username,
            activity: result,
            expressFlash: req.flash('error'),
            sessionFlash: res.locals.sessionFlash,
          });
        } else {
          req.session.sessionFlash = {
            type: 'error',
            message: 'You have no activity to view.',
          };
          return res.redirect('/profile');
        }
      },
    );
  }
});

module.exports = activityRouter;
