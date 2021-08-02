const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;



const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    description: {
        type: String
    }
}, {timestamps: true});



module.exports = mongoose.model('Category', categorySchema);