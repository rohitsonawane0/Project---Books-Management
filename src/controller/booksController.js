/* eslint-disable prefer-promise-reject-errors */
/* eslint-disable prefer-const */
/* eslint-disable no-useless-escape */
/* eslint-disable prettier/prettier */
/* eslint-disable node/no-unsupported-features/es-syntax */
const moment = require('moment');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const aws = require('aws-sdk');
const jwt = require('jsonwebtoken');
const booksModel = require('../model/booksModel');
const userModel = require('../model/userModel');
const reviewModel = require('../model/reviewModel');

dotenv.config();
aws.config.update({
  accessKeyId: process.env.accessKeyId,
  secretAccessKey: process.env.secretAccessKey,
  region: 'ap-south-1'
});

const uploadFile = async function(file) {
  return new Promise(function(resolve, reject) {
    // this function will upload file to aws and return the link
    const s3 = new aws.S3({ apiVersion: '2006-03-01' }); // we will be using the s3 service of aws

    const uploadParams = {
      ACL: 'public-read',
      Bucket: 'my-product-management-project', //HERE
      Key: `book-management/${file.originalname}`, //HERE
      Body: file.buffer
    };

    s3.upload(uploadParams, function(err, data) {
      if (err) {
        return reject({ error: err });
      }
      return resolve(data.Location);
    });
  });
};
const isValid = str => {
  if (str === undefined || str == null) return false;
  if (typeof str === 'string' && str.trim().length === 0) return false;
  return true;
};
const rexIsbn = /^[1-9][0-9]{9,14}$/;
const nRegex = /^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$/;
const dateMatch = /^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[13-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/;
exports.createBook = async function(req, res) {
  try {
    let {
      title,
      excerpt,
      userId,
      ISBN,
      category,
      subcategory,
      releasedAt
    } = req.body;
    let token = req.headers['X-Api-key'];
    if (!token) token = req.headers['x-api-key'];
    if (!token)
      return res
        .status(400)
        .send({ status: false, msg: 'token must be present' });
    if (!Object.keys(req.body).length)
      return res
        .status(400)
        .send({ status: false, msg: 'body cannot be empty' });

    let { files } = req;
    if (!files.length) {
      return res.status(400).send({ status: false, msg: 'file is missing' });
    }
    const uploadedFileURL = await uploadFile(files[0]);
    if (!isValid(title)) {
      return res
        .status(400)
        .send({ status: false, msg: 'Title cannot be empty' });
    }
    const foundTitle = await booksModel.findOne({ title });
    if (foundTitle) {
      return res
        .status(400)
        .send({ status: false, msg: 'This title is alreay being used' });
    }
    if (!isValid(excerpt)) {
      return res
        .status(400)
        .send({ status: false, msg: 'excerpt cannot be empty' });
    }
    if (!isValid(userId)) {
      return res
        .status(400)
        .send({ status: false, msg: 'userId cannot be empty' });
    }
    const decodedtoken = jwt.verify(token, 'functionup-radon');
    if (decodedtoken.userId !== userId)
      return res.status(403).send({
        status: false,
        msg:
          'The Login User Are not authorize to do this Or Given Token in header Is Invalid'
      });
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).send({ status: false, msg: 'Invalid userId' });
    }

    const userFound = await userModel.findOne({ _id: userId });
    if (!userFound) {
      return res.status(400).send({ status: false, msg: 'User not found' });
    }

    if (!isValid(ISBN)) {
      return res
        .status(400)
        .send({ status: false, msg: 'ISBN cannot be empty' });
    }
    if (!rexIsbn.test(ISBN))
      return res.status(400).send({
        status: false,
        msg: 'ISBN is invalid use 10 to 15 digit ISBN'
      });
    const foundISBN = await booksModel.findOne({ ISBN });
    if (foundISBN) {
      return res
        .status(400)
        .send({ status: false, msg: 'This ISBN is already being used' });
    }

    if (!isValid(category)) {
      return res
        .status(400)
        .send({ status: false, msg: 'category cannot be empty' });
    }
    if (!nRegex.test(category)) {
      return res
        .status(400)
        .send({ status: false, msg: 'catgory contains invalid character' });
    }
    if (!isValid(subcategory)) {
      return res
        .status(400)
        .send({ status: false, msg: 'subcategory cannot be empty' });
    }
    if (!nRegex.test(subcategory)) {
      return res
        .status(400)
        .send({ status: false, msg: 'subcatgory contains invalid character' });
    }

    if (!isValid(releasedAt)) {
      return res
        .status(400)
        .send({ status: false, msg: 'releasedAt cannot be empty' });
    }
    if (!dateMatch.test(releasedAt)) {
      return res
        .status(400)
        .send({ status: false, msg: 'releasedAt is in invalid format' });
    }
    const dateParts = releasedAt.split('/');
    const dateObject = new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]);
    let bookCreated = await booksModel.create({
      title,
      excerpt,
      userId,
      ISBN,
      category,
      subcategory,
      releasedAt: dateObject,
      cover: uploadedFileURL
    });

    res
      .status(201)
      .send({ status: true, message: 'Success', data: bookCreated });
  } catch (error) {
    res.status(500).send({ status: false, msg: error.message });
  }
};

//By userId By category By subcategory
const getBooks = async function(req, res) {
  try {
    // eslint-disable-next-line prefer-const
    let { userId, category, subcategory } = req.query;
    const obj = {
      isDeleted: false
    };

    if (userId) {
      if (!mongoose.isValidObjectId(userId))
        return res
          .status(400)
          .send({ status: false, msg: 'The Format of userId is invalid' });
      const data = await userModel.findById({ _id: userId });
      if (!data)
        return res
          .status(400)
          .send({ status: false, msg: 'The userId is invalid' });
      obj.userId = userId;
    }

    if (category) {
      obj.category = category;
      category = category.toLowerCase();
    }

    if (subcategory) {
      obj.subcategory = subcategory;
      subcategory = subcategory.toLowerCase();
    }

    const data = await booksModel
      .find(obj)
      .select({
        _id: 1,
        title: 1,
        excerpt: 1,
        userId: 1,
        category: 1,
        reviews: 1,
        releasedAt: 1
      })
      .sort({ title: 'asc' });
    if (data.length === 0) {
      return res.status(404).send({
        status: false,
        msg: 'No book Found with provided information'
      });
    }

    return res
      .status(200)
      .send({ status: true, message: 'Books list', data: data });
  } catch (err) {
    res.status(500).send({ status: false, msg: err.message });
  }
};

//Get books By id
const getBooksById = async function(req, res) {
  try {
    const { bookId } = req.params;

    const obj = {
      isDeleted: false
    };
    if (bookId) {
      if (!mongoose.isValidObjectId(bookId))
        return res
          .status(400)
          .send({ status: false, msg: 'The Format of bookId is invalid' });
      const data = await booksModel.findById({ _id: bookId });
      if (!data)
        return res
          .status(404)
          .send({ status: false, msg: 'The bookId is not found' });
      obj._id = bookId;
    }
    let data = await booksModel.findOne(obj);
    const reFound = await reviewModel.find({ bookId }).select({
      _id: 1,
      bookId: 1,
      reviewedBy: 1,
      reviewAt: 1,
      review: 1,
      rating: 1
    });
    if (data == null) {
      return res.status(404).send({
        status: false,
        msg: 'No book Found with provided information '
      });
    }

    data = data.toObject();
    delete data.__v;
    data.reviewsData = reFound;

    return res
      .status(200)
      .send({ status: true, message: 'Books list', data: data });
  } catch (err) {
    res.status(500).send({ status: false, msg: err.message });
  }
};

const updateBook = async function(req, res) {
  try {
    const { bookId } = req.params;
    const data = req.body;
    if (!Object.keys(data).length) {
      return res
        .status(400)
        .send({ status: false, msg: 'Body cannot be empty' });
    }
    const { title, excerpt, releasedAt, ISBN } = data;
    if (bookId) {
      if (!mongoose.isValidObjectId(bookId))
        return res
          .status(400)
          .send({ status: false, msg: 'The Format of bookId is invalid' });
      const book = await booksModel.findById(bookId);
      if (!book)
        return res
          .status(404)
          .send({ status: false, msg: 'The bookId is not found' });
    }

    if (title) {
      const checKTitle = await booksModel.findOne({
        title: title
      });
      if (checKTitle) {
        return res.status(400).send({
          status: false,
          message: 'Book with these title is already present'
        });
      }
    }
    if (ISBN) {
      const CheckISBn = await booksModel.findOne({
        ISBN: ISBN
      });
      if (CheckISBn)
        return res.status(400).send({
          status: false,
          message: 'Book with this ISBN is already exist'
        });
    }
    const bookData = await booksModel.findOneAndUpdate(
      { _id: bookId },
      { title, excerpt, releaseAt: releasedAt, ISBN },
      { new: true }
    );

    res.status(200).send({ status: true, message: 'Success', data: bookData });
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};

//____Delete books By Id__________
const deleteBook = async function(req, res) {
  try {
    const { bookId } = req.params;
    if (bookId) {
      if (!mongoose.isValidObjectId(bookId))
        return res
          .status(400)
          .send({ status: false, msg: 'The Format of bookId is invalid' });
      const data = await booksModel.findById(bookId);
      if (!data)
        return res
          .status(404)
          .send({ status: false, msg: 'The bookId is not found' });
    }

    const find = await booksModel.findById(bookId);
    if (!find)
      return res.status(404).send({
        status: false,
        msg: 'The Id You Have Entered Is doesnot exists'
      });
    if (find.isDeleted === true)
      return res.status(404).send({
        status: false,
        msg: 'The Id You Have Entered Is doesnot exists'
      });
    const date = new Date().toISOString();
    await booksModel.findOneAndUpdate(
      { _id: bookId },
      { $set: { isDeleted: true, deletedAt: date } }
    );
    return res
      .status(200)
      .send({ status: true, message: 'Success', data: 'The book is deleted' });
  } catch (err) {
    res.status(500).send({ msg: 'Error', error: err.message });
  }
};

module.exports.deleteBook = deleteBook;
module.exports.updateBook = updateBook;
module.exports.getBooksById = getBooksById;
module.exports.getBooks = getBooks;
