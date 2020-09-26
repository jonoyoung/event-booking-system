const eventRouter = require('express').Router();
const nl2br = require('nl2br');
const SqlString = require('sqlstring');

/**
 * Get Event
 * Gets the event page based on the ID it is given.
 */
eventRouter.get('/event/:id', (req, res) => {
  // Select the event from the database where it is equal to the 'id' number in the URL.
  const eventQuery = `SELECT * FROM events WHERE id = ${SqlString.escape(
    req.params.id,
  )};`;

  let eventResult;
  let attResult;
  let attendingRes;

  // Select the users from the attendees where the userId is equal to the user logged in.
  const attendQuery = `SELECT userId FROM attendees WHERE userId = ${SqlString.escape(
    req.session.userId,
  )};`;
  db.query(attendQuery, (error, results) => {
    // If the user is attending change the attendingRes.
    if (results.length > 0) {
      attendingRes = true;
    } else {
      attendingRes = false;
    }
  });

  db.query(eventQuery, (error, results) => {
    if (results.length > 0) {
      eventResult = results[0];

      // Get the attendees from the tables and input them into the attResult variable.
      const attQuery = `SELECT attendees.userId, users.firstName, users.lastName FROM users JOIN attendees ON attendees.userId = users.id JOIN events ON attendees.eventId = ${SqlString.escape(
        results[0].id,
      )} GROUP BY users.id;`;
      db.query(attQuery, (error, results) => {
        attResult = results;
      });

      // Select the user that owns the event and assign them to the "user" variable in the session.
      const userQuery = `SELECT users.id, users.username, users.firstName, users.lastName FROM users JOIN events ON events.username = users.username WHERE events.id = ${SqlString.escape(
        eventResult.id,
      )};`;
      db.query(userQuery, (error, results) => {
        if (results.length > 0) {
          res.render('event.ejs', {
            expressFlash: req.flash('error'),
            sessionFlash: res.locals.sessionFlash,
            event: eventResult,
            eventDesc: nl2br(eventResult.description),
            attendees: attResult,
            user: results[0],
            loggedIn: req.session.loggedin,
            userLoggedIn: req.session.username,
            userLoggedInId: req.session.userId,
            attending: attendingRes,
          });
        }
      });
    } else {
      // If there is no event for that ID return the blank page.
      res.redirect('back');
    }
  });
});

module.exports = eventRouter;
