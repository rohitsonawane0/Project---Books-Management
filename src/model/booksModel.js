const mongoose = require('mongoose');
/* eslint-disable prettier/prettier */
const { ObjectId } = mongoose.Schema.Types;
const booksSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, unique: true, trim: true },
        cover:{type:String},
        excerpt: { type: String, required: true, trim: true },
        userId: { type: ObjectId, required: true, ref: 'User', trim: true },
        ISBN: { type: String, required: true, unique: true, trim: true },
        category: { type: String, required: true, trim: true, lowercase: true },
        subcategory: {
            type: [String],
            required: true,
            trim: true,
            lowercase: true
        },
        reviews: { type: Number, required: true, default: 0 },
        deletedAt: { type: String },
        isDeleted: { type: Boolean, default: false },
        releasedAt: { type: Date }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Book', booksSchema);
