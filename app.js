var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var flash = require('express-flash');
var mysql = require('mysql');
var session = require('express-session');
var mysqlStore = require('express-mysql-session')(session);
require('dotenv').config();

// MySQL related code.
var db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

// Connect to the database.
db.connect((err) => {
  if (err) {
    console.log('[Server] [DB]: Error connecting to MySQL: ' + err);
    process.exit(1);
  } else {
    console.log('[Server] [DB]: Successfully connected to MySQL.');
  }
});

// Setup the session store and make the database variables global.
var sessionStore = new mysqlStore(
  {
    expiration: 3600000,
  },
  db,
);
global.db = db;

// Setup the session values for storing user logins.
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: false,
    cookie: {
      expires: new Date(Date.now() + 3600000),
      maxAge: 3600000,
    },
  }),
);

// Set the express ports, views and public directory names.
app.use(express.static(__dirname + '/public'));
app.use(flash());
app.set('port', process.env.PORT || 3000);
app.set('view engine', 'ejs');

// Setup the error messaging.
app.use(function (req, res, next) {
  res.locals.sessionFlash = req.session.sessionFlash;
  delete req.session.sessionFlash;
  next();
});

// Setup the body parser values.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Configure the routes to be sent to the router.js file.
var routes = require('./routes/router');
app.use('/', routes);

// If the URL entered could not be found, return this message.
app.use(function (req, res) {
  res.status(404).render('404.ejs', { loggedIn: req.session.loggedin });
});

// Response status for error code 500.
app.use(function (err, res) {
  res.status(err.status || 500);
  res.send(err.message);
});

// Creates the server and listens on the specified port.
app.listen(app.get('port'), function () {
  console.log(
    '[Server]: Server has started and is listening on port ' +
      app.get('port') +
      '.',
  );
});
