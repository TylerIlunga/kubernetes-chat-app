const router = require('express').Router();
const MainController = require('../controllers/Main');

router.get('/', MainController.home);
router.get('/chat', MainController.chat);
router.get('/404', MainController.error);

module.exports = router;
