/* eslint-disable node/no-unsupported-features/es-syntax */
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const booksModel = require('../model/booksModel');

//[ALL AUTHENTICATION LOGIC HERE ]
exports.authentication = function(req, res, next) {
  try {
    const token = req.headers['x-api-key'];
    if (!token) {
      return res
        .status(400)
        .send({ status: false, message: 'Token must be present' });
    }

    jwt.verify(token, 'functionup-radon', function(error, decodedToken) {
      if (error) {
        return res
          .status(401)
          .send({ status: false, message: 'token invalid' });
      }
      req.userId = decodedToken.userId;
      next();
    });
  } catch (err) {
    res.status(500).send({ status: false, message: err.message });
  }
};

exports.authForDelAndUp = async function(req, res, next) {
  let token = req.headers['X-Api-key'];
  if (!token) token = req.headers['x-api-key'];
  //If no token is present in the request header return error
  if (!token)
    return res
      .status(400)
      .send({ status: false, msg: 'token must be present' });
  const { bookId } = req.params;
  if (!bookId)
    return res
      .status(400)
      .send({ status: false, msg: 'book id must be present' });
  if (!mongoose.isValidObjectId(bookId))
    return res.status(400).send({ status: false, msg: 'book id is invalid' });
  const curUser = await booksModel
    .findOne({ _id: bookId })
    .select({ _id: 0, userId: 1 });
  if (curUser == null)
    return res
      .status(404)
      .send({ status: false, msg: 'The BookId is not found' });
  const decodedtoken = jwt.verify(token, 'functionup-radon');
  if (curUser.userId.toString() === decodedtoken.userId) {
    next();
  } else {
    return res.status(403).send({
      status: false,
      msg:
        'The Login User Are not authorize to do this Or Given Token in header Is Invalid'
    });
  }
};
