const router = require('express').Router();

// All of the routers we require.
const homeRouter = require('./home');

// Event related routers.
const eventRouter = require('./events/events');
const cancelEventRouter = require('./events/cancelEvent');
const editEventRouter = require('./events/editEvent');
const attendEventRouter = require('./events/attendEvent');
const createEventRouter = require('./events/createEvent');
const promoCodeRouter = require('./events/promoCodeEvent');
const paymentRouter = require('./events/paymentEvent');

// Auth related routers.
const loginRouter = require('./auth/login');
const registerRouter = require('./auth/register');
const logoutRouter = require('./auth/logout');
const profileRouter = require('./auth/profile');
const editProfileRouter = require('./auth/editProfile');
const activityRouter = require('./activity');

router.use(homeRouter);
router.use(eventRouter);
router.use(cancelEventRouter);
router.use(editEventRouter);
router.use(attendEventRouter);
router.use(createEventRouter);
router.use(promoCodeRouter);
router.use(paymentRouter);
router.use(loginRouter);
router.use(registerRouter);
router.use(logoutRouter);
router.use(profileRouter);
router.use(editProfileRouter);
router.use(activityRouter);

module.exports = router;
