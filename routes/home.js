const homeRouter = require('express').Router();

// Homepage.
homeRouter.get('/', (req, res) => {
  // Get all of the events from the database and output them to the index page.
  db.query('SELECT * FROM events', (error, results) => {
    if (results.length > 0) {
      res.render('index.ejs', {
        events: results,
        loggedIn: req.session.loggedin,
      });
    } else {
      res.render('index.ejs', { loggedIn: req.session.loggedin });
    }
  });
});

module.exports = homeRouter;
