const mongoose = require('mongoose');
/* eslint-disable prettier/prettier */
const { ObjectId } = mongoose.Schema.Types;

const reviewSchema = new mongoose.Schema({
    bookId: {
        type: ObjectId,
        required: true,
        ref: 'Book'
    },

    reviewedBy: {
        type: String,
        default: 'Guest',
        required: true
    },

    reviewedAt: {
        type: String,
        required: true
    },

    review: {
        type: String
    },
    rating: {
        type: Number,
        required: true
    },

    isDeleted: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('Review', reviewSchema);
