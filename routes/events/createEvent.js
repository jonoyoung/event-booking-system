const createEventRouter = require('express').Router();
const SqlString = require('sqlstring');
const checkAuth = require('../../util/checkAuth');

/**
 * Create Event GET
 * Redirects the user if logged in to the create-event page.
 */
createEventRouter.get('/create-event', checkAuth, (req, res) => {
  // Create an event if the user is logged in otherwise redirect to the homepage.
  if (req.session.loggedin) {
    return res.render('create-event.ejs', { loggedIn: req.session.loggedin });
  }
  return res.redirect('/');
});

/**
 * Create Event POST
 * Inserts the given create-event page data to the database.
 */
createEventRouter.post('/create-event', (req, res) => {
  let insertQuery;

  // Check if a promocode has been entered.
  if (req.body.promoCode != '') {
    insertQuery = `INSERT INTO events (title, shortDesc, description, location, date, time, capacity, price, promoCode, username) VALUES (${SqlString.escape(
      req.body.title,
    )}, ${SqlString.escape(req.body.shortDesc)}, ${SqlString.escape(
      req.body.description,
    )}, ${SqlString.escape(req.body.location)}, ${SqlString.escape(
      req.body.date,
    )}, ${SqlString.escape(req.body.time)}, ${SqlString.escape(
      req.body.capacity,
    )}, ${SqlString.escape(req.body.price)}, ${SqlString.escape(
      req.body.promoCode,
    )}, '${req.session.username}');`;
  } else {
    insertQuery = `INSERT INTO events (title, shortDesc, description, location, date, time, capacity, price, username) VALUES (${SqlString.escape(
      req.body.title,
    )}, ${SqlString.escape(req.body.shortDesc)}, ${SqlString.escape(
      req.body.description,
    )}, ${SqlString.escape(req.body.location)}, ${SqlString.escape(
      req.body.date,
    )}, ${SqlString.escape(req.body.time)}, ${SqlString.escape(
      req.body.capacity,
    )}, ${SqlString.escape(req.body.price)}, '${req.session.username}');`;
  }

  // Insert the event into the EVENTS table.
  db.query(insertQuery, (err, result) => {
    if (err) {
      console.log(err);
    }

    // Add activity.
    const activityQuery = `INSERT INTO activity (userId, title, description, date) VALUES(${SqlString.escape(
      req.session.userId,
    )}, '[Create Event]', 'You created the event: ${req.body.title}.', NOW());`;
    db.query(activityQuery, (error, results) => {
      if (error) {
        console.log(`[Activity] Insert error: ${error}`);
      }
    });

    res.redirect('/');
  });
});

module.exports = createEventRouter;
