const promoCodeRouter = require('express').Router();
const SqlString = require('sqlstring');

/**
 * Enter Promo Code
 * Checks whether the promo code is correct or incorrect. Doesn't do anything else as not apart of the assignment spec.
 */
promoCodeRouter.post('/enter-promo/:id', (req, res) => {
  // Select the promo code related to the EVENT ID.
  const selectQuery = `SELECT promoCode FROM events WHERE id = ${SqlString.escape(
    req.params.id,
  )};`;

  let promoCode;
  db.getConnection((err, connection) => {
    connection.query(selectQuery, (error, results) => {
      connection.release();
      if (results.length > 0) {
        // If the promo code exists then insert it into the variable promoCode.
        promoCode = results[0].promoCode;

        // If the promo code matches the promo code entered by the user then
        if (promoCode == req.body.promoCode) {
          // If successful then send the alert message and redirect.
          req.session.sessionFlash = {
            type: 'success',
            message: 'Promo code successfully applied.',
          };
          res.redirect('back');
        } else {
          // If the user enters the wrong promo code then send alert and redirect.
          req.session.sessionFlash = {
            type: 'error',
            message: 'Promo code was incorrect.',
          };
          res.redirect('back');
        }
      }
    });
  });
});

module.exports = promoCodeRouter;
