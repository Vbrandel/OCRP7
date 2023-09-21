const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const bookCtrl = require('../controllers/book');

router.post('/', auth, bookCtrl.createBook);
// router.post('/:id/rating', bookCtrl.averageRating);
// router.put('/:id', auth, bookCtrl.modifyBook);
// router.delete('/:id', auth, bookCtrl.deleteBook);
// router.get('/bestrating', bookCtrl.bestratingBook);
router.get('/:id', bookCtrl.getOneBook);
router.get('/', auth, bookCtrl.getAllBooks);

module.exports = router;
