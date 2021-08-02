const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;



const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        index: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        index: true,
        unique: true
    },
    about: {
        type: String
    },
    role: {
        type: String,
        default: 'user'
    }
}, {timestamps: true});



module.exports = mongoose.model('User', userSchema);