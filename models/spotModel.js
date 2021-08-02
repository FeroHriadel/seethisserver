const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;



const spotSchema = new mongoose.Schema({
    category: {
        type: ObjectId,
        ref: 'Category',
        required: true
    },
    tags: [
        {type: ObjectId, ref: 'Tag'}
    ],
    title: {
        type: String,
        trim: true,
        required: true
    },
    lat: {
        type: String,
        required: true
    },
    long: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        trim: true,
        required: true,
        unique: true,
        lowercase: true,
        index: true
    },
    body: {
        type: {}, //react-quill object
        required: true
    },
    excerpt: {
        type: String
    },
    image: {
        data: Buffer,
        contentType: String
    },
    postedBy: {
        type: String
    }
}, {timestamps: true});



module.exports = mongoose.model('Spot', spotSchema);