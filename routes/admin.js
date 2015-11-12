var express = require('express');
var UserController = require('../controllers/users');
var router = express.Router();
var auth = require('../utils/auth');

router.post('/login', UserController.login);
router.post('/logout', auth, UserController.logout);

module.exports = router;