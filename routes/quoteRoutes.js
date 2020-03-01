const express = require('express');
const router = express.Router();

const quoteController = require('../controllers/quoteControllers');
const auth = require('../middlewares/auth');

router.post('/', auth.protect, quoteController.addQuote);
router.get('/', quoteController.getQuotes);
router.get('/:id', quoteController.getQuoteById);
router.get('/user/:userId', quoteController.getQuotesByUserId);
router.patch('/:id', auth.protect, quoteController.editQuote);
router.delete('/:id', auth.protect, quoteController.deleteQuote);

module.exports = router;