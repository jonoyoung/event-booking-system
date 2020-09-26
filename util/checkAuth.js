/**
 * Check Auth
 * Checks whether the given user is logged in and whether they posses the correct privileges
 * to view the given page.
 *
 * @param {object} req
 * @param {object} res
 * @param {function} next
 */
const checkAuth = (req, res, next) => {
  if (!req.session.loggedin) {
    res.render('error.ejs', { text: 'You are not authorized to view this.' });
  } else {
    next();
  }
};

module.exports = checkAuth;
