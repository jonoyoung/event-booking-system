const cancelEventRouter = require('express').Router();
const SqlString = require('sqlstring');
const checkAuth = require('../../util/checkAuth');

/**
 * Cancel Event
 * Removes the event related to the ID provided. User needs to be the owner of the event.
 */
cancelEventRouter.get('/cancel-event/:id', checkAuth, (req, res) => {
  // Select the events that match the ID in the url. Setup a DELETE statement if the user passes the verification.
  const selectQuery = `SELECT * FROM events WHERE id = ${SqlString.escape(
    req.params.id,
  )};`;
  const deleteQuery = `DELETE FROM events WHERE id = ${SqlString.escape(
    req.params.id,
  )};`;

  db.query(selectQuery, (error, results) => {
    if (results.length > 0) {
      // If the user doesn't own the event then redirect them to the homepage.
      if (results[0].username != req.session.username) {
        res.redirect('/');
        return;
      }

      // Otherwise delete the event and redirect to the homepage.
      db.query(deleteQuery, (error, results, fields) => {
        // Add activity.
        const activityQuery = `INSERT INTO activity (userId, title, description, date) VALUES(${SqlString.escape(
          req.session.userId,
        )}, '[Cancel Event]', 'You cancelled your event: ${
          req.params.id
        }.', NOW());`;
        db.query(activityQuery, (error, results) => {
          if (error) {
            console.log(`[Activity] Insert error: ${error}`);
          }
        });
        res.redirect('/');
      });
    }
  });
});

module.exports = cancelEventRouter;
