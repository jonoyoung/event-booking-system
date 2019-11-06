// Initial variables.
var express = require('express');
var nl2br = require('nl2br');
var bcrypt = require('bcrypt');
const saltRounds = 10;
var router = express.Router();
var SqlString = require('sqlstring');

// Homepage.
router.get('/', function(req, res, next) {
    // Get all of the events from the database and output them to the index page.
    db.query("SELECT * FROM events", function(error, results, fields) {
        if (results.length > 0) {
            res.render('index.ejs', {"events": results, "loggedIn": req.session.loggedin});
        } else {
            res.render('index.ejs', {"loggedIn": req.session.loggedin});
        }
    });
});

// Get the event ID page.
router.get('/event/:id', function(req, res) {
    // Select the event from the database where it is equal to the 'id' number in the URL.
    var eventQuery = "SELECT * FROM events WHERE id = " + SqlString.escape(req.params.id) + ";";

    var eventResult;
    var attResult;
    var attendingRes;

    // Select the users from the attendees where the userId is equal to the user logged in.
    var attendQuery = "SELECT userId FROM attendees WHERE userId = " + SqlString.escape(req.session.userId) + ";";
    db.query(attendQuery, function(error, results, fields) {
        // If the user is attending change the attendingRes.
        if (results.length > 0) {
            attendingRes = true;
        } else {
            attendingRes = false;
        }
    });

    db.query(eventQuery, function(error, results, fields) {
        if (results.length > 0) {
            eventResult = results[0];

            // Get the attendees from the tables and input them into the attResult variable.
            var attQuery = "SELECT attendees.userId, users.firstName, users.lastName FROM users JOIN attendees ON attendees.userId = users.id JOIN events ON attendees.eventId = " + SqlString.escape(results[0].id) + " GROUP BY users.id;";
            db.query(attQuery, function(error, results, fields) {
                if (error) {}
                attResult = results;
            });

            // Select the user that owns the event and assign them to the "user" variable in the session.
            var userQuery = "SELECT users.id, users.username, users.firstName, users.lastName FROM users JOIN events ON events.username = users.username WHERE events.id = " + SqlString.escape(eventResult.id) + ";";
            db.query(userQuery, function(error, results, fields) {
                if (results.length > 0) {
                    res.render('event.ejs', {expressFlash: req.flash('error'), sessionFlash: res.locals.sessionFlash, "event": eventResult, "eventDesc": nl2br(eventResult.description), "attendees": attResult, "user": results[0], "loggedIn": req.session.loggedin, "userLoggedIn": req.session.username, "userLoggedInId": req.session.userId, "attending": attendingRes});
                }
            });
        } else {
            // If there is no event for that ID return the blank page.
            res.redirect('back');
        }
    });
});

// Edit the event ID page.
router.get('/edit-event/:id', function(req, res) {
    // Select the event from the database that matches the event in the URL ':id'.
    var eventQuery = "SELECT * FROM events WHERE id = " + SqlString.escape(req.params.id) + ";";

    db.query(eventQuery, function(error, results, fields) {
        if (results.length > 0) {
            // If you are not the owner of the event then you get redirected to the homepage.
            if (results[0].username != req.session.username) {
                res.redirect('/');
                return;
            }

            // Otherwise render the edit-event page.
            res.render('edit-event.ejs', {"loggedIn": req.session.loggedin, "event": results});
        }
    });
});

// Cancel post.
router.get('/cancel-event/:id', checkAuth, function(req, res) {
    // Select the events that match the ID in the url. Setup a DELETE statement if the user passes the verification.
    var selectQuery = "SELECT * FROM events WHERE id = " + SqlString.escape(req.params.id) + ";";
    var deleteQuery = "DELETE FROM events WHERE id = " + SqlString.escape(req.params.id) + ";";

    db.query(selectQuery, function(error, results, fields) {
        if (results.length > 0) {
            // If the user doesn't own the event then redirect them to the homepage.
            if (results[0].username != req.session.username) {
                res.redirect('/');
                return;
            }

            // Otherwise delete the event and redirect to the homepage.
            db.query(deleteQuery, function(error, results, fields) {
                if (error) {}

                // Add activity.
                var activityQuery = "INSERT INTO activity (userId, title, description, date) VALUES(" + SqlString.escape(req.session.userId) + ", '[Cancel Event]', 'You cancelled your event: " + req.params.id + ".', NOW());";
                db.query(activityQuery, function(error, results) {if (error) {console.log("[Activity] Insert error: " + error);}});
                res.redirect('/');
            });
        }
    });
});

// Edit the event POST.
router.post('/edit-event/:id', function(req, res) {
    // Update the event based on the parameters in the form.
    var updateQuery = "UPDATE events SET title=" + SqlString.escape(req.body.title) + ", shortDesc=" + SqlString.escape(req.body.shortDesc) + ", description=" + SqlString.escape(req.body.description) + ", location=" + SqlString.escape(req.body.location) + ", date=" + SqlString.escape(req.body.date) + ", time=" + SqlString.escape(req.body.time) + ", capacity=" + SqlString.escape(req.body.capacity) + ", price=" + SqlString.escape(req.body.price) + ", promoCode=" + SqlString.escape(req.body.promoCode) + " WHERE id = " + SqlString.escape(req.params.id) + ";";

    db.query(updateQuery, function(error, results, fields) {
        if (error) {}

        // Add activity.
        var activityQuery = "INSERT INTO activity (userId, title, description, date) VALUES(" + SqlString.escape(req.session.userId) + ", '[Edit Event]', 'You edited the event: " + req.body.title + ".', NOW());";
        db.query(activityQuery, function(error, results) {if (error) {console.log("[Activity] Insert error: " + error);}});
        
        // Redirect the user after it has been updated.
        res.redirect('/');
    });
});

// Attend event.
router.get('/attend/:id', function(req, res) {
    // Select the user from the users table where the username is equal to the user logged in.
    var userQuery = "SELECT id FROM users WHERE username = " + SqlString.escape(req.session.username) + ";";

    db.query(userQuery, function(error, results, fields) {
        if (error) {}

        // Select the user from the attendees table.
        var inEventQuery = "SELECT userId FROM attendees WHERE userId = " + SqlString.escape(req.session.userId) + ";";
        db.query(inEventQuery, function(error, results, fields) {
            if (error) {}

            // If they don't exist in the table then INSERT the values into the attendees table.
            var insertQuery = "INSERT INTO attendees (eventId, userId, date) VALUES (" + SqlString.escape(req.params.id) + ", " + SqlString.escape(req.session.userId) + ", CURDATE());";
            db.query(insertQuery, function(error, results, fields) {
                if (error) {}

                // Add activity.
                var activityQuery = "INSERT INTO activity (userId, title, description, date) VALUES(" + SqlString.escape(req.session.userId) + ", '[Attend]', 'You selected to attend the event: " + req.params.id + ".', NOW());";
                db.query(activityQuery, function(error, results) {if (error) {console.log("[Activity] Insert error: " + error);}});

                // Send a session flash event and redirect the user back to the page before.
                req.session.sessionFlash = {type: 'success', message: 'You are now attending this event.'}
                res.redirect('back');
            });
        });
    });
});

// Cancel attendance.
router.get('/cancel-attend/:userId/:eventId', checkAuth, function(req, res) {
    // Select the user from the databas. Setup the DELETE statement if the user is attending the event.
    var selectQuery = "SELECT * FROM users WHERE id = " + SqlString.escape(req.params.userId) + ";";
    var deleteQuery = "DELETE FROM attendees WHERE userId = " + SqlString.escape(req.params.userId) + " AND eventId = " + SqlString.escape(req.params.eventId) + ";";

    db.query(selectQuery, function(error, results, fields) {
        if (results.length > 0) {
            db.query(deleteQuery, function(error, results, fields) {
                if (error) {}

                // Add activity.
                var activityQuery = "INSERT INTO activity (userId, title, description, date) VALUES(" + SqlString.escape(req.session.userId) + ", '[Cancel Attend]', 'You cancelled your attendance to the event: " + req.params.eventId + ".', NOW());";
                db.query(activityQuery, function(error, results) {if (error) {console.log("[Activity] Insert error: " + error);}});

                // If all successful then delete the user from attendees and send the alert message to the front end.
                req.session.sessionFlash = {type: 'success', message: 'Cancellation successful.'}
                res.redirect('back');
            });
        } else {
            // If no user is found then redirect back to the page before.
            res.redirect('back');
        }
    });
});

// Get promo code.
router.post('/enter-promo/:id', function(req, res) {
    // Select the promo code related to the EVENT ID.
    var selectQuery = "SELECT promoCode FROM events WHERE id = " + SqlString.escape(req.params.id) + ";";

    var promoCode;
    db.query(selectQuery, function(error, results, fields) {
        if (results.length > 0) {
            // If the promo code exists then insert it into the variable promoCode.
            promoCode = results[0].promoCode;

            // If the promo code matches the promo code entered by the user then 
            if (promoCode == req.body.promoCode) {
                // If successful then send the alert message and redirect.
                req.session.sessionFlash = {type: 'success', message: 'Promo code successfully applied.'}
                res.redirect('back');
            } else {
                // If the user enters the wrong promo code then send alert and redirect.
                req.session.sessionFlash = {type: 'error', message: 'Promo code was incorrect.'}
                res.redirect('back');
            }
        }
    });
});

// Login.
router.get('/login', function(req, res, next) {
    // Send the login page with error message setup.
    return res.render('login.ejs',  {"loggedIn": req.session.loggedin, expressFlash: req.flash('error'), sessionFlash: res.locals.sessionFlash});
});

router.post('/login', function(req, res, next) {
    // If the user tries to login then select the username and password.
    var userQuery = "SELECT id, username, password FROM users WHERE username = " + SqlString.escape(req.body.username) + ";";

    db.query(userQuery, function(error, results, fields) {
        if (results.length > 0) {
            // If the password matches the hashed DB password.
            if (bcrypt.compareSync(req.body.password, results[0].password)) {
                req.session.loggedin = true;
                req.session.username = results[0].username;
                req.session.userId = results[0].id;
                res.redirect('/profile');

                // Add activity.
                var activityQuery = "INSERT INTO activity (userId, title, description, date) VALUES(" + SqlString.escape(req.session.userId) + ", '[Login]', 'You logged in.', NOW());";
                db.query(activityQuery, function(error, results) {if (error) {console.log("[Activity] Insert error: " + error);}});
            } else {
                // Redirect if password wrong.
                req.session.sessionFlash = {type: 'error', message: 'Username or password was incorrect.'};
                res.redirect('/login');
            }
        } else {
            // If username doesn't exist redirect.
            req.session.sessionFlash = {type: 'error', message: 'Username or password was incorrect.'};
            res.redirect('/login');
        }
    });
});

// Profile.
router.get('/profile', checkAuth, function(req, res, next) {
    // If the user is logged in then select all of the attributes of that user and render the profile page.
    db.query('SELECT username, firstName, lastName FROM users WHERE username = ?', [req.session.username], function(error, result, fields) {
        if (result.length > 0) {
            res.render('profile.ejs', {"loggedIn": req.session.loggedin, "id": req.session.userId, "username": result[0].username, "firstName": result[0].firstName, "lastName": result[0].lastName});
        } else {
            res.redirect('/');
        }
    });
});

// Profile Edit.
router.get('/edit-profile', checkAuth, function(req, res, next) {
    db.query('SELECT username, firstName, lastName FROM users WHERE username = ?', [req.session.username], function(error, result) {
        if (result.length > 0) {
            res.render('edit-profile.ejs', {"loggedIn": req.session.loggedin, "username": result[0].username, "firstName": result[0].firstName, "lastName": result[0].lastName, expressFlash: req.flash('error'), sessionFlash: res.locals.sessionFlash});
        } else {
            res.redirect('/');
        }
    });
});

// Profile edit post.
router.post('/edit-profile', function(req, res, next) {
    // Update the event based on the parameters in the form.
    let selectQuery = "SELECT username FROM users WHERE username = " + SqlString.escape(req.body.username) + ";";
    db.query(selectQuery, function(error, result) {
        if (result) {
            if (result.username == req.body.username) {
                // If username exists redirect.
                req.session.sessionFlash = {type: 'error', message: 'Username already exists.'};
                res.redirect('/edit-profile');
                return;
            } else {
                // Encrypt the password code.
                var salt = bcrypt.genSaltSync(saltRounds);
                var hash = bcrypt.hashSync(req.body.newPassword, salt);
                var updateQuery;

                if (req.body.newPassword.length == 0) {
                    updateQuery = "UPDATE users SET username=" + SqlString.escape(req.body.username) + ", firstName=" + SqlString.escape(req.body.firstName) + ", lastName=" + SqlString.escape(req.body.lastName) + " WHERE username=" + SqlString.escape(req.session.username) + ";";
                } else if (req.body.newPassword.length > 0 && req.body.newPassword == req.body.newPasswordConfirm) {
                    updateQuery = "UPDATE users SET username=" + SqlString.escape(req.body.username) + ", firstName=" + SqlString.escape(req.body.firstName) + ", lastName=" + SqlString.escape(req.body.lastName) + ", password=" + SqlString.escape(hash) + " WHERE username=" + SqlString.escape(req.session.username) + ";";
                }
                
                db.query(updateQuery, function(error, results, fields) {
                    if (error) {}
                        
                    // Add activity.
                    var activityQuery = "INSERT INTO activity (userId, title, description, date) VALUES(" + SqlString.escape(req.session.userId) + ", '[Update Profile]', 'You updated your profile.', NOW());";
                    db.query(activityQuery, function(error, results) {if (error) {console.log("[Activity] Insert error: " + error);}});

                    // Redirect the user after it has been updated.
                    req.session.username = req.body.username;
                    res.redirect('/profile');
                });
            }
        }
    });
});

// Profile activity.
router.get('/activity/:id', checkAuth, function(req, res, next) {
    if (req.session.userId != req.params.id) {
        res.render('error.ejs', {text: "You are not authorized to view this."});
    } else {
        db.query('SELECT * FROM activity WHERE userId = ?', [req.params.id], function(error, result) {
            if (result.length > 0) {
                res.render('activity.ejs', {"loggedIn": req.session.loggedin, "id": req.session.userId, "username": req.session.username, "activity": result, expressFlash: req.flash('error'), sessionFlash: res.locals.sessionFlash});
            } else {
                req.session.sessionFlash = {type: 'error', message: 'You have no activity to view.'};
                return res.redirect('/profile');
            }
        });
    }
});

// Post the event page.
router.get('/create-event', checkAuth, function(req, res, next) {
    // Create an event if the user is logged in otherwise redirect to the homepage.
    if (req.session.loggedin) {
        return res.render('create-event.ejs', {"loggedIn": req.session.loggedin});
    } else {
        return res.redirect('/');
    }
});

// Get the create-event post method.
router.post('/create-event', function(req, res, next) {
    var insertQuery;

    // Check if a promocode has been entered.
    if (req.body.promoCode != "") {
        insertQuery = "INSERT INTO events (title, shortDesc, description, location, date, time, capacity, price, promoCode, username) VALUES (" + SqlString.escape(req.body.title) + ", " + SqlString.escape(req.body.shortDesc) + ", " + SqlString.escape(req.body.description) + ", " + SqlString.escape(req.body.location) + ", " + SqlString.escape(req.body.date) + ", " + SqlString.escape(req.body.time) + ", " + SqlString.escape(req.body.capacity) + ", " + SqlString.escape(req.body.price) + ", " + SqlString.escape(req.body.promoCode) + ", '" + req.session.username + "');";
    } else {
        insertQuery = "INSERT INTO events (title, shortDesc, description, location, date, time, capacity, price, username) VALUES (" + SqlString.escape(req.body.title) + ", " + SqlString.escape(req.body.shortDesc) + ", " + SqlString.escape(req.body.description) + ", " + SqlString.escape(req.body.location) + ", " + SqlString.escape(req.body.date) + ", " + SqlString.escape(req.body.time) + ", " + SqlString.escape(req.body.capacity) + ", " + SqlString.escape(req.body.price) + ", '" + req.session.username + "');";
    }

    // Insert the event into the EVENTS table.
    db.query(insertQuery, function(err, result) {
        if (err) {
            console.log(err);
        }

        // Add activity.
        var activityQuery = "INSERT INTO activity (userId, title, description, date) VALUES(" + SqlString.escape(req.session.userId) + ", '[Create Event]', 'You created the event: " + req.body.title + ".', NOW());";
        db.query(activityQuery, function(error, results) {if (error) {console.log("[Activity] Insert error: " + error);}});

        res.redirect('/');
    });
});

// Payment.
router.get('/payment/:id', checkAuth, function(req, res, next) {
    let query = "SELECT * FROM events WHERE id = " + SqlString.escape(req.params.id) + ";";

    db.query(query, function(err, result) {
        if (result.length > 0) {
            res.render('payment.ejs', {"loggedIn": req.session.loggedin, expressFlash: req.flash('error'), sessionFlash: res.locals.sessionFlash, event: result[0]});
        } else {
            res.redirect('/');
        }
    });
});

// Payment post.
router.post('/payment/:id', function(req, res, next) {
    res.redirect('/event/' + req.params.id);
})

// Register get.
router.get('/register', function(req, res, next) {
    return res.render('register.ejs', {"loggedIn": req.session.loggedin, expressFlash: req.flash('error'), sessionFlash: res.locals.sessionFlash});
});

// Register post method.
router.post('/register', function(req, res, next) {
    // If the passwords match select the user from the table based on username provided.
    if (req.body.password == req.body.passwordConfirm) {
        var query = "SELECT username FROM users WHERE username = " + SqlString.escape(req.body.username) + ";";

        // If the user exists then don't let them register with that username.
        db.query(query, function(err, result) {
            if (err) {console.log('[Server] [DB]: You cannot have that username, it is already in use.');}

            // Encrypt the password code.
            var salt = bcrypt.genSaltSync(saltRounds);
            var hash = bcrypt.hashSync(req.body.password, salt);

            // If the user doesn't exist then INSERT the user into the table based on their supplied attributes.
            if (result.length != 0) {
                if (result[0].username == req.body.username) {
                    req.session.sessionFlash = {type: 'error', message: 'That username already exists.'}
                    res.redirect('/register');
                }
            } else if (result.length == 0) {
                var insertQuery = "INSERT INTO users (username, firstName, lastName, password) VALUES(" + SqlString.escape(req.body.username) + ", " + SqlString.escape(req.body.firstName) + ", " + SqlString.escape(req.body.lastName) + ", " + SqlString.escape(hash) + ");";
                db.query(insertQuery, function(err, result) {
                    if (err) {console.log(err);}

                    // Send the alert that it was created.
                    req.session.sessionFlash = {type: 'success', message: 'Created account successfully, please log in now.'}
                    req.session.username = req.body.username;
                    res.redirect('/login');
                });
            }
        });
    } else {
        // Send the alert that passwords don't match.
        req.session.sessionFlash = {type: 'error', message: 'Your passwords did not match.'}
        res.redirect('/register');
    }
});

// Logout.
router.get('/logout', function(req, res, next) {
    // Logout the user and destroy the session they have.
    if (req.session) {
        req.session.destroy(function(err) {
            if (err) {
                return false;
            } else {
                return res.redirect('/login');
            }
        });
    }
});

// Check whether the user is logged in.
function checkAuth(req, res, next) {
    // If the user is not logged in then they aren't allowed to view the page, otherwise let them continue.
    if (!req.session.loggedin) {
        res.render('error.ejs', {text: "You are not authorized to view this."});
    } else {
        next();
    }
}

module.exports = router;