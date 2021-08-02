const User = require('../models/userModel');
var admin = require("firebase-admin");
var serviceAccount = require("../config/topspots-a6fec-firebase-adminsdk-6p4w0-e3b2f3ddd4.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});



exports.authCheck = async (req, res, next) => {
        try {
            const authtoken = req.headers.authtoken;
            if (!authtoken) {
                return res.status(400).json({error: `No token received`})
            }

            const currentUser = await admin.auth().verifyIdToken(req.headers.authtoken);
            if (currentUser) {
                req.userEmail = currentUser.email
            }

            next();
            
        } catch (error) {
            console.log(error);
            res.status(401).json({error: 'Error. Unauthorized'})
        }
}



exports.adminCheck = async (req, res, next) => {
    try {
        //will receive req.userEmail from authCheck
        const user = await User.findOne({email: req.userEmail});
        if (!user || user.role !== 'admin') {
            return res.status(401).json({error: `Unauthorized`});
        }

        next();
        
    } catch (error) {
        console.log(error);
        res.status(500).json({error: 'Server error'})
    }
}