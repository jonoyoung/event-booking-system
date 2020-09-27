const paymentRouter = require('express').Router();
const SqlString = require('sqlstring');
const checkAuth = require('../../util/auth/checkAuth');

/**
 * Payment GET
 * The payment event that just renders the payment screen.
 */
paymentRouter.get('/payment/:id', checkAuth, (req, res) => {
  const query = `SELECT * FROM events WHERE id = ${SqlString.escape(
    req.params.id,
  )};`;

  db.getConnection((err, connection) => {
    connection.query(query, (error, result) => {
      connection.release();
      if (result.length > 0) {
        res.render('payment.ejs', {
          loggedIn: req.session.loggedin,
          expressFlash: req.flash('error'),
          sessionFlash: res.locals.sessionFlash,
          event: result[0],
        });
      } else {
        res.redirect('/');
      }
    });
  });
});

/**
 * Payment POST
 * This event does not work properly as no billing was required for the assignment.
 */
paymentRouter.post('/payment/:id', (req, res) => {
  res.redirect(`/event/${req.params.id}`);
});

module.exports = paymentRouter;
