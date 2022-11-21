/* eslint-disable prettier/prettier */
const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const multer = require('multer');
const route = require('./routes/route');

const app = express();
dotenv.config();
app.use(multer().any());

app.use(express.json());

mongoose
  .connect(process.env.MONGO_STRING)
  .then(() => console.log('MongoDb is connected'))
  .catch(err => console.log(err));

app.use('/', route);

app.listen(process.env.PORT || 3000, () => {
  console.log(`Express app running on port ${process.env.PORT || 3000}`);
});
