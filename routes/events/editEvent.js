const editEventRouter = require('express').Router();
const SqlString = require('sqlstring');

/**
 * Edit Event GET
 * Opens the page where the user that owns the event can edit its values.
 */
editEventRouter.get('/edit-event/:id', (req, res) => {
  // Select the event from the database that matches the event in the URL ':id'.
  const eventQuery = `SELECT * FROM events WHERE id = ${SqlString.escape(
    req.params.id,
  )};`;

  db.query(eventQuery, (error, results) => {
    if (results.length > 0) {
      // If you are not the owner of the event then you get redirected to the homepage.
      if (results[0].username != req.session.username) {
        res.redirect('/');
        return;
      }

      // Otherwise render the edit-event page.
      res.render('edit-event.ejs', {
        loggedIn: req.session.loggedin,
        event: results,
      });
    }
  });
});

/**
 * Edit Event POST
 * Updates the new details that the user has submitted for the given event.
 */
editEventRouter.post('/edit-event/:id', (req, res) => {
  // Update the event based on the parameters in the form.
  const updateQuery = `UPDATE events SET title=${SqlString.escape(
    req.body.title,
  )}, shortDesc=${SqlString.escape(
    req.body.shortDesc,
  )}, description=${SqlString.escape(
    req.body.description,
  )}, location=${SqlString.escape(req.body.location)}, date=${SqlString.escape(
    req.body.date,
  )}, time=${SqlString.escape(req.body.time)}, capacity=${SqlString.escape(
    req.body.capacity,
  )}, price=${SqlString.escape(req.body.price)}, promoCode=${SqlString.escape(
    req.body.promoCode,
  )} WHERE id = ${SqlString.escape(req.params.id)};`;

  db.query(updateQuery, (error, results) => {
    // Add activity.
    const activityQuery = `INSERT INTO activity (userId, title, description, date) VALUES(${SqlString.escape(
      req.session.userId,
    )}, '[Edit Event]', 'You edited the event: ${req.body.title}.', NOW());`;
    db.query(activityQuery, (error, results) => {
      if (error) {
        console.log(`[Activity] Insert error: ${error}`);
      }
    });

    // Redirect the user after it has been updated.
    res.redirect('/');
  });
});

module.exports = editEventRouter;
