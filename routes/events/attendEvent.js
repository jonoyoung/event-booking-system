const attendEventRouter = require('express').Router();
const SqlString = require('sqlstring');
const checkAuth = require('../../util/auth/checkAuth');

/**
 * Attend Event
 * Makes the currently logged in user attend the given event.
 */
attendEventRouter.get('/attend/:id', (req, res) => {
  // Select the user from the users table where the username is equal to the user logged in.
  const userQuery = `SELECT id FROM users WHERE username = ${SqlString.escape(
    req.session.username,
  )};`;

  db.getConnection((err, connection) => {
    connection.query(userQuery, (error, results) => {
      if (error) {
      }

      // Select the user from the attendees table.
      const inEventQuery = `SELECT userId FROM attendees WHERE userId = ${SqlString.escape(
        req.session.userId,
      )};`;
      connection.query(inEventQuery, (error, results) => {
        // If they don't exist in the table then INSERT the values into the attendees table.
        const insertQuery = `INSERT INTO attendees (eventId, userId, date) VALUES (${SqlString.escape(
          req.params.id,
        )}, ${SqlString.escape(req.session.userId)}, CURDATE());`;
        connection.query(insertQuery, (error, results) => {
          // Add activity.
          const activityQuery = `INSERT INTO activity (userId, title, description, date) VALUES(${SqlString.escape(
            req.session.userId,
          )}, '[Attend]', 'You selected to attend the event: ${
            req.params.id
          }.', NOW());`;
          connection.query(activityQuery, (error, results) => {
            if (error) {
              console.log(`[Activity] Insert error: ${error}`);
            }
          });

          // Send a session flash event and redirect the user back to the page before.
          req.session.sessionFlash = {
            type: 'success',
            message: 'You are now attending this event.',
          };
          res.redirect('back');
        });
      });

      connection.release();
    });
  });
});

/**
 * Cancel Attendance Event
 * Cancel the current users attendance at the given event.
 */
attendEventRouter.get(
  '/cancel-attend/:userId/:eventId',
  checkAuth,
  (req, res) => {
    // Select the user from the databas. Setup the DELETE statement if the user is attending the event.
    const selectQuery = `SELECT * FROM users WHERE id = ${SqlString.escape(
      req.params.userId,
    )};`;
    const deleteQuery = `DELETE FROM attendees WHERE userId = ${SqlString.escape(
      req.params.userId,
    )} AND eventId = ${SqlString.escape(req.params.eventId)};`;

    db.getConnection((err, connection) => {
      connection.query(selectQuery, (error, results) => {
        if (results.length > 0) {
          connection.query(deleteQuery, (error, results) => {
            // Add activity.
            const activityQuery = `INSERT INTO activity (userId, title, description, date) VALUES(${SqlString.escape(
              req.session.userId,
            )}, '[Cancel Attend]', 'You cancelled your attendance to the event: ${
              req.params.eventId
            }.', NOW());`;
            connection.query(activityQuery, (error, results) => {
              if (error) {
                console.log(`[Activity] Insert error: ${error}`);
              }
            });

            // If all successful then delete the user from attendees and send the alert message to the front end.
            req.session.sessionFlash = {
              type: 'success',
              message: 'Cancellation successful.',
            };
            res.redirect('back');
          });
        } else {
          // If no user is found then redirect back to the page before.
          res.redirect('back');
        }

        connection.release();
      });
    });
  },
);

module.exports = attendEventRouter;
