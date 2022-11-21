/* eslint-disable prefer-promise-reject-errors */
/* eslint-disable node/no-unsupported-features/es-syntax */
const express = require('express');

const router = express.Router();
const { createUser, userLogin } = require('../controller/userController');
const {
  createBook,
  getBooks,
  getBooksById,
  updateBook,
  deleteBook
} = require('../controller/booksController');
const {
  createReview,
  validationsReviewEdirAndDelete,
  editReview,
  deleteReview
} = require('../controller/reviewController');
const { authentication, authForDelAndUp } = require('../middleware/auth');

router.post('/register', createUser);

router.post('/login', userLogin);

router.post('/books', authentication, createBook);

router.get('/books', authentication, getBooks);
//not in alphabetical order

router.get('/books/:bookId', authentication, getBooksById);

router.put('/books/:bookId', authentication, authForDelAndUp, updateBook);

router.delete('/books/:bookId', authentication, authForDelAndUp, deleteBook);

router.post('/books/:bookId/review', createReview);

router.put(
  '/books/:bookId/review/:reviewId',
  validationsReviewEdirAndDelete,
  editReview
);

router.delete(
  '/books/:bookId/review/:reviewId',
  validationsReviewEdirAndDelete,
  deleteReview
);

module.exports = router;
