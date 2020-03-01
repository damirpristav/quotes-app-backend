const express = require('express');
const router = express.Router();

const userController = require('../controllers/userControllers');
const auth = require('../middlewares/auth');

router.get('/', (req, res) => {
  res.send('User routes working');
});

router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/activateAccount/:token', userController.activateAccount);
router.get('/me', auth.protect, userController.me);
router.get('/:username', userController.getUserByUsername);
router.patch('/:id', auth.protect, userController.updateUser);
router.delete('/:id', auth.protect, userController.deleteUser);

module.exports = router;