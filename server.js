const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const tagRoutes = require('./routes/tagRoutes');
const spotRoutes = require('./routes/spotRoutes');



//INIT EXPRESS APP
const app = express();
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json({ limit: "50mb" }));



//ROUTES
app.use('/api', userRoutes);
app.use('/api', categoryRoutes);
app.use('/api', tagRoutes);
app.use('/api', spotRoutes);



//INIT MONGO DB
const db = async () => {
    try {
        const success = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false
        })
        
        console.log('DB Connected...')

    } catch (err) {
        console.log('DB connection error: ', err)
    }
}

db();



const PORT = process.env.PORT || 8000;
app.listen(PORT, console.log(`Server is running on port ${PORT}`));



