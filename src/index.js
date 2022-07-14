/* eslint-disable prettier/prettier */
const express = require('express');
const { default: mongoose } = require('mongoose');
const route = require('./routes/route');
const multer=require('multer')



const app = express();
app.use(multer().any())

app.use(express.json());

mongoose
    .connect(
        'mongodb+srv://wishall:vishal@atlascluster.p9u9uvd.mongodb.net/group59Database?retryWrites=true&w=majority'
    )
    .then(() => console.log('MongoDb is connected'))
    .catch(err => console.log(err));

app.use('/', route);

app.listen(process.env.PORT || 3000, function () {
    console.log(`Express app running on port ${process.env.PORT || 3000}`);
});
