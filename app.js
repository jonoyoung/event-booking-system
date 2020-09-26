const express = require('express');
const bodyParser = require('body-parser');
const flash = require('express-flash');
const mysql = require('mysql');
const session = require('express-session');
const MemoryStore = require('memorystore')(session);
const MysqlStore = require('express-mysql-session')(session);
const routes = require('./routes/router');
require('dotenv').config();

const app = express();

// MySQL related code.
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

// Connect to the database.
db.connect((err) => {
  if (err) {
    console.log(`[Server] [DB]: Error connecting to MySQL: ${err}`);
    process.exit(1);
  } else {
    console.log('[Server] [DB]: Successfully connected to MySQL.');
  }
});

// Setup the session store and make the database variables global.
const sessionStore = new MysqlStore({ expiration: 3600000 }, db);
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
    store: new MemoryStore({ checkPeriod: 86400000 }),
  }),
);

// Set the express ports, views and public directory names.
app.use(express.static(`${__dirname}/public`));
app.use(flash());
app.set('port', process.env.PORT || 3000);
app.set('view engine', 'ejs');

// Setup the error messaging.
app.use((req, res, next) => {
  res.locals.sessionFlash = req.session.sessionFlash;
  delete req.session.sessionFlash;
  next();
});

// Setup the body parser values.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Configure the routes to be sent to the router.js file.
app.use('/', routes);

// If the URL entered could not be found, return this message.
app.use((req, res) => {
  res.status(404).render('404.ejs', { loggedIn: req.session.loggedin });
});

// Response status for error code 500.
app.use((err, res) => {
  res.status(err.status || 500);
  res.send(err.message);
});

// Creates the server and listens on the specified port.
app.listen(app.get('port'), () => {
  console.log(
    `[Server]: Server has started and is listening on port ${app.get('port')}.`,
  );
});
